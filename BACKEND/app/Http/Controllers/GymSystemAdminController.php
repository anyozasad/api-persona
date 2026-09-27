<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Database\ConnectionInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GymSystemAdminController extends Controller
{
    private ConnectionInterface $db;
    private $schema;

    public function __construct()
    {
        $mysql = (array) config('database.connections.mysql', []);
        config([
            'database.connections.gym_system_actions' => array_merge($mysql, [
                'database' => env('GYM_DB_DATABASE', 'gym_system'),
            ]),
        ]);

        $this->db = DB::connection('gym_system_actions');
        $this->schema = $this->db->getSchemaBuilder();
        $this->asegurarCompatibilidad();
    }

    private function asegurarCompatibilidad(): void
    {
        try {
            if ($this->schema->hasTable('ventas')) {
                $this->schema->table('ventas', function ($table) {
                    if (!$this->schema->hasColumn('ventas', 'tipo_comprobante')) $table->string('tipo_comprobante', 20)->nullable();
                    if (!$this->schema->hasColumn('ventas', 'numero_comprobante')) $table->string('numero_comprobante', 50)->nullable();
                    if (!$this->schema->hasColumn('ventas', 'numero_operacion')) $table->string('numero_operacion', 80)->nullable();
                    if (!$this->schema->hasColumn('ventas', 'estado')) $table->string('estado', 20)->default('Registrado');
                    if (!$this->schema->hasColumn('ventas', 'motivo_anulacion')) $table->string('motivo_anulacion', 255)->nullable();
                });
            }
            if ($this->schema->hasTable('asistencias')) {
                $this->schema->table('asistencias', function ($table) {
                    if (!$this->schema->hasColumn('asistencias', 'fecha_hora_salida')) $table->dateTime('fecha_hora_salida')->nullable();
                    if (!$this->schema->hasColumn('asistencias', 'estado')) $table->string('estado', 20)->default('Dentro');
                });
            }
            if ($this->schema->hasTable('usuarios')) {
                $this->schema->table('usuarios', function ($table) {
                    if (!$this->schema->hasColumn('usuarios', 'nombre_usuario')) $table->string('nombre_usuario', 100)->nullable();
                    if (!$this->schema->hasColumn('usuarios', 'dni')) $table->string('dni', 20)->nullable();
                    if (!$this->schema->hasColumn('usuarios', 'telefono')) $table->string('telefono', 30)->nullable();
                });
            }
            if (!$this->schema->hasTable('movimientos_caja')) {
                $this->schema->create('movimientos_caja', function ($table) {
                    $table->increments('id');
                    $table->unsignedInteger('caja_id');
                    $table->string('tipo', 20);
                    $table->string('origen', 50)->nullable();
                    $table->string('descripcion', 255);
                    $table->decimal('monto', 10, 2);
                    $table->dateTime('fecha_movimiento')->useCurrent();
                    $table->string('estado', 20)->default('Registrado');
                    $table->index('caja_id');
                });
            }
        } catch (\Throwable $e) {
            // Las columnas auxiliares no deben impedir que el sistema arranque.
        }
    }

    public function estado()
    {
        $tablas = ['socios','planes','suscripciones','asistencias','cajas','gastos','categorias','productos','ventas','detalle_ventas','medidas','rutinas','usuarios','configuracion'];
        return response()->json([
            'conectada' => true,
            'base_datos' => $this->db->getDatabaseName(),
            'tablas_detectadas' => array_values(array_filter($tablas, fn($t) => $this->schema->hasTable($t))),
            'funciones' => ['dashboard','socios','asistencia','caja','suscripciones','planes','gastos','inventario','categorias','punto_venta','historial_ventas','notificaciones','reportes','reporte_asistencias','usuarios','progreso','mantenimiento','configuracion','carnet','comprobante','ticket'],
        ]);
    }

    public function filtrarDashboard(Request $request)
    {
        $planes = array_filter((array)$request->input('plan_ids', []));
        $busqueda = trim((string)$request->input('busqueda', ''));
        $q = $this->db->table('suscripciones as s')
            ->join('socios as so','so.id','=','s.socio_id')
            ->join('planes as p','p.id','=','s.plan_id')
            ->whereBetween('s.fecha_fin',[today()->toDateString(),today()->addDays(7)->toDateString()])
            ->where('s.estado','activa');

        if ($busqueda !== '') $q->where('so.nombre','like','%'.$busqueda.'%');
        if ($planes) $q->whereIn('p.nombre',$planes);

        return response()->json([
            'total_socios' => $this->db->table('socios')->where('estado','activo')->count(),
            'vencimientos' => $q->select('s.id','s.fecha_fin','so.id as socio_id','so.nombre as socio','p.nombre as plan')->orderBy('s.fecha_fin')->get(),
        ]);
    }

    public function socios()
    {
        return response()->json($this->db->table('socios')->orderByDesc('id')->get()->map(fn($s) => $this->mapSocio($s))->values());
    }

    public function socio(string $id)
    {
        $s = $this->db->table('socios')->where('id',$id)->first();
        abort_if(!$s,404,'Socio no encontrado.');
        return response()->json($this->mapSocio($s));
    }

    public function fichaSocio(string $id)
    {
        $s=$this->db->table('socios')->where('id',$id)->first();
        abort_if(!$s,404,'Socio no encontrado.');

        $sus=$this->db->table('suscripciones as su')
            ->join('planes as p','p.id','=','su.plan_id')
            ->where('su.socio_id',$id)
            ->where('su.estado','activa')
            ->whereDate('su.fecha_fin','>=',today())
            ->select('su.*','p.nombre as plan_nombre','p.precio','p.duracion_dias','p.descripcion as plan_descripcion','p.estado as plan_estado')
            ->orderByDesc('su.fecha_fin')->first();

        $membresiaActual=null;
        if($sus){
            $plan=(object)['id'=>$sus->plan_id,'nombre'=>$sus->plan_nombre,'precio'=>$sus->precio,'duracion_dias'=>$sus->duracion_dias,'descripcion'=>$sus->plan_descripcion,'estado'=>$sus->plan_estado];
            $membresiaActual=['id_cliente_membresia'=>$sus->id,'fecha_inicio'=>$sus->fecha_inicio,'fecha_fin'=>$sus->fecha_fin,'estado'=>ucfirst($sus->estado),'membresia'=>$this->mapPlan($plan)];
        }

        $asistencias=$this->db->table('asistencias')->where('socio_id',$id)->orderByDesc('fecha_hora')->limit(50)->get()->map(fn($a)=>[
            'id_asistencia'=>$a->id,'fecha_hora_entrada'=>$a->fecha_hora,
            'fecha_hora_salida'=>$a->fecha_hora_salida??null,'estado'=>$a->estado??'Registrada'
        ]);

        $rutinas=$this->db->table('rutinas')->where('socio_id',$id)->orderByDesc('id')->get()->map(fn($r)=>[
            'id_rutina'=>$r->id,'nombre_rutina'=>'Rutina #'.$r->id,'objetivo'=>$r->observaciones??'Plan de entrenamiento',
            'descripcion'=>$r->observaciones,'estado'=>'Activo','entrenador'=>null,
            'dia1'=>$r->dia1,'dia2'=>$r->dia2,'dia3'=>$r->dia3,'dia4'=>$r->dia4,'dia5'=>$r->dia5,'dia6'=>$r->dia6
        ]);

        $ventas=$this->db->table('ventas as v')->where('v.socio_id',$id)->orderByDesc('v.id')->limit(50)->get()->map(fn($v)=>[
            'id_venta'=>$v->id,'tipo_comprobante'=>$v->tipo_comprobante??'Boleta',
            'numero_comprobante'=>$v->numero_comprobante?:str_pad((string)$v->id,6,'0',STR_PAD_LEFT),
            'fecha_venta'=>$v->fecha,'metodo_pago'=>ucfirst((string)$v->metodo_pago),
            'total'=>(float)$v->total,'estado'=>$v->estado??'Registrado'
        ]);

        $pagos=$this->db->table('suscripciones as su')
            ->join('planes as p','p.id','=','su.plan_id')->where('su.socio_id',$id)
            ->select('su.*','p.nombre as plan_nombre','p.precio')->orderByDesc('su.id')->get()->map(fn($x)=>[
                'id_pago'=>$x->id,'fecha_pago'=>$x->fecha_inicio,'monto'=>(float)$x->precio,
                'metodo_pago'=>'Registro de suscripción','estado_pago'=>ucfirst($x->estado),
                'cliente_membresia'=>['membresia'=>['nombre'=>$x->plan_nombre]]
            ]);

        return response()->json([
            'cliente'=>$this->mapSocio($s),
            'membresia_actual'=>$membresiaActual,
            'resumen'=>[
                'asistencias_mes'=>$this->db->table('asistencias')->where('socio_id',$id)->whereBetween('fecha_hora',[now()->startOfMonth(),now()->endOfMonth()])->count(),
                'rutinas_activas'=>$rutinas->count(),
                'sesiones_casa_mes'=>0,
                'reservas_activas'=>0,
                'total_ventas'=>round((float)$this->db->table('ventas')->where('socio_id',$id)->where(function($q){$q->whereNull('estado')->orWhere('estado','<>','Anulado');})->sum('total'),2),
                'soporte_pendiente'=>0,
            ],
            'rutinas'=>$rutinas,'asistencias'=>$asistencias,'reservas'=>[],'pagos'=>$pagos,
            'sesiones_casa'=>[],'ventas'=>$ventas,'soporte'=>[],
        ]);
    }

    public function guardarSocio(Request $request)
    {
        $d = $request->validate([
            'dni'=>'required|string|max:20','nombres'=>'required|string|max:100','apellidos'=>'nullable|string|max:100',
            'telefono'=>'nullable|string|max:30','correo'=>'nullable|email|max:100','estado'=>'nullable|string'
        ]);
        abort_if($this->db->table('socios')->where('dni',$d['dni'])->exists(),422,'El DNI ya está registrado.');

        $id = $this->db->table('socios')->insertGetId([
            'nombre'=>trim($d['nombres'].' '.($d['apellidos']??'')),'dni'=>$d['dni'],'email'=>$d['correo']??null,
            'telefono'=>$d['telefono']??null,'estado'=>$this->estadoDb($d['estado']??'Activo'),'fecha_registro'=>now()
        ]);
        return response()->json(['mensaje'=>'Socio registrado correctamente.','socio'=>$this->mapSocio($this->db->table('socios')->where('id',$id)->first())],201);
    }

    public function actualizarSocio(Request $request,string $id)
    {
        abort_if(!$this->db->table('socios')->where('id',$id)->exists(),404,'Socio no encontrado.');
        $d = $request->validate([
            'dni'=>'required|string|max:20','nombres'=>'required|string|max:100','apellidos'=>'nullable|string|max:100',
            'telefono'=>'nullable|string|max:30','correo'=>'nullable|email|max:100','estado'=>'nullable|string'
        ]);
        abort_if($this->db->table('socios')->where('dni',$d['dni'])->where('id','<>',$id)->exists(),422,'El DNI ya está registrado por otro socio.');

        $this->db->table('socios')->where('id',$id)->update([
            'nombre'=>trim($d['nombres'].' '.($d['apellidos']??'')),'dni'=>$d['dni'],'email'=>$d['correo']??null,
            'telefono'=>$d['telefono']??null,'estado'=>$this->estadoDb($d['estado']??'Activo')
        ]);
        return response()->json(['mensaje'=>'Socio actualizado correctamente.']);
    }

    public function cambiarEstadoSocio(Request $request,string $id)
    {
        abort_if(!$this->db->table('socios')->where('id',$id)->exists(),404,'Socio no encontrado.');
        $this->db->table('socios')->where('id',$id)->update(['estado'=>$this->estadoDb((string)$request->input('estado','Inactivo'))]);
        return response()->json(['mensaje'=>'Estado del socio actualizado.']);
    }

    public function planes()
    {
        return response()->json($this->db->table('planes')->orderBy('nombre')->get()->map(fn($p) => $this->mapPlan($p))->values());
    }

    public function plan(string $id)
    {
        $p=$this->db->table('planes')->where('id',$id)->first();
        abort_if(!$p,404,'Plan no encontrado.');
        return response()->json($this->mapPlan($p));
    }

    public function guardarPlan(Request $request)
    {
        $d = $request->validate(['nombre'=>'required|string|max:50','precio'=>'required|numeric|min:0','duracion_meses'=>'nullable|integer|min:1','duracion_dias'=>'nullable|integer|min:1','descripcion'=>'nullable|string','estado'=>'nullable|string']);
        $dias = (int)($d['duracion_dias']??((int)($d['duracion_meses']??1)*30));
        $id = $this->db->table('planes')->insertGetId(['nombre'=>$d['nombre'],'precio'=>$d['precio'],'duracion_dias'=>$dias,'descripcion'=>$d['descripcion']??null,'estado'=>$this->estadoDb($d['estado']??'Activo')]);
        return response()->json(['mensaje'=>'Plan creado correctamente.','plan'=>$this->mapPlan($this->db->table('planes')->where('id',$id)->first())],201);
    }

    public function actualizarPlan(Request $request,string $id)
    {
        abort_if(!$this->db->table('planes')->where('id',$id)->exists(),404,'Plan no encontrado.');
        $d = $request->validate(['nombre'=>'required|string|max:50','precio'=>'required|numeric|min:0','duracion_meses'=>'nullable|integer|min:1','duracion_dias'=>'nullable|integer|min:1','descripcion'=>'nullable|string','estado'=>'nullable|string']);
        $dias = (int)($d['duracion_dias']??((int)($d['duracion_meses']??1)*30));
        $this->db->table('planes')->where('id',$id)->update(['nombre'=>$d['nombre'],'precio'=>$d['precio'],'duracion_dias'=>$dias,'descripcion'=>$d['descripcion']??null,'estado'=>$this->estadoDb($d['estado']??'Activo')]);
        return response()->json(['mensaje'=>'Plan actualizado.']);
    }

    public function cambiarEstadoPlan(Request $request,string $id)
    {
        $this->db->table('planes')->where('id',$id)->update(['estado'=>$this->estadoDb((string)$request->input('estado','Inactivo'))]);
        return response()->json(['mensaje'=>'Estado del plan actualizado.']);
    }

    public function suscripciones()
    {
        $rows = $this->db->table('suscripciones as s')
            ->leftJoin('socios as so','so.id','=','s.socio_id')->leftJoin('planes as p','p.id','=','s.plan_id')
            ->select('s.*','so.nombre as socio_nombre','so.dni','so.email','so.telefono','so.estado as socio_estado','p.nombre as plan_nombre','p.precio','p.duracion_dias','p.descripcion as plan_descripcion','p.estado as plan_estado')
            ->orderByDesc('s.id')->get();
        return response()->json($rows->map(fn($r) => $this->mapSuscripcion($r))->values());
    }

    public function guardarSuscripcion(Request $request)
    {
        $d = $request->validate(['id_cliente'=>'required|integer','id_membresia'=>'required|integer','metodo_pago'=>'nullable|string','numero_operacion'=>'nullable|string']);
        $s = $this->db->table('socios')->where('id',$d['id_cliente'])->first();
        $p = $this->db->table('planes')->where('id',$d['id_membresia'])->first();
        abort_if(!$s||!$p,422,'Socio o plan no válido.');
        $fin = today()->addDays(max(1,(int)$p->duracion_dias));
        $id = $this->db->table('suscripciones')->insertGetId(['socio_id'=>$s->id,'plan_id'=>$p->id,'fecha_inicio'=>today()->toDateString(),'fecha_fin'=>$fin->toDateString(),'estado'=>'activa']);
        return response()->json(['mensaje'=>'Suscripción registrada correctamente.','id_suscripcion'=>$id,'fecha_fin'=>$fin->toDateString()],201);
    }

    public function cancelarSuscripcion(string $id)
    {
        $this->db->table('suscripciones')->where('id',$id)->update(['estado'=>'vencida']);
        return response()->json(['mensaje'=>'Suscripción cancelada.']);
    }

    public function exportarSuscripciones()
    {
        $rows = $this->db->table('suscripciones as s')->join('socios as so','so.id','=','s.socio_id')->join('planes as p','p.id','=','s.plan_id')
            ->select('s.id','so.nombre as socio','so.dni','p.nombre as plan','p.precio','s.fecha_inicio','s.fecha_fin','s.estado')->orderByDesc('s.id')->get();
        return $this->csv('suscripciones_gym_system.csv',['ID','Socio','DNI','Plan','Precio','Inicio','Fin','Estado'],
            $rows->map(fn($r)=>[$r->id,$r->socio,$r->dni,$r->plan,$r->precio,$r->fecha_inicio,$r->fecha_fin,$r->estado])->all());
    }

    public function asistencias()
    {
        $rows = $this->db->table('asistencias as a')->join('socios as s','s.id','=','a.socio_id')
            ->select('a.*','s.nombre as socio_nombre','s.dni','s.email','s.telefono','s.estado as socio_estado')->orderByDesc('a.fecha_hora')->limit(500)->get();
        return response()->json($rows->map(fn($r)=>$this->mapAsistencia($r))->values());
    }

    public function validarAsistencia(Request $request)
    {
        $dni = trim((string)$request->input('dni',''));
        abort_if($dni==='',422,'Ingresa un DNI.');
        $s = $this->db->table('socios')->where('dni',$dni)->first();
        abort_if(!$s,404,'DNI no encontrado.');
        $sub = $this->db->table('suscripciones as su')->join('planes as p','p.id','=','su.plan_id')->where('su.socio_id',$s->id)->where('su.estado','activa')->whereDate('su.fecha_fin','>=',today())->select('su.*','p.nombre as plan_nombre')->orderByDesc('su.fecha_fin')->first();
        return response()->json(['valido'=>(bool)$sub&&$s->estado==='activo','socio'=>$this->mapSocio($s),'suscripcion'=>$sub,'dias_restantes'=>$sub?today()->diffInDays(Carbon::parse($sub->fecha_fin),false):0]);
    }

    public function registrarAsistencia(Request $request)
    {
        $id = (int)$request->input('id_cliente',$request->input('socio_id',0));
        $s = $this->db->table('socios')->where('id',$id)->first();
        abort_if(!$s,404,'Socio no encontrado.');
        abort_if($s->estado!=='activo',422,'El socio no está activo.');
        $activa = $this->db->table('suscripciones')->where('socio_id',$id)->where('estado','activa')->whereDate('fecha_fin','>=',today())->exists();
        abort_if(!$activa,422,'El socio no tiene una suscripción activa.');
        $aid = $this->db->table('asistencias')->insertGetId(['socio_id'=>$id,'fecha_hora'=>now(),'estado'=>'Dentro']);
        return response()->json(['mensaje'=>'Ingreso registrado correctamente.','id_asistencia'=>$aid],201);
    }

    public function registrarSalida(Request $request)
    {
        $id=(int)$request->input('id_cliente',$request->input('socio_id',0));
        $a=$this->db->table('asistencias')->where('socio_id',$id)->whereNull('fecha_hora_salida')->orderByDesc('fecha_hora')->first();
        abort_if(!$a,422,'No existe una entrada abierta para este socio.');
        $this->db->table('asistencias')->where('id',$a->id)->update(['fecha_hora_salida'=>now(),'estado'=>'Salió']);
        return response()->json(['mensaje'=>'Salida registrada correctamente.']);
    }

    public function reporteAsistencias(Request $request)
    {
        $desde=$request->input('desde',now()->startOfMonth()->toDateString());
        $hasta=$request->input('hasta',today()->toDateString());
        $sid=$request->input('socio_id');
        $q=$this->db->table('asistencias as a')->join('socios as s','s.id','=','a.socio_id')->whereBetween(DB::raw('DATE(a.fecha_hora)'),[$desde,$hasta]);
        if($sid)$q->where('a.socio_id',$sid);
        $registros=$q->select('a.*','s.nombre','s.dni')->orderByDesc('a.fecha_hora')->get();
        $ranking=$this->db->table('asistencias as a')->join('socios as s','s.id','=','a.socio_id')->whereBetween(DB::raw('DATE(a.fecha_hora)'),[$desde,$hasta])->select('s.id','s.nombre',DB::raw('COUNT(*) as visitas'))->groupBy('s.id','s.nombre')->orderByDesc('visitas')->limit(5)->get();
        $porDia=$this->db->table('asistencias')->whereBetween(DB::raw('DATE(fecha_hora)'),[$desde,$hasta])->selectRaw('DATE(fecha_hora) as fecha, COUNT(*) as total')->groupBy(DB::raw('DATE(fecha_hora)'))->orderBy('fecha')->get();
        $dias=max(1,Carbon::parse($desde)->diffInDays(Carbon::parse($hasta))+1);
        return response()->json(['desde'=>$desde,'hasta'=>$hasta,'total'=>$registros->count(),'promedio_diario'=>round($registros->count()/$dias,1),'lider'=>optional($ranking->first())->nombre,'ranking'=>$ranking,'por_dia'=>$porDia,'registros'=>$registros]);
    }

    public function exportarAsistencias(Request $request)
    {
        $r=$this->reporteAsistencias($request)->getData(true);
        $rows=array_map(fn($x)=>[$x['fecha_hora']??'',$x['nombre']??'',$x['dni']??'',$x['fecha_hora_salida']??''],$r['registros']??[]);
        return $this->csv('reporte_asistencias.csv',['Entrada','Socio','DNI','Salida'],$rows);
    }

    public function cajaActual()
    {
        $c=$this->db->table('cajas')->where('estado','abierta')->orderByDesc('id')->first();
        return response()->json($c?$this->resumenCaja($c):['caja_abierta'=>false,'caja'=>null,'resumen'=>null]);
    }

    public function abrirCaja(Request $request)
    {
        $d=$request->validate(['monto_inicial'=>'required|numeric|min:0']);
        abort_if($this->db->table('cajas')->where('estado','abierta')->exists(),422,'Ya existe una caja abierta.');
        $uid=$this->usuarioGymId($request);
        abort_if(!$uid,422,'No existe un usuario administrativo en gym_system.');
        $id=$this->db->table('cajas')->insertGetId(['usuario_id'=>$uid,'monto_inicial'=>$d['monto_inicial'],'monto_final'=>0,'total_ventas'=>0,'total_gastos'=>0,'diferencia'=>0,'fecha_apertura'=>now(),'estado'=>'abierta']);
        return response()->json(['mensaje'=>'Caja abierta correctamente.','id_caja'=>$id],201);
    }

    public function movimientoCaja(Request $request)
    {
        $d=$request->validate(['tipo'=>'required|string|in:Ingreso,Egreso','origen'=>'nullable|string|max:50','descripcion'=>'required|string|max:255','monto'=>'required|numeric|min:0.01']);
        $c=$this->db->table('cajas')->where('estado','abierta')->orderByDesc('id')->first();
        abort_if(!$c,422,'No hay una caja abierta.');
        if($d['tipo']==='Egreso')$this->db->table('gastos')->insert(['descripcion'=>$d['descripcion'],'monto'=>$d['monto'],'fecha'=>today()->toDateString(),'estado'=>'creado']);
        $id=$this->db->table('movimientos_caja')->insertGetId(['caja_id'=>$c->id,'tipo'=>$d['tipo'],'origen'=>$d['origen']??'Manual','descripcion'=>$d['descripcion'],'monto'=>$d['monto'],'fecha_movimiento'=>now(),'estado'=>'Registrado']);
        return response()->json(['mensaje'=>'Movimiento registrado.','id_movimiento'=>$id],201);
    }

    public function cerrarCaja(Request $request)
    {
        $d=$request->validate(['monto_real'=>'required|numeric|min:0']);
        $c=$this->db->table('cajas')->where('estado','abierta')->orderByDesc('id')->first();
        abort_if(!$c,422,'No hay una caja abierta.');
        $r=$this->resumenCaja($c)['resumen'];
        $dif=(float)$d['monto_real']-(float)$r['monto_esperado'];
        $this->db->table('cajas')->where('id',$c->id)->update(['monto_final'=>$d['monto_real'],'total_ventas'=>$r['ventas'],'total_gastos'=>$r['gastos'],'diferencia'=>$dif,'fecha_cierre'=>now(),'estado'=>'cerrada']);
        return response()->json(['mensaje'=>'Caja cerrada correctamente.','diferencia'=>round($dif,2)]);
    }

    public function historialCaja()
    {
        return response()->json($this->db->table('cajas')->orderByDesc('id')->get()->map(function($c){
            $esp=(float)$c->monto_inicial+(float)$c->total_ventas-(float)$c->total_gastos;
            return ['id_caja'=>$c->id,'fecha_apertura'=>$c->fecha_apertura,'fecha_cierre'=>$c->fecha_cierre,'monto_inicial'=>(float)$c->monto_inicial,'monto_esperado'=>round($esp,2),'monto_real'=>(float)$c->monto_final,'estado'=>ucfirst($c->estado),'diferencia'=>(float)$c->diferencia];
        })->values());
    }

    public function gastos()
    {
        return response()->json($this->db->table('gastos')->orderByDesc('fecha')->orderByDesc('id')->get());
    }

    public function guardarGasto(Request $request)
    {
        $d=$request->validate(['descripcion'=>'required|string|max:255','monto'=>'required|numeric|min:0.01','fecha'=>'nullable|date']);
        $id=$this->db->table('gastos')->insertGetId(['descripcion'=>$d['descripcion'],'monto'=>$d['monto'],'fecha'=>$d['fecha']??today()->toDateString(),'estado'=>'creado']);
        return response()->json(['mensaje'=>'Gasto registrado correctamente.','id_gasto'=>$id],201);
    }

    public function anularGasto(Request $request,string $id)
    {
        $motivo=trim((string)$request->input('motivo_anulacion',$request->input('motivo','')));
        abort_if($motivo==='',422,'Indica el motivo de anulación.');
        $this->db->table('gastos')->where('id',$id)->update(['estado'=>'anulado','motivo_anulacion'=>$motivo]);
        return response()->json(['mensaje'=>'Gasto anulado correctamente.']);
    }

    public function categorias()
    {
        return response()->json($this->db->table('categorias')->orderBy('nombre')->get()->map(fn($c)=>['id_categoria'=>$c->id,'nombre_categoria'=>$c->nombre,'descripcion'=>'','estado'=>ucfirst($c->estado)])->values());
    }

    public function guardarCategoria(Request $request)
    {
        $nombre=trim((string)$request->input('nombre_categoria',$request->input('nombre','')));
        abort_if($nombre==='',422,'Ingresa el nombre de la categoría.');
        $id=$this->db->table('categorias')->insertGetId(['nombre'=>$nombre,'estado'=>$this->estadoDb((string)$request->input('estado','Activo'))]);
        return response()->json(['mensaje'=>'Categoría registrada.','id_categoria'=>$id],201);
    }

    public function actualizarCategoria(Request $request,string $id)
    {
        $nombre=trim((string)$request->input('nombre_categoria',$request->input('nombre','')));
        abort_if($nombre==='',422,'Ingresa el nombre de la categoría.');
        $this->db->table('categorias')->where('id',$id)->update(['nombre'=>$nombre,'estado'=>$this->estadoDb((string)$request->input('estado','Activo'))]);
        return response()->json(['mensaje'=>'Categoría actualizada.']);
    }

    public function cambiarEstadoCategoria(Request $request,string $id)
    {
        $this->db->table('categorias')->where('id',$id)->update(['estado'=>$this->estadoDb((string)$request->input('estado','Inactivo'))]);
        return response()->json(['mensaje'=>'Estado de categoría actualizado.']);
    }

    public function productos()
    {
        $rows=$this->db->table('productos as p')->leftJoin('categorias as c','c.id','=','p.categoria_id')->select('p.*','c.nombre as categoria_nombre')->orderByDesc('p.id')->get();
        return response()->json($rows->map(fn($p)=>$this->mapProducto($p))->values());
    }

    public function producto(string $id)
    {
        $p=$this->db->table('productos as p')->leftJoin('categorias as c','c.id','=','p.categoria_id')->select('p.*','c.nombre as categoria_nombre')->where('p.id',$id)->first();
        abort_if(!$p,404,'Producto no encontrado.');
        return response()->json($this->mapProducto($p));
    }

    public function guardarProducto(Request $request)
    {
        $d=$this->validarProducto($request);
        $id=$this->db->table('productos')->insertGetId($d);
        return response()->json(['mensaje'=>'Producto registrado.','id_producto'=>$id],201);
    }

    public function actualizarProducto(Request $request,string $id)
    {
        $actual=$this->db->table('productos')->where('id',$id)->first();
        abort_if(!$actual,404,'Producto no encontrado.');
        $datos=$this->validarProducto($request);
        if(!$request->has('stock')) $datos['stock']=$actual->stock;
        $this->db->table('productos')->where('id',$id)->update($datos);
        return response()->json(['mensaje'=>'Producto actualizado.']);
    }

    public function cambiarEstadoProducto(Request $request,string $id)
    {
        $this->db->table('productos')->where('id',$id)->update(['estado'=>$this->estadoDb((string)$request->input('estado','Inactivo'))]);
        return response()->json(['mensaje'=>'Estado del producto actualizado.']);
    }

    public function ajustarStock(Request $request)
    {
        $d=$request->validate(['id_producto'=>'required|integer','tipo'=>'required|string|in:Entrada,Salida','cantidad'=>'required|integer|min:1','motivo'=>'nullable|string|max:255']);
        $p=$this->db->table('productos')->where('id',$d['id_producto'])->first();
        abort_if(!$p,404,'Producto no encontrado.');
        $nuevo=$d['tipo']==='Entrada'?(int)$p->stock+(int)$d['cantidad']:(int)$p->stock-(int)$d['cantidad'];
        abort_if($nuevo<0,422,'Stock insuficiente.');
        $this->db->table('productos')->where('id',$p->id)->update(['stock'=>$nuevo]);
        return response()->json(['mensaje'=>'Stock ajustado correctamente.','stock'=>$nuevo]);
    }

    public function kardex(Request $request)
    {
        // El repositorio de referencia modifica stock directamente y no posee tabla kardex.
        // Este endpoint conserva la compatibilidad del dashboard actual sin leer otra base.
        return response()->json([]);
    }

    public function ventas()
    {
        $rows=$this->db->table('ventas as v')->leftJoin('socios as s','s.id','=','v.socio_id')->select('v.*','s.nombre as socio_nombre','s.dni','s.email','s.telefono','s.estado as socio_estado')->orderByDesc('v.id')->get();
        return response()->json($rows->map(fn($v)=>$this->mapVenta($v))->values());
    }

    public function venta(string $id)
    {
        $v=$this->db->table('ventas as v')->leftJoin('socios as s','s.id','=','v.socio_id')->where('v.id',$id)->select('v.*','s.nombre as socio_nombre','s.dni','s.email','s.telefono','s.estado as socio_estado')->first();
        abort_if(!$v,404,'Venta no encontrada.');
        $detalle=$this->db->table('detalle_ventas as d')->join('productos as p','p.id','=','d.producto_id')->where('d.venta_id',$id)->select('d.*','p.nombre as producto')->get();
        return response()->json(['venta'=>$this->mapVenta($v),'detalle'=>$detalle]);
    }

    public function registrarVenta(Request $request)
    {
        $d=$request->validate(['id_cliente'=>'nullable|integer','tipo_comprobante'=>'nullable|string|max:20','numero_comprobante'=>'nullable|string|max:50','metodo_pago'=>'required|string|max:30','numero_operacion'=>'nullable|string|max:80','items'=>'required|array|min:1','items.*.id_producto'=>'required|integer','items.*.cantidad'=>'required|integer|min:1']);
        $c=$this->db->table('cajas')->where('estado','abierta')->orderByDesc('id')->first();
        abort_if(!$c,422,'Debes abrir caja antes de registrar una venta.');

        return $this->db->transaction(function()use($d,$c){
            $total=0;$detalle=[];
            foreach($d['items'] as $item){
                $p=$this->db->table('productos')->where('id',$item['id_producto'])->lockForUpdate()->first();
                abort_if(!$p||$p->estado!=='activo',422,'Producto no disponible.');
                abort_if((int)$p->stock<(int)$item['cantidad'],422,'Stock insuficiente para '.$p->nombre.'.');
                $sub=round((float)$p->precio_venta*(int)$item['cantidad'],2);$total+=$sub;$detalle[]=[$p,(int)$item['cantidad'],$sub];
            }
            $metodo=strtolower($d['metodo_pago']);if(!in_array($metodo,['efectivo','tarjeta','transferencia'],true))$metodo='transferencia';
            $id=$this->db->table('ventas')->insertGetId(['caja_id'=>$c->id,'socio_id'=>$d['id_cliente']?:null,'total'=>round($total,2),'descuento'=>0,'metodo_pago'=>$metodo,'fecha'=>now(),'tipo_comprobante'=>$d['tipo_comprobante']??'Boleta','numero_comprobante'=>$d['numero_comprobante']?:null,'numero_operacion'=>$d['numero_operacion']??null,'estado'=>'Registrado']);
            foreach($detalle as [$p,$cant,$sub]){
                $this->db->table('detalle_ventas')->insert(['venta_id'=>$id,'producto_id'=>$p->id,'cantidad'=>$cant,'precio_unitario'=>$p->precio_venta,'subtotal'=>$sub]);
                $this->db->table('productos')->where('id',$p->id)->decrement('stock',$cant);
            }
            return response()->json(['mensaje'=>'Venta registrada correctamente.','id_venta'=>$id,'total'=>round($total,2)],201);
        });
    }

    public function anularVenta(Request $request,string $id)
    {
        $motivo=trim((string)$request->input('motivo',''));
        abort_if(strlen($motivo)<5,422,'El motivo debe tener al menos 5 caracteres.');
        return $this->db->transaction(function()use($id,$motivo){
            $v=$this->db->table('ventas')->where('id',$id)->lockForUpdate()->first();
            abort_if(!$v,404,'Venta no encontrada.');
            abort_if(strtolower((string)$v->estado)==='anulado',422,'La venta ya fue anulada.');
            foreach($this->db->table('detalle_ventas')->where('venta_id',$id)->get() as $d)$this->db->table('productos')->where('id',$d->producto_id)->increment('stock',(int)$d->cantidad);
            $this->db->table('ventas')->where('id',$id)->update(['estado'=>'Anulado','motivo_anulacion'=>$motivo]);
            return response()->json(['mensaje'=>'Venta anulada y stock restaurado.']);
        });
    }

    public function usuarios()
    {
        return response()->json($this->db->table('usuarios')->orderByDesc('id')->get()->map(fn($u)=>$this->mapUsuario($u))->values());
    }

    public function guardarUsuario(Request $request)
    {
        $d=$request->validate(['nombre_usuario'=>'required|string|max:100','nombres'=>'required|string|max:100','apellidos'=>'nullable|string|max:100','dni'=>'nullable|string|max:20','telefono'=>'nullable|string|max:30','correo'=>'required|email|max:100','contrasena'=>'required|string|min:8','rol'=>'required|string','estado'=>'nullable|string']);
        abort_if($this->db->table('usuarios')->where('email',$d['correo'])->exists(),422,'El correo ya está registrado.');
        $id=$this->db->table('usuarios')->insertGetId(['nombre'=>trim($d['nombres'].' '.($d['apellidos']??'')),'nombre_usuario'=>$d['nombre_usuario'],'dni'=>$d['dni']??null,'telefono'=>$d['telefono']??null,'email'=>$d['correo'],'password'=>Hash::make($d['contrasena']),'rol'=>$this->rolDb($d['rol']),'estado'=>$this->estadoDb($d['estado']??'Activo')]);
        return response()->json(['mensaje'=>'Usuario creado correctamente.','id_usuario'=>$id],201);
    }

    public function actualizarUsuario(Request $request,string $id)
    {
        $d=$request->validate(['nombre_usuario'=>'required|string|max:100','nombres'=>'required|string|max:100','apellidos'=>'nullable|string|max:100','dni'=>'nullable|string|max:20','telefono'=>'nullable|string|max:30','correo'=>'required|email|max:100','contrasena'=>'nullable|string|min:8','rol'=>'required|string','estado'=>'nullable|string']);
        abort_if($this->db->table('usuarios')->where('email',$d['correo'])->where('id','<>',$id)->exists(),422,'El correo ya está registrado.');
        $u=['nombre'=>trim($d['nombres'].' '.($d['apellidos']??'')),'nombre_usuario'=>$d['nombre_usuario'],'dni'=>$d['dni']??null,'telefono'=>$d['telefono']??null,'email'=>$d['correo'],'rol'=>$this->rolDb($d['rol']),'estado'=>$this->estadoDb($d['estado']??'Activo')];
        if(!empty($d['contrasena']))$u['password']=Hash::make($d['contrasena']);
        $this->db->table('usuarios')->where('id',$id)->update($u);
        return response()->json(['mensaje'=>'Usuario actualizado.']);
    }

    public function cambiarEstadoUsuario(Request $request,string $id)
    {
        $u=$this->db->table('usuarios')->where('id',$id)->first();abort_if(!$u,404,'Usuario no encontrado.');
        $estado=$this->estadoDb((string)$request->input('estado','Inactivo'));
        abort_if((int)$u->id===1&&$estado==='inactivo',422,'No se puede desactivar el administrador principal.');
        $this->db->table('usuarios')->where('id',$id)->update(['estado'=>$estado]);
        return response()->json(['mensaje'=>'Estado del usuario actualizado.']);
    }

    public function progreso(string $socioId)
    {
        $s=$this->db->table('socios')->where('id',$socioId)->first();abort_if(!$s,404,'Socio no encontrado.');
        return response()->json(['socio'=>$this->mapSocio($s),'medidas'=>$this->db->table('medidas')->where('socio_id',$socioId)->orderByDesc('fecha')->orderByDesc('id')->get(),'rutina'=>$this->db->table('rutinas')->where('socio_id',$socioId)->orderByDesc('id')->first()]);
    }

    public function guardarMedida(Request $request)
    {
        $d=$request->validate(['socio_id'=>'required|integer','peso'=>'nullable|numeric|min:0','grasa'=>'nullable|numeric|min:0','cintura'=>'nullable|numeric|min:0','brazo'=>'nullable|numeric|min:0','fecha'=>'nullable|date']);
        $d['fecha']=$d['fecha']??today()->toDateString();
        $id=$this->db->table('medidas')->insertGetId($d);
        return response()->json(['mensaje'=>'Medida registrada.','id_medida'=>$id],201);
    }

    public function eliminarMedida(string $id)
    {
        $this->db->table('medidas')->where('id',$id)->delete();
        return response()->json(['mensaje'=>'Medida eliminada.']);
    }

    public function guardarRutinaReferencia(Request $request)
    {
        $d=$request->validate(['socio_id'=>'required|integer','dia1'=>'nullable|string','dia2'=>'nullable|string','dia3'=>'nullable|string','dia4'=>'nullable|string','dia5'=>'nullable|string','dia6'=>'nullable|string','observaciones'=>'nullable|string']);
        $a=$this->db->table('rutinas')->where('socio_id',$d['socio_id'])->orderByDesc('id')->first();
        if($a){$this->db->table('rutinas')->where('id',$a->id)->update(array_merge($d,['fecha_asignacion'=>now()]));$id=$a->id;}
        else{$id=$this->db->table('rutinas')->insertGetId(array_merge($d,['fecha_asignacion'=>now()]));}
        return response()->json(['mensaje'=>'Rutina guardada correctamente.','id_rutina'=>$id]);
    }

    public function vencimientosNotificacion(Request $request)
    {
        $dias=max(1,min(30,(int)$request->input('dias',7)));
        return response()->json($this->db->table('suscripciones as s')->join('socios as so','so.id','=','s.socio_id')->join('planes as p','p.id','=','s.plan_id')->where('s.estado','activa')->whereBetween('s.fecha_fin',[today()->toDateString(),today()->addDays($dias)->toDateString()])->select('so.id','so.nombre','so.telefono','so.whatsapp_api_key','p.nombre as nombre_plan','s.fecha_fin')->orderBy('s.fecha_fin')->get());
    }

    public function guardarWhatsappKey(Request $request,string $socioId)
    {
        $d=$request->validate(['whatsapp_api_key'=>'required|string|max:100']);
        $this->db->table('socios')->where('id',$socioId)->update(['whatsapp_api_key'=>$d['whatsapp_api_key']]);
        return response()->json(['mensaje'=>'API Key guardada.']);
    }

    public function enviarWhatsapp(string $socioId)
    {
        $f=$this->db->table('suscripciones as s')->join('socios as so','so.id','=','s.socio_id')->join('planes as p','p.id','=','s.plan_id')->where('so.id',$socioId)->where('s.estado','activa')->whereDate('s.fecha_fin','>=',today())->select('so.*','p.nombre as nombre_plan','s.fecha_fin')->orderBy('s.fecha_fin')->first();
        abort_if(!$f,404,'Socio sin suscripción próxima.');
        abort_if(!$f->telefono||!$f->whatsapp_api_key,422,'El socio necesita teléfono y API Key de WhatsApp.');
        $cfg=$this->db->table('configuracion')->first();
        $msg=$this->mensajeVencimiento($f->nombre,$f->nombre_plan,$f->fecha_fin,$cfg->nombre_sistema??'Mallqui Gym');
        $resp=Http::timeout(15)->get('https://api.callmebot.com/whatsapp.php',['phone'=>preg_replace('/\s+/','',$f->telefono),'text'=>$msg,'apikey'=>$f->whatsapp_api_key]);
        return response()->json(['enviado'=>$resp->successful(),'mensaje'=>$resp->successful()?'Mensaje enviado.':'El proveedor rechazó el mensaje.','respuesta'=>Str::limit($resp->body(),300)],$resp->successful()?200:502);
    }

    public function enviarWhatsappTodos(Request $request)
    {
        $dias=max(1,min(30,(int)$request->input('dias',7)));
        $rows=$this->db->table('suscripciones as s')->join('socios as so','so.id','=','s.socio_id')->where('s.estado','activa')->whereBetween('s.fecha_fin',[today()->toDateString(),today()->addDays($dias)->toDateString()])->select('so.id','so.telefono','so.whatsapp_api_key')->get();
        $ok=0;$skip=0;
        foreach($rows as $r){if(!$r->telefono||!$r->whatsapp_api_key){$skip++;continue;}try{$resp=$this->enviarWhatsapp((string)$r->id);$resp->getStatusCode()===200?$ok++:$skip++;}catch(\Throwable $e){$skip++;}}
        return response()->json(['mensaje'=>'Proceso terminado.','enviados'=>$ok,'omitidos'=>$skip]);
    }

    public function reporteIngresos(Request $request)
    {
        $desde=$request->input('desde',now()->startOfMonth()->toDateString());$hasta=$request->input('hasta',today()->toDateString());
        $m=(float)$this->db->table('suscripciones as s')->join('planes as p','p.id','=','s.plan_id')->whereBetween('s.fecha_inicio',[$desde,$hasta])->sum('p.precio');
        $v=(float)$this->db->table('ventas')->whereBetween(DB::raw('DATE(fecha)'),[$desde,$hasta])->where(function($q){$q->whereNull('estado')->orWhere('estado','<>','Anulado');})->sum('total');
        $g=(float)$this->db->table('gastos')->whereBetween('fecha',[$desde,$hasta])->where('estado','<>','anulado')->sum('monto');
        return response()->json(['desde'=>$desde,'hasta'=>$hasta,'membresias'=>round($m,2),'ventas_productos'=>round($v,2),'total_ingresos'=>round($m+$v,2),'gastos'=>round($g,2),'utilidad'=>round($m+$v-$g,2)]);
    }

    public function reporteVencimientos(Request $request)
    {
        return $this->vencimientosNotificacion($request->merge(['dias'=>max(1,min(90,(int)$request->input('dias',7)))]));
    }

    public function configuracion()
    {
        return response()->json($this->db->table('configuracion')->first());
    }

    public function guardarConfiguracion(Request $request)
    {
        $d=$request->validate(['nombre_sistema'=>'nullable|string|max:100','nombre_gimnasio'=>'nullable|string|max:100','ruc'=>'nullable|string|max:20','direccion'=>'nullable|string|max:255','telefono'=>'nullable|string|max:30','email'=>'nullable|email|max:100','correo'=>'nullable|email|max:100','moneda'=>'nullable|string|max:10']);
        $a=$this->db->table('configuracion')->first();
        $g=['nombre_sistema'=>$d['nombre_sistema']??$d['nombre_gimnasio']??($a->nombre_sistema??'Mallqui Gym'),'ruc'=>$d['ruc']??($a->ruc??null),'direccion'=>$d['direccion']??($a->direccion??null),'telefono'=>$d['telefono']??($a->telefono??null),'email'=>$d['email']??$d['correo']??($a->email??null),'moneda'=>$d['moneda']??($a->moneda??'S/')];
        $a?$this->db->table('configuracion')->where('id',$a->id)->update($g):$this->db->table('configuracion')->insert(array_merge(['id'=>1],$g));
        return response()->json(['mensaje'=>'Configuración de gym_system actualizada.','configuracion'=>$this->db->table('configuracion')->first()]);
    }

    public function backup()
    {
        $nombre=preg_replace('/[^A-Za-z0-9\-]/','_',optional($this->db->table('configuracion')->first())->nombre_sistema??'Mallqui_Gym');
        $out="-- Backup gym_system\n-- Fecha: ".now()->format('Y-m-d H:i:s')."\n\nSET FOREIGN_KEY_CHECKS=0;\n";
        $tables=collect($this->db->select('SHOW TABLES'))->map(fn($r)=>array_values((array)$r)[0]);
        foreach($tables as $t){
            $cr=$this->db->select("SHOW CREATE TABLE `{$t}`")[0]??null;if($cr){$vals=array_values((array)$cr);$out.="\nDROP TABLE IF EXISTS `{$t}`;\n".($vals[1]??'').";\n";}
            foreach($this->db->table($t)->get() as $row){$vals=array_map(fn($v)=>$v===null?'NULL':$this->db->getPdo()->quote((string)$v),array_values((array)$row));$out.="INSERT INTO `{$t}` VALUES (".implode(',',$vals).");\n";}
        }
        $out.="\nSET FOREIGN_KEY_CHECKS=1;\n";
        return response($out,200,['Content-Type'=>'application/sql; charset=UTF-8','Content-Disposition'=>'attachment; filename="backup_'.$nombre.'_'.now()->format('Y-m-d_H-i-s').'.sql"']);
    }

    public function restaurar(Request $request)
    {
        $request->validate(['backup_file'=>'required|file|max:10240']);
        $f=$request->file('backup_file');abort_if(strtolower($f->getClientOriginalExtension())!=='sql',422,'Solo se permiten archivos .sql.');
        $sql=file_get_contents($f->getRealPath());abort_if(trim((string)$sql)==='',422,'El archivo SQL está vacío.');
        $this->db->unprepared('SET FOREIGN_KEY_CHECKS=0');try{$this->db->unprepared($sql);}finally{$this->db->unprepared('SET FOREIGN_KEY_CHECKS=1');}
        return response()->json(['mensaje'=>'Base gym_system restaurada correctamente.']);
    }

    public function limpiar()
    {
        $tabs=['asistencias','detalle_ventas','ventas','suscripciones','medidas','rutinas','socios','gastos','productos','categorias','planes','movimientos_caja','cajas'];
        $this->db->statement('SET FOREIGN_KEY_CHECKS=0');try{foreach($tabs as $t)if($this->schema->hasTable($t))$this->db->statement("TRUNCATE TABLE `{$t}`");if($this->schema->hasTable('usuarios'))$this->db->table('usuarios')->where('id','>',1)->delete();}finally{$this->db->statement('SET FOREIGN_KEY_CHECKS=1');}
        return response()->json(['mensaje'=>'Datos operativos reiniciados. Se conservó la configuración y el administrador principal.']);
    }

    public function limpiarCache()
    {
        Artisan::call('optimize:clear');
        return response()->json(['mensaje'=>'Caché de Laravel limpiada.','salida'=>trim(Artisan::output())]);
    }

    public function carnet(string $socioId)
    {
        $s=$this->db->table('socios')->where('id',$socioId)->first();abort_if(!$s,404,'Socio no encontrado.');
        $sub=$this->db->table('suscripciones as su')->join('planes as p','p.id','=','su.plan_id')->where('su.socio_id',$socioId)->orderByDesc('su.fecha_fin')->select('su.*','p.nombre as plan')->first();
        return response()->json(['tipo'=>'carnet','socio'=>$this->mapSocio($s),'suscripcion'=>$sub,'configuracion'=>$this->db->table('configuracion')->first(),'qr_texto'=>$s->dni]);
    }

    public function comprobante(string $suscripcionId)
    {
        $d=$this->db->table('suscripciones as s')->join('socios as so','so.id','=','s.socio_id')->join('planes as p','p.id','=','s.plan_id')->where('s.id',$suscripcionId)->select('s.*','so.nombre as socio','so.dni','so.email','p.nombre as plan','p.precio')->first();
        abort_if(!$d,404,'Comprobante no encontrado.');
        return response()->json(['tipo'=>'comprobante_suscripcion','datos'=>$d,'configuracion'=>$this->db->table('configuracion')->first()]);
    }

    public function ticket(string $ventaId){ return $this->venta($ventaId); }

    private function mapSocio($s):array
    {
        [$n,$a]=$this->separarNombre((string)($s->nombre??''));
        return ['id_cliente'=>(int)$s->id,'id'=>(int)$s->id,'nombres'=>$n,'apellidos'=>$a,'nombre'=>trim((string)$s->nombre),'dni'=>$s->dni,'correo'=>$s->email,'email'=>$s->email,'telefono'=>$s->telefono,'direccion'=>null,'estado'=>ucfirst((string)$s->estado),'foto'=>$s->foto??null,'whatsapp_api_key'=>$s->whatsapp_api_key??null,'fecha_registro'=>$s->fecha_registro??null];
    }

    private function mapPlan($p):array
    {
        return ['id_membresia'=>(int)$p->id,'id'=>(int)$p->id,'nombre'=>$p->nombre,'precio'=>(float)$p->precio,'duracion_dias'=>(int)$p->duracion_dias,'duracion_meses'=>max(1,(int)ceil(((int)$p->duracion_dias)/30)),'descripcion'=>$p->descripcion,'estado'=>ucfirst((string)$p->estado)];
    }

    private function mapSuscripcion($r):array
    {
        $s=(object)['id'=>$r->socio_id,'nombre'=>$r->socio_nombre??'','dni'=>$r->dni??'','email'=>$r->email??null,'telefono'=>$r->telefono??null,'estado'=>$r->socio_estado??'activo','foto'=>null,'whatsapp_api_key'=>null,'fecha_registro'=>null];
        $p=(object)['id'=>$r->plan_id,'nombre'=>$r->plan_nombre??'Plan','precio'=>$r->precio??0,'duracion_dias'=>$r->duracion_dias??30,'descripcion'=>$r->plan_descripcion??null,'estado'=>$r->plan_estado??'activo'];
        return ['id_cliente_membresia'=>(int)$r->id,'id_suscripcion'=>(int)$r->id,'cliente'=>$this->mapSocio($s),'membresia'=>$this->mapPlan($p),'fecha_inicio'=>$r->fecha_inicio,'fecha_fin'=>$r->fecha_fin,'estado'=>ucfirst((string)$r->estado)];
    }

    private function mapAsistencia($r):array
    {
        $s=(object)['id'=>$r->socio_id,'nombre'=>$r->socio_nombre??'','dni'=>$r->dni??'','email'=>$r->email??null,'telefono'=>$r->telefono??null,'estado'=>$r->socio_estado??'activo','foto'=>null,'whatsapp_api_key'=>null,'fecha_registro'=>null];
        return ['id_asistencia'=>(int)$r->id,'cliente'=>$this->mapSocio($s),'fecha_hora_entrada'=>$r->fecha_hora,'fecha_hora_salida'=>$r->fecha_hora_salida??null,'estado'=>$r->estado??(($r->fecha_hora_salida??null)?'Salió':'Dentro')];
    }

    private function mapProducto($p):array
    {
        return ['id_producto'=>(int)$p->id,'id_categoria'=>(int)$p->categoria_id,'codigo_producto'=>$p->codigo,'nombre_producto'=>$p->nombre,'descripcion'=>null,'precio_compra'=>(float)$p->precio_compra,'precio_venta'=>(float)$p->precio_venta,'stock'=>(int)$p->stock,'stock_minimo'=>5,'unidad_medida'=>'Unidad','estado'=>ucfirst((string)$p->estado),'foto'=>$p->foto,'categoria'=>['id_categoria'=>(int)$p->categoria_id,'nombre_categoria'=>$p->categoria_nombre??'']];
    }

    private function mapVenta($v):array
    {
        $cli=null;if($v->socio_id){$s=(object)['id'=>$v->socio_id,'nombre'=>$v->socio_nombre??'','dni'=>$v->dni??'','email'=>$v->email??null,'telefono'=>$v->telefono??null,'estado'=>$v->socio_estado??'activo','foto'=>null,'whatsapp_api_key'=>null,'fecha_registro'=>null];$cli=$this->mapSocio($s);}
        return ['id_venta'=>(int)$v->id,'cliente'=>$cli,'tipo_comprobante'=>$v->tipo_comprobante??'Boleta','numero_comprobante'=>$v->numero_comprobante?:str_pad((string)$v->id,6,'0',STR_PAD_LEFT),'fecha_venta'=>$v->fecha,'metodo_pago'=>ucfirst((string)$v->metodo_pago),'numero_operacion'=>$v->numero_operacion??null,'total'=>(float)$v->total,'descuento'=>(float)$v->descuento,'estado'=>$v->estado??'Registrado','motivo_anulacion'=>$v->motivo_anulacion??null];
    }

    private function mapUsuario($u):array
    {
        [$n,$a]=$this->separarNombre((string)($u->nombre??''));
        return ['id_usuario'=>(int)$u->id,'nombre_usuario'=>$u->nombre_usuario?:Str::before((string)$u->email,'@'),'nombres'=>$n,'apellidos'=>$a,'dni'=>$u->dni??'','telefono'=>$u->telefono??'','correo'=>$u->email,'rol'=>match($u->rol){'admin'=>'Administrador','entrenador'=>'Entrenador',default=>'Cliente'},'estado'=>ucfirst((string)$u->estado)];
    }

    private function validarProducto(Request $request):array
    {
        $d=$request->validate(['id_categoria'=>'required|integer','codigo_producto'=>'required|string|max:50','nombre_producto'=>'required|string|max:150','precio_compra'=>'required|numeric|min:0','precio_venta'=>'required|numeric|min:0','stock'=>'nullable|integer|min:0','estado'=>'nullable|string']);
        return ['categoria_id'=>$d['id_categoria'],'codigo'=>$d['codigo_producto'],'nombre'=>$d['nombre_producto'],'precio_compra'=>$d['precio_compra'],'precio_venta'=>$d['precio_venta'],'stock'=>$d['stock']??0,'estado'=>$this->estadoDb($d['estado']??'Activo')];
    }

    private function resumenCaja($c):array
    {
        $desde=Carbon::parse($c->fecha_apertura);
        $ventas=(float)$this->db->table('ventas')->where('fecha','>=',$desde)->where(function($q){$q->whereNull('estado')->orWhere('estado','<>','Anulado');})->sum('total');
        $gastos=(float)$this->db->table('gastos')->where('fecha','>=',$desde->toDateString())->where('estado','<>','anulado')->sum('monto');
        $ing=(float)$this->db->table('movimientos_caja')->where('caja_id',$c->id)->where('tipo','Ingreso')->sum('monto');
        $mov=$this->db->table('movimientos_caja')->where('caja_id',$c->id)->orderByDesc('fecha_movimiento')->get();
        $esp=(float)$c->monto_inicial+$ventas+$ing-$gastos;
        return ['caja_abierta'=>true,'caja'=>['id_caja'=>$c->id,'fecha_apertura'=>$c->fecha_apertura,'monto_inicial'=>(float)$c->monto_inicial,'estado'=>'Abierta','movimientos'=>$mov],'resumen'=>['monto_inicial'=>(float)$c->monto_inicial,'ventas'=>round($ventas,2),'gastos'=>round($gastos,2),'ingresos_extra'=>round($ing,2),'monto_esperado'=>round($esp,2)]];
    }

    private function usuarioGymId(Request $request):?int
    {
        $correo=$request->user()->correo??$request->user()->email??null;
        if($correo){$id=$this->db->table('usuarios')->where('email',$correo)->value('id');if($id)return(int)$id;}
        $id=$this->db->table('usuarios')->where('rol','admin')->where('estado','activo')->value('id');
        return $id?(int)$id:null;
    }

    private function separarNombre(string $nombre):array
    {
        $p=preg_split('/\s+/',trim($nombre),2);return[$p[0]??'',$p[1]??''];
    }

    private function estadoDb(string $e):string { return strtolower($e)==='activo'?'activo':'inactivo'; }
    private function rolDb(string $r):string { $r=strtolower($r);return str_contains($r,'admin')?'admin':(str_contains($r,'entren')?'entrenador':'recepcionista'); }

    private function mensajeVencimiento(string $nombre,string $plan,string $fecha,string $gym):string
    {
        return "⚠️ {$gym}\n\nHola {$nombre}. Tu membresía {$plan} vence el ".Carbon::parse($fecha)->format('d/m/Y').". Renuévala a tiempo para continuar con tus beneficios.";
    }

    private function csv(string $archivo,array $cabecera,array $filas)
    {
        $h=fopen('php://temp','r+');fwrite($h,"\xEF\xBB\xBF");fputcsv($h,$cabecera,';');foreach($filas as $f)fputcsv($h,$f,';');rewind($h);$c=stream_get_contents($h);fclose($h);
        return response($c,200,['Content-Type'=>'text/csv; charset=UTF-8','Content-Disposition'=>'attachment; filename="'.$archivo.'"']);
    }
}
