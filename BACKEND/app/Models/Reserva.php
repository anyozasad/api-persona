<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Reserva extends Model
{
    /**
     * En instalaciones antiguas, reservas tiene un identificador AUTO_INCREMENT
     * llamado id u otro nombre. Mantenerlo protege las filas anteriores.
     * La migracion agrega id_reserva unico sin cambiar la clave heredada.
     */
    protected static function booted(): void
    {
        static::created(function (self $reserva): void {
            $conexion = $reserva->getConnection();
            if (!in_array($conexion->getDriverName(), ['mysql', 'mariadb', 'sqlite'], true)) {
                return;
            }
            if (!Schema::hasColumn('reservas', 'id_reserva')) {
                return;
            }

            $antiguo = null;
            if ($conexion->getDriverName() === 'sqlite') {
                $antiguo = Schema::hasColumn('reservas', 'id') ? 'id' : null;
            } else {
                foreach ($conexion->select('SHOW COLUMNS FROM `reservas`') as $campo) {
                    if (str_contains(strtolower((string) ($campo->Extra ?? '')), 'auto_increment')) {
                        $antiguo = (string) $campo->Field;
                        break;
                    }
                }
            }

            if (!$antiguo || $antiguo === 'id_reserva' || !preg_match('/^[a-zA-Z0-9_]+$/', $antiguo)) {
                return;
            }

            // Eloquent recupera el ultimo AUTO_INCREMENT del motor como ID.
            // Reflejarlo en id_reserva hace que las relaciones y actualizaciones
            // sigan utilizando el campo esperado por el modulo de reservas.
            $id = (int) $reserva->getKey();
            if ($id > 0) {
                $conexion->table('reservas')
                    ->where($antiguo, $id)
                    ->whereNull('id_reserva')
                    ->update(['id_reserva' => $id]);
            }
        });
    }

    protected $table = 'reservas';
    protected $primaryKey = 'id_reserva';
    public $timestamps = false;

    protected $fillable = [
        'id_cliente', 'id_clase', 'fecha_clase', 'fecha_reserva', 'estado'
    ];

    protected $casts = [
        'fecha_clase' => 'date',
        'fecha_reserva' => 'datetime',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class, 'id_cliente', 'id_cliente');
    }

    public function clase()
    {
        return $this->belongsTo(Clase::class, 'id_clase', 'id_clase');
    }
}
