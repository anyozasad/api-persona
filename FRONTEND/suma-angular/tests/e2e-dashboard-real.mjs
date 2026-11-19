/**
 * Prueba del dashboard Angular y API Laravel REALES, no mocks.
 * Solo puede ejecutarse en GitHub Actions con MySQL temporal.
 */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

if (process.env.CI !== 'true' || process.env.DB_DATABASE !== 'mallqui_gym_e2e') {
  throw new Error('Solo se permite en base temporal de CI.');
}
const base='http://127.0.0.1:4200';
const usuario='admin_pruebas_e2e';
const clave=process.env.E2E_ADMIN_PASSWORD;
if (!clave) throw new Error('Falta clave E2E temporal.');

await fs.mkdir('evidencias-dashboard',{recursive:true});
const incidencias=[];
const pasos=[];
const browser=await chromium.launch({headless:true});
try {
  const context=await browser.newContext({viewport:{width:1440,height:900},locale:'es-PE'});
  const page=await context.newPage();
  page.on('pageerror',error=>incidencias.push({tipo:'javascript',detalle:error.message,url:page.url()}));
  page.on('response',response=>{
    if(response.url().includes('/api/') && response.status()>=500){
      incidencias.push({tipo:'api',detalle:'HTTP '+response.status(),url:response.url()});
    }
  });

  async function paso(nombre,fn){
    await fn();
    pasos.push({nombre,resultado:'OK',fecha:new Date().toISOString()});
    console.log('OK: '+nombre);
  }
  async function pantalla(ruta,esperado,nombre){
    await page.goto(base+ruta,{waitUntil:'domcontentloaded'});
    await page.locator('.mg-current-topbar h1').waitFor({timeout:25000});
    const titulo=String(await page.locator('.mg-current-topbar h1').first().textContent()||'').trim();
    assert.ok(titulo && titulo.toLowerCase()!=='dashboard',nombre+' volvió incorrectamente al Dashboard: '+titulo);
    assert.ok(page.url().endsWith(ruta),nombre+' cambió incorrectamente la URL: '+page.url());
    if(esperado){
      const body=(await page.locator('body').innerText()).toLowerCase();
      assert.ok(body.includes(esperado.toLowerCase()),nombre+' sin contenido del módulo: '+esperado);
    }
    await page.screenshot({
      path:'evidencias-dashboard/'+nombre.replaceAll(' ','_')+'.png',
      fullPage:true,animations:'disabled'
    });
  }

  await paso('Angular abre login',async()=>{
    await page.goto(base+'/login',{waitUntil:'domcontentloaded'});
    await page.locator('input[name="email"]').fill(usuario);
    await page.locator('input[name="password"]').fill(clave);
    await page.locator('.mq-login-submit').click();
    await page.waitForURL('**/admin',{timeout:30000});
    await page.locator('.mg-current-topbar h1').waitFor({timeout:30000});
    await page.screenshot({path:'evidencias-dashboard/Inicio_Dashboard.png',fullPage:true});
  });

  await paso('Panel inicia con indicadores y gráficos sin controles duplicados',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    await page.locator('.mg-efsrt-kpis').waitFor({timeout:25000});
    assert.equal(await page.locator('.mg-efsrt-kpis article').count(),4,
      'El inicio debe conservar cuatro indicadores reales.');
    assert.equal(await page.locator('.mg-efsrt-actions button').count(),0,
      'Los accesos rápidos no deben duplicar el menú lateral.');
    assert.equal(await page.locator('.mg-efsrt-work').count(),0,
      'La sección antigua de seis botones debe desaparecer.');
    const alertas=page.locator('.mg-efsrt-pulse');
    if(await alertas.count() > 0) {
      const prioridades=page.locator('.mg-efsrt-pulse-items .mg-pulse-item');
      assert.ok(await prioridades.count()>0 && await prioridades.count()<=3,
        'Mostrar solo alertas con cantidades reales.');
      assert.equal(await page.locator('.mg-efsrt-pulse-items button').count(),0,
        'Las alertas no deben ser otra barra con botones repetidos.');
    }
    await page.locator('.mg-premium-analytics-grid .mg-premium-card').first()
      .waitFor({timeout:20000});
    assert.equal(await page.locator('.mg-premium-analytics-grid .mg-premium-card').count(),3,
      'Los tres gráficos del gimnasio deben aparecer después de los KPI.');
    const encabezado=await page.locator('.mg-efsrt-hero').boundingBox();
    assert.ok(encabezado && encabezado.height<165,'El encabezado no debe ocultar la información útil.');
    await page.screenshot({
      path:'evidencias-dashboard/20_Panel_operativo_compacto.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('API Laravel + MySQL están disponibles',async()=>{
    const res=await context.request.get(base+'/api/estado-sistema');
    assert.equal(res.status(),200);
    const data=await res.json();
    assert.equal(data.api,true);
    assert.equal(data.database,true);
    assert.equal(data.operativo,true,
      'No están todas las tablas necesarias: '+JSON.stringify(data.faltantes));
  });

  await paso('Semanas 08 y 10: portada usa imágenes locales aun bloqueando fotos externas',async()=>{
    const solicitudesExternas=[];
    await page.route('**/*',async ruta=>{
      const url=new URL(ruta.request().url());
      if(!['localhost','127.0.0.1'].includes(url.hostname)
        && /\.(?:png|jpe?g|webp|gif|svg)$/i.test(url.pathname)) {
        solicitudesExternas.push(url.href);
        return ruta.abort();
      }
      return ruta.continue();
    });
    try {
      await page.goto(base+'/',{waitUntil:'domcontentloaded'});
      const fotos=page.locator('.mq-hero-bg');
      await fotos.first().waitFor({timeout:20000});
      assert.equal(await fotos.count(),3,'La portada debe conservar las tres fotografías del gimnasio.');
      const rutas=await fotos.evaluateAll(imagenes=>imagenes.map(img=>img.getAttribute('src')||''));
      assert.ok(rutas.every(src=>src.startsWith('/assets/mallqui/')),
        'Las imágenes principales deben ser recursos locales, no URLs externas.');
      await fotos.first().evaluate(imagen=>new Promise((resolve,reject)=>{
        if(imagen.complete) return imagen.naturalWidth>0
          ? resolve(true):reject(new Error('Foto de portada local dañada o ausente'));
        imagen.addEventListener('load',()=>resolve(true),{once:true});
        imagen.addEventListener('error',()=>reject(new Error('No cargó la portada local')),{once:true});
      }));
      assert.equal(solicitudesExternas.length,0,
        'La portada no debe solicitar imágenes alojadas en Internet.');
    } finally {
      await page.unroute('**/*');
    }
  });

  await paso('EFSRT lista exactamente once semanas y sus pendientes reales',async()=>{
    await page.goto(base+'/verificacion-efsrt',{waitUntil:'domcontentloaded'});
    const semanas=page.locator('.efsrt-week-card');
    await semanas.first().waitFor({timeout:25000});
    const selector=page.getByRole('combobox',{name:'Seleccionar semana EFSRT'});
    assert.equal(await selector.locator('option').count(),11,
      'Las once semanas permanecen disponibles sin once tarjetas repetidas.');
    assert.equal(await semanas.count(),1,
      'El administrador debe ver solamente la semana que está revisando.');
    for(const numero of [5,9,10,11]){
      await selector.selectOption(String(numero));
      const semana=semanas.first();
      assert.match(await semana.locator('.efsrt-week-top').innerText(),
        new RegExp('Semana '+String(numero).padStart(2,'0')));
      await semana.locator('.efsrt-week-activities summary').click();
      assert.equal(await semana.locator('.efsrt-week-activities li').count(),5,
        'Semana '+numero+' debe conservar sus cinco actividades EFSRT.');
      if(numero===5){
        assert.match(await semana.locator('.efsrt-week-activities').innerText(),/Imagen de producto/);
      }
      if(numero===10){
        assert.match(await semana.innerText(),/SUNAT/);
      }
    }
    assert.equal(await page.locator('.efsrt-table button.efsrt-module-link').count(),10,
      'Las diez áreas deben seguir accesibles por su nombre.');
    assert.equal(await page.locator('.efsrt-table button').filter({hasText:'Abrir módulo'}).count(),0,
      'La revisión no debe saturar la pantalla con botones genéricos.');
    assert.match(await page.locator('.efsrt-summary').innerText(),/Semanas con observaciones/,
      'El resumen debe indicar semanas pendientes, no afirmar que no existen problemas.');
    const revision=await page.locator('.efsrt-weekly').innerText();
    assert.match(revision,/Pendiente|Verificar en equipo/);
    const [archivoDescargado]=await Promise.all([
      page.waitForEvent('download',{timeout:25000}),
      page.getByRole('button',{name:'Descargar revisión CSV'}).click()
    ]);
    assert.match(archivoDescargado.suggestedFilename(),/mallqui-gym-revision-11-semanas/);
    const archivoCsv=await fs.readFile(await archivoDescargado.path(),'utf8');
    assert.match(archivoCsv,/Semana";"Actividad";"Estado/);
    assert.match(archivoCsv,/Verificación manual|Pendiente/);
    await page.screenshot({
      path:'evidencias-dashboard/18_Revision_11_Semanas_EFSRT.png',
      fullPage:true,animations:'disabled'
    });
  });

  const modulos=[
    ['/clientes','Socios','01_Socios'],
    ['/productos','Gestión de Productos','02_Productos'],
    ['/pagos','Pagos','03_Pagos'],
    ['/reservas','Reservas','04_Reservas'],
    ['/membresias','Membresías','05_Membresias'],
    ['/rutinas','Rutinas','06_Rutinas'],
    ['/asistencias','Asistencias','07_Asistencias'],
    ['/caja','Caja','08_Caja'],
    ['/reportes','Reportes','09_Reportes'],
    ['/usuarios','Usuarios','10_Usuarios'],
    ['/entrenadores','Entrenadores','22_Entrenadores'],
    ['/clases','Clases','23_Clases'],
    ['/categorias','Categorías','24_Categorias'],
    ['/proveedores','Proveedores','25_Proveedores'],
    ['/compras','Compras','26_Compras'],
    ['/ventas','Ventas','27_Ventas'],
    ['/kardex','Kardex','28_Kardex'],
    ['/auditoria','Auditoría','29_Auditoria']
  ];
  for(const [ruta,contenido,nombre] of modulos){
    await paso('Ruta '+ruta+' abre módulo propio',()=>pantalla(ruta,contenido,nombre));
  }

  await paso('El dashboard muestra causa exacta de MySQL desconectado',async()=>{
    let solicitudesSimuladas=0;
    await page.route('**/api/estado-sistema**',async ruta=>{
      solicitudesSimuladas++;
      await ruta.fulfill({
        status:200,contentType:'application/json',
        body:JSON.stringify({
          api:true,database:false,operativo:false,
          base_datos:'gym_system',faltantes:[],
          mensaje:'MySQL no disponible para esta prueba de diagnóstico'
        })
      });
    });
    try{
      await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
      await page.locator('.mg-efsrt-dashboard').waitFor({timeout:12000});
      const aviso=page.locator('.mg-operational-diagnostic');
      try {
        await aviso.waitFor({timeout:15000});
      } catch(e) {
        const estado=await page.locator('.mg-efsrt-connection').allTextContents();
        const cuerpo=(await page.locator('body').innerText()).slice(0,1300);
        throw new Error('Diagnóstico no visible. solicitudesSimuladas='+solicitudesSimuladas+
          ', url='+page.url()+', etiqueta='+JSON.stringify(estado)+
          ', pantalla='+cuerpo+'; '+String(e));
      }
      assert.ok(solicitudesSimuladas>0,'La prueba debe interceptar la API del estado real.');
      await assert.doesNotReject(async()=>{
        const texto=await aviso.innerText();
        assert.match(texto,/MySQL sin conexión/);
        assert.match(texto,/Enciende MySQL en XAMPP/);
        assert.match(texto,/gym_system/);
        assert.doesNotMatch(texto,/Laravel no responde/);
      });
      await page.screenshot({
        path:'evidencias-dashboard/37_Diagnostico_MySQL_claro.png',
        fullPage:true,animations:'disabled'
      });
    }finally{
      await page.unroute('**/api/estado-sistema**');
    }
  });

  await paso('Menú TEC-SGI: tareas directas y administración separada',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.waitFor({timeout:20000});
    assert.equal(await menu.locator('.mg-direct-home').count(),1);
    assert.equal(await menu.locator('.mg-nav-primary').count(),5,
      'La pantalla inicial no debe mostrar siete grupos ni decenas de botones.');
    assert.deepEqual(await menu.locator('.mg-nav-primary').evaluateAll(nodes=>
      nodes.map(node=>node.getAttribute('aria-label'))),[
      'Socios','Reservas','Productos','Pagos','Reportes'
    ]);
    assert.equal(await menu.locator('.cf-nav-group-head').count(),0,
      'Los módulos secundarios permanecen plegados.');
    assert.deepEqual(await menu.locator('.mg-nav-caption').allTextContents(),
      ['INICIO','SOCIOS Y SESIONES','PRODUCTOS Y COBROS','RESULTADOS','GESTIÓN COMPLETA']);
    assert.equal(await menu.getByText('Todas las funciones',{exact:true}).count(),0);
    assert.equal(await page.locator('.mg-current-sidebar button.mg-brand').count(),0,
      'El logotipo no debe repetir el botón Inicio.');
    const primario=menu.getByRole('button',{name:'Productos',exact:true});
    await primario.click();
    await page.locator('.productos-page').waitFor({timeout:20000});
    assert.equal(await page.locator('.mg-current-topbar h1').innerText(),'Productos');
    assert.equal(await primario.getAttribute('aria-current'),'page');
    await page.waitForURL(url=>new URL(url).searchParams.get('modulo')==='productos',{timeout:10000});
    assert.equal(new URL(page.url()).searchParams.get('modulo'),'productos',
      'La URL debe recordar el módulo que el administrador abrió.');
    await page.reload({waitUntil:'domcontentloaded'});
    await page.locator('.productos-page').waitFor({timeout:20000});
    assert.equal(await page.locator('.mg-current-topbar h1').innerText(),'Productos',
      'Al recargar se conserva Productos en vez de devolver al inicio.');
    const refresco=page.waitForResponse(r=>r.url().includes('/api/productos') && r.status()===200,{timeout:20000});
    await page.getByRole('button',{name:'Actualizar módulo actual'}).click();
    await refresco;
    assert.equal(await page.locator('.mg-current-topbar h1').innerText(),'Productos');
    assert.equal(await page.locator('.mg-module-shell-actions button').count(),1,
      'Un solo control de actualización por módulo.');
    await page.screenshot({path:'evidencias-dashboard/13_Menu_cuatro_tareas_directas.png',fullPage:true});
  });

  await paso('Centro de aplicaciones tiene seis tareas y 44 módulos accesibles sin duplicar pestañas',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menu.locator('#mg-modulo-selector').selectOption('aplicaciones');
    const apps=page.locator('app-admin-applications');
    await apps.waitFor({timeout:15000});
    assert.equal(await page.locator('.mg-module-shell-head').count(),0,
      'Aplicaciones no necesita otra cabecera con estado y botón Inicio.');
    assert.equal(await apps.locator('.mg-app-overview').count(),0,
      'No repetir indicadores del dashboard dentro del directorio de módulos.');
    assert.equal(await apps.locator('.mg-app-tabs').count(),0,
      'No debe aparecer una segunda barra de navegación con cinco pestañas.');
    assert.equal(await apps.locator('.mg-app-header-actions').count(),0,
      'El módulo no debe repetir los botones Inicio y Actualizar.');
    assert.equal(await apps.locator('.mg-app-grid .mg-app-tile').count(),6,
      'Solo mostrar seis tareas complementarias al entrar.');
    await page.screenshot({
      path:'evidencias-dashboard/39_Centro_aplicaciones_seis_tareas.png',
      fullPage:true,animations:'disabled'
    });
    const buscar=apps.getByRole('searchbox',{name:'Buscar aplicaciones'});
    await buscar.fill('nutrición');
    assert.equal(await apps.locator('.mg-app-grid .mg-app-tile').count(),1,
      'Buscar una función debe permitir encontrar un módulo que no es frecuente.');
    await buscar.fill('');
    await apps.locator('.mg-app-directory-toggle').click();
    assert.equal(await apps.locator('.mg-app-grid .mg-app-tile').count(),44,
      'El directorio completo conserva los 44 destinos al expandirse.');
    await apps.locator('.mg-app-directory-toggle').click();
    assert.equal(await apps.locator('.mg-app-grid .mg-app-tile').count(),6);
  });

  await paso('Actualizar global recarga las tareas reales del servidor',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menu.locator('#mg-modulo-selector').selectOption('tareas-admin');
    await page.locator('app-admin-applications .mg-app-kanban').waitFor({timeout:15000});
    const respuesta=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/tareas')
      && r.request().method()==='GET',{timeout:25000});
    await page.getByRole('button',{name:'Actualizar módulo actual'}).click();
    assert.equal((await respuesta).status(),200);
    assert.equal(await page.locator('app-admin-applications .mg-app-header-actions').count(),0);
  });

  await paso('Búsqueda sencilla lleva a la pantalla correcta sin abrir submenús',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const buscador=page.getByRole('textbox',{name:'Buscar módulo del panel'});
    await buscador.fill('inventario');
    const resultados=page.locator('.mg-mantis-search-results');
    await resultados.waitFor({timeout:10000});
    assert.equal(await resultados.getByRole('option').first().innerText().then(t=>/inventario/i.test(t)),true,
      'Inventario debe aparecer antes que Ventas cuando se escribe inventario.');
    await buscador.press('Enter');
    assert.equal(await page.locator('.mg-current-topbar h1').innerText(),'Inventario');
    assert.equal(await page.locator('.mg-nav-advanced-content').count(),0,
      'La búsqueda no debe abrir menús laterales adicionales.');
    assert.equal(await page.locator('.mg-mantis-breadcrumb').count(),0,
      'No debe repetirse la ruta del módulo en varias cabeceras.');
  });

  await paso('Administración conserva reportes, usuarios, auditoría, configuración y respaldo',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    assert.equal(await menu.getByRole('button',{name:'Reportes',exact:true}).count(),1);
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    const selector=menu.locator('#mg-modulo-selector');
    await selector.waitFor({timeout:10000});
    assert.equal(await selector.locator('optgroup').count(),7,
      'Las siete áreas siguen disponibles dentro de un único selector.');
    assert.equal(await selector.locator('option[value="configuracion"]').count(),1,
      'Configuración debe seguir disponible sin saturar el menú principal.');
    await selector.selectOption('configuracion');
    const configuracion=page.locator('.config-page');
    await configuracion.waitFor({timeout:15000});
    await configuracion.getByRole('button',{name:'Usuarios y permisos'}).waitFor({timeout:25000});
    for(const herramienta of [
      'Usuarios y permisos','Historial de actividad',
      'Gestionar respaldos','Diagnóstico avanzado'
    ])assert.equal(await configuracion.getByRole('button',{name:herramienta}).count(),1,
      'Falta herramienta funcional: '+herramienta);
    await page.screenshot({path:'evidencias-dashboard/21_Configuracion_sin_modulos_duplicados.png',
      fullPage:true,animations:'disabled'});
  });

  await paso('Siete áreas avanzadas conservan las funciones sin repetir los cinco accesos directos',async()=>{
    const grupos=[
      {area:'Socios y membresías',frecuente:'Membresías',adicional:'Planes y tarifas',total:5},
      {area:'Clases y entrenamiento',frecuente:'Clases y horarios',adicional:'Seguimiento',total:6},
      {area:'Productos e inventario',frecuente:'Control de inventario',adicional:'Proveedores',total:6},
      {area:'Ventas y caja',frecuente:'Apertura y cierre de caja',adicional:'Comprobantes internos',total:7},
      {area:'Atención al socio',frecuente:'Consultas y soporte',adicional:'Eventos',total:6},
      {area:'Administración',frecuente:'Usuarios y permisos',adicional:'Auditoría',total:6},
      {area:'Organización interna',frecuente:'Calendario',adicional:'Tablas avanzadas',total:5}
    ];
    for(const grupo of grupos){
      await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
      const menu=page.locator('.mg-clear-navigation');
      await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
      const selector=menu.locator('#mg-modulo-selector');
      assert.equal(await selector.locator('optgroup[label="'+grupo.area+'"] option').count(),grupo.total,
        'Faltan funciones del grupo '+grupo.area);
      await selector.selectOption({label:grupo.frecuente});
      assert.notEqual(await page.locator('.mg-current-topbar h1').innerText(),'Inicio');
      assert.equal(await menu.locator('#mg-modulo-selector').count(),0,
        'El selector debe cerrarse al abrir una pantalla.');
      await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
      await menu.locator('#mg-modulo-selector').selectOption({label:grupo.adicional});
      assert.notEqual(await page.locator('.mg-current-topbar h1').innerText(),'Inicio');
      assert.equal(await menu.locator('#mg-modulo-selector').count(),0,
        'Una pantalla abierta no debe quedar tapada por la lista de módulos.');
      await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
      const seleccionado=await menu.locator('#mg-modulo-selector option:checked').innerText();
      assert.equal(seleccionado.trim(),grupo.adicional,
        'El selector debe recordar qué módulo está activo.');
    }
  });

  await paso('Gastos no inventa cierres ni permite egresos sin caja verificada',async()=>{
    await page.goto(base+'/gastos',{waitUntil:'domcontentloaded'});
    await page.locator('.mg-current-topbar h1').waitFor({timeout:20000});
    await page.locator('.mg-current-workspace').waitFor({timeout:20000});
    // La pantalla primero muestra "Consultando"; no confundir ese estado
    // temporal con un error de caja ni capturarlo como resultado final.
    await page.locator('.expense-fetch-note').waitFor({state:'hidden',timeout:25000});
    const error=await page.locator('.expense-fetch-note').count();
    assert.equal(error,0,'La consulta a MySQL para Gastos debe funcionar.');
    const bloque=page.locator('.operation-locked-state');
    if(await bloque.count()){
      const texto=await bloque.innerText();
      assert.match(texto,/caja abierta|estado actual no coinciden/i);
      const titulo=await bloque.locator('.operation-locked-side h3').innerText();
      assert.ok(titulo!=='Caja #','La última caja no puede mostrar un número vacío.');
    }
    await page.screenshot({
      path:'evidencias-dashboard/31_Gastos_estado_caja_real.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('Configuración guarda en MySQL y sincroniza el portal real',async()=>{
    await page.goto(base+'/configuracion',{waitUntil:'domcontentloaded'});
    const config=page.locator('.config-page');
    await config.locator('input[name=cfg_frase]').waitFor({timeout:25000});
    const mensaje='Mallqui Gym - información verificada en la prueba de integración';
    await config.locator('input[name=cfg_frase]').fill(mensaje);
    const [guardado]=await Promise.all([
      page.waitForResponse(r=>r.url().includes('/api/configuracion') && r.request().method()==='PUT',{timeout:25000}),
      config.getByRole('button',{name:'Guardar configuración en MySQL'}).click()
    ]);
    assert.equal(guardado.status(),200,'Laravel debe confirmar que la configuración fue guardada.');
    await page.reload({waitUntil:'domcontentloaded'});
    await config.locator('input[name=cfg_frase]').waitFor({timeout:25000});
    assert.equal(await config.locator('input[name=cfg_frase]').inputValue(),mensaje,
      'La configuración debe conservarse después de actualizar el navegador.');
    const respuesta=await context.request.get(base+'/api/informacion-gym');
    assert.equal(respuesta.status(),200);
    const info=await respuesta.json();
    assert.equal(info.frase_publicitaria,mensaje,
      'La portada del usuario debe recibir los mismos datos guardados por el administrador.');
    assert.equal(await config.locator('.config-fetch-status.warning').count(),0);
    await page.screenshot({
      path:'evidencias-dashboard/32_Configuracion_persistida_en_MySQL.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('Configuración conserva siete secciones sin API y no guarda datos ficticios',async()=>{
    let intercepciones=0;
    await page.route('**/api/configuracion**',async route=>{
      if(route.request().method()==='GET'){
        intercepciones++;
        await route.fulfill({status:503,contentType:'application/json',
          body:JSON.stringify({codigo:'CONFIGURACION_TABLA_AUSENTE',
            mensaje:'Falta la tabla configuracion_sistema',configuracion:null})});
      }else await route.continue();
    });
    await page.goto(base+'/configuracion',{waitUntil:'domcontentloaded'});
    const config=page.locator('.config-page');
    await config.locator('.config-fetch-status.warning').waitFor({timeout:25000});
    assert.ok(intercepciones>0,'Debe interceptarse la consulta real de configuración.');
    await config.getByText('Datos del gimnasio',{exact:true}).waitFor({timeout:15000});
    for(const nombre of [
      'Datos del gimnasio','Horario de atención','Reglas operativas',
      'Notificaciones internas','Seguridad del administrador',
      'Respaldo y mantenimiento','Información del sistema'
    ])assert.equal(await config.getByRole('heading',{name:nombre,exact:true}).count(),1,
      'Falta sección de Configuración cuando MySQL no está disponible: '+nombre);
    assert.equal(await config.getByRole('button',{name:'Guardar configuración en MySQL'}).isDisabled(),true);
    assert.match(await config.locator('.config-fetch-status.warning').innerText(),/Falta la tabla/);
    await page.screenshot({path:'evidencias-dashboard/34_Configuracion_opciones_sin_conexion.png',
      fullPage:true,animations:'disabled'});
    await page.unroute('**/api/configuracion**');
    // El error 503 fue simulado a propósito; no registrarlo como falla real del servidor.
    for(let i=incidencias.length-1;i>=0;i--){
      if(incidencias[i].tipo==='api' && incidencias[i].detalle==='HTTP 503'
          && incidencias[i].url.includes('/api/configuracion')) incidencias.splice(i,1);
    }
  });

  await paso('Los módulos complementarios siguen disponibles en su área sin botón genérico',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    assert.equal(await menu.getByText('Todas las funciones',{exact:true}).count(),0);
    assert.equal(await menu.locator('.mg-optional-category-head').count(),0);
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    const selector=menu.locator('#mg-modulo-selector');
    assert.equal(await selector.locator('option[value="historial-ventas"]').count(),1);
    assert.equal(await selector.locator('option[value="gastos"]').count(),1);
    await selector.selectOption('gastos');
    assert.equal(await page.locator('.mg-current-topbar h1').innerText(),'Gastos');
    assert.equal(await menu.locator('#mg-modulo-selector').count(),0,
      'Al entrar en Gastos la lista debe ocultarse.');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    assert.equal(await menu.locator('#mg-modulo-selector').inputValue(),'gastos');
    await page.screenshot({path:'evidencias-dashboard/35_Menu_adicional_agrupado.png',
      fullPage:true,animations:'disabled'});
  });

  await paso('Si falla MySQL no muestra tablas vacías como si fueran datos reales',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    let peticionesFallidas=0;
    await page.route('**/api/admin-gym-registros/equipos*',ruta=>{
      peticionesFallidas++;
      return ruta.fulfill({status:200,contentType:'application/json',body:'respuesta-json-incorrecta'});
    });
    try {
      await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
      await menu.locator('#mg-modulo-selector').selectOption('equipos');
      const zona=page.locator('app-admin-gym-suite');
      await zona.locator('.mg-suite-network-error').waitFor({timeout:15000});
      assert.ok(peticionesFallidas>=1,'La falla simulada debe interceptar la consulta real del módulo.');
      assert.equal(await zona.locator('.cf-suite-complete').count(),0,
        'Una consulta fallida no puede aparecer como lista vacía de equipos.');
      await page.unroute('**/api/admin-gym-registros/equipos*');
      const respuesta=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/equipos')
        && r.request().method()==='GET',{timeout:25000});
      await zona.getByRole('button',{name:'Reintentar carga'}).click();
      assert.equal((await respuesta).status(),200);
      await zona.locator('.cf-suite-complete').waitFor({timeout:15000});
      assert.equal(await zona.locator('.mg-suite-network-error').count(),0);
    } finally {
      await page.unroute('**/api/admin-gym-registros/equipos*');
    }
  });

  await paso('Galería guarda una imagen local y la muestra tras recargar la base',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menu.locator('#mg-modulo-selector').selectOption('galeria');
    const zona=page.locator('app-admin-gym-suite');
    await zona.getByRole('button',{name:/Subir Imagen/}).first().waitFor({timeout:15000});
    await zona.getByRole('button',{name:/Subir Imagen/}).first().click();
    const modal=zona.locator('.gym-suite-modal');
    await modal.locator('input[name="titulo"]').fill('Foto local temporal E2E');
    await modal.locator('select[name="categoria"]').selectOption('Eventos');
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC','base64');
    const subida=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/galeria/imagen')
      && r.request().method()==='POST',{timeout:25000});
    await modal.locator('input[type="file"]').setInputFiles({
      name:'foto-galeria-e2e.png',mimeType:'image/png',buffer:png
    });
    const subidaR=await subida;
    assert.equal(subidaR.status(),201,'Laravel debe conservar la imagen en uploads locales.');
    const archivo=await subidaR.json();
    assert.match(archivo.imagen_url,/^\/uploads\/admin-gym\//);
    await modal.locator('img').waitFor({timeout:15000});
    const creando=page.waitForResponse(r=>r.url().endsWith('/api/admin-gym-registros/galeria')
      && r.request().method()==='POST',{timeout:20000});
    await modal.getByRole('button',{name:'Crear',exact:true}).click();
    assert.equal((await creando).status(),201);
    await page.reload({waitUntil:'domcontentloaded'});
    // Cambiar de sección no modifica /admin; tras recargar se debe volver a abrir Galería.
    const menuRecargado=page.locator('.mg-clear-navigation');
    await menuRecargado.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menuRecargado.locator('#mg-modulo-selector').selectOption('galeria');
    const gallery=page.locator('app-admin-gym-suite');
    const foto=gallery.locator('.cf-suite-gallery article').filter({hasText:'Foto local temporal E2E'});
    await foto.waitFor({timeout:20000});
    const imagen=foto.locator('img');
    assert.equal(await imagen.getAttribute('src'),archivo.imagen_url,
      'La URL guardada debe seguir siendo local después de recargar.');
    assert.equal(await imagen.evaluate(img=>img.complete && img.naturalWidth>0),true,
      'La imagen local debe cargar sin servicio externo.');
    const filtros=gallery.locator('.cf-suite-gallery-filter');
    await filtros.getByRole('button',{name:'Eventos'}).click();
    assert.equal(await gallery.locator('.cf-suite-gallery article').filter({hasText:'Foto local temporal E2E'}).count(),1,
      'La foto guardada en Eventos debe aparecer al activar esa categoría.');
    await filtros.getByRole('button',{name:'Entrenamiento'}).click();
    assert.equal(await gallery.locator('.cf-suite-gallery article').filter({hasText:'Foto local temporal E2E'}).count(),0,
      'Una foto de Eventos no debe confundirse con Entrenamiento.');
    await filtros.getByRole('button',{name:'Todos'}).click();
    await foto.getByRole('button',{name:'Editar imagen'}).click();
    page.once('dialog',dialog=>dialog.accept());
    const eliminando=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/galeria/')
      && r.request().method()==='DELETE',{timeout:20000});
    await gallery.getByRole('button',{name:'Eliminar registro'}).click();
    assert.equal((await eliminando).status(),200);
    assert.equal(await gallery.locator('.cf-suite-gallery article')
      .filter({hasText:'Foto local temporal E2E'}).count(),0);
  });

  await paso('Nutrición crea, edita y elimina planes; error de guardado mantiene el formulario',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menu.locator('#mg-modulo-selector').selectOption('nutricion');
    const zona=page.locator('app-admin-gym-suite');
    await zona.getByRole('button',{name:/Nuevo plan/}).waitFor({timeout:15000});
    await zona.getByRole('button',{name:/Nuevo plan/}).click();
    const modal=zona.locator('.gym-suite-modal');
    await modal.locator('input[name="titulo"]').fill('Plan temporal de nutrición');
    await modal.locator('input[name="subtitulo"]').fill('Seguimiento de socio en base temporal');
    await modal.locator('input[name="fecha"]').fill('2026-11-19');
    await page.route('**/api/admin-gym-registros/nutricion',ruta=>{
      if(ruta.request().method()==='POST')return ruta.fulfill({
        status:422,contentType:'application/json',
        body:JSON.stringify({message:'Error de validación simulado',errors:{titulo:['Revisar nombre']}})
      });
      return ruta.continue();
    });
    await modal.getByRole('button',{name:'Crear',exact:true}).click();
    await zona.getByRole('alert').filter({hasText:'Error de validación simulado'})
      .waitFor({timeout:10000});
    assert.equal(await modal.isVisible(),true,
      'El formulario no puede ocultarse después de un error al guardar.');
    assert.equal(await zona.locator('.mg-suite-network-error').count(),0,
      'Un error de formulario no debe confundirse con caída de MySQL.');
    await page.unroute('**/api/admin-gym-registros/nutricion');

    const crear=page.waitForResponse(r=>r.url().endsWith('/api/admin-gym-registros/nutricion')
      && r.request().method()==='POST',{timeout:20000});
    await modal.getByRole('button',{name:'Crear',exact:true}).click();
    assert.equal((await crear).status(),201);
    const fila=zona.locator('.gym-suite-table tbody tr').filter({hasText:'Plan temporal de nutrición'});
    await fila.waitFor({timeout:15000});
    await fila.getByRole('button',{name:'Editar'}).click();
    await modal.locator('input[name="titulo"]').fill('Plan nutricional corregido');
    const editar=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/nutricion/')
      && r.request().method()==='PUT',{timeout:20000});
    await modal.getByRole('button',{name:'Guardar Cambios'}).click();
    assert.equal((await editar).status(),200);
    const actualizada=zona.locator('.gym-suite-table tbody tr').filter({hasText:'Plan nutricional corregido'});
    await actualizada.waitFor({timeout:15000});
    await actualizada.getByRole('button',{name:'Editar'}).click();
    page.once('dialog',dialog=>dialog.accept());
    const eliminar=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/nutricion/')
      && r.request().method()==='DELETE',{timeout:20000});
    await modal.getByRole('button',{name:'Eliminar registro'}).click();
    assert.equal((await eliminar).status(),200);
    assert.equal(await zona.locator('.gym-suite-table tbody tr')
      .filter({hasText:'Plan nutricional corregido'}).count(),0);
  });

  await paso('Ingresos abre datos confirmados de MySQL y exporta el informe correcto',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    const respuesta=page.waitForResponse(r=>r.url().includes('/api/reportes/ingresos') && r.request().method()==='GET',{timeout:25000});
    await menu.locator('#mg-modulo-selector').selectOption('ingresos');
    const estado=await respuesta;
    assert.equal(estado.status(),200,'La API de ingresos debe responder desde MySQL.');
    const reporte=await estado.json();
    await page.locator('.cf-suite-income-cards').waitFor({timeout:20000});
    assert.equal(await page.locator('.gym-suite [role="alert"]').count(),0,
      'El informe financiero no debe presentar errores de datos.');
    const boton=page.getByRole('button',{name:'Exportar ingresos reales'});
    assert.equal(await boton.isDisabled(),false);
    const descargando=page.waitForEvent('download',{timeout:12000});
    await boton.click();
    const descarga=await descargando;
    assert.match(descarga.suggestedFilename(),/mallqui-ingresos-confirmados-\d{4}-\d{2}-\d{2}\.csv/,
      'El botón exporta el informe financiero, no los registros manuales.');
    assert.equal(Array.isArray(reporte.por_mes),true);
  });

  await paso('Salarios permite crear, filtrar por fecha real y eliminar confirmando',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.getByRole('button',{name:'Mostrar módulos complementarios'}).click();
    await menu.locator('#mg-modulo-selector').selectOption('salarios');
    const planilla=page.locator('app-admin-gym-suite');
    await planilla.getByRole('button',{name:/Agregar Salario/}).waitFor({timeout:20000});
    const nombre='Nómina temporal de prueba E2E';
    const fecha=new Date().toISOString().slice(0,10);
    const mes=fecha.slice(0,7);
    await planilla.getByRole('button',{name:/Agregar Salario/}).click();
    const modal=planilla.locator('.gym-suite-modal');
    await modal.locator('input[name="titulo"]').fill(nombre);
    await modal.locator('input[name="subtitulo"]').fill('Prueba en base temporal');
    await modal.locator('input[name="fecha"]').fill(fecha);
    await modal.locator('input[name="monto"]').fill('135.50');
    const creando=page.waitForResponse(r=>r.url().endsWith('/api/admin-gym-registros/salarios')
      && r.request().method()==='POST',{timeout:20000});
    await modal.getByRole('button',{name:'Crear',exact:true}).click();
    assert.equal((await creando).status(),201);
    const periodo=planilla.getByRole('combobox',{name:'Filtrar salarios por mes'});
    await periodo.locator('option[value="'+mes+'"]').waitFor({state:'attached',timeout:20000});
    await periodo.selectOption(mes);
    const fila=planilla.locator('.gym-suite-table tbody tr').filter({hasText:nombre});
    await fila.waitFor({timeout:15000});
    assert.match(await fila.innerText(),/135[.,]50/);
    await fila.getByRole('button',{name:'Editar'}).click();
    page.once('dialog',dialog=>dialog.accept());
    const eliminando=page.waitForResponse(r=>r.url().includes('/api/admin-gym-registros/salarios/')
      && r.request().method()==='DELETE',{timeout:20000});
    await planilla.getByRole('button',{name:'Eliminar registro'}).click();
    assert.equal((await eliminando).status(),200);
    assert.equal(await planilla.locator('.gym-suite-table tbody tr').filter({hasText:nombre}).count(),0);
    await page.screenshot({path:'evidencias-dashboard/38_Salarios_filtro_y_CRUD_real.png',
      fullPage:true,animations:'disabled'});
  });

  await paso('Inicio EFSRT conserva indicadores y tres gráficos sin acciones duplicadas',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const inicio=page.locator('.mg-efsrt-dashboard');
    await inicio.waitFor({timeout:15000});
    await inicio.locator('.mg-dashboard-loading-note').waitFor({state:'hidden',timeout:25000});
    assert.equal(await inicio.locator('.mg-efsrt-actions>button').count(),0,
      'El inicio no debe duplicar los accesos del menú lateral.');
    assert.equal(await inicio.locator('.mg-efsrt-kpis article').count(),4,
      'Los cuatro indicadores de MySQL se conservan en el resumen.');
    assert.equal(await inicio.locator('.mg-efsrt-work').count(),0,
      'El bloque antiguo de seis accesos no puede reaparecer.');
    assert.equal(await page.locator('.mg-module-tabs').count(),0,'Las pestañas antiguas repiten el menú.');
    await inicio.locator('.mg-premium-analytics').waitFor({timeout:12000});
    assert.equal(await inicio.locator('.mg-premium-analytics-grid .mg-premium-card').count(),3,
      'Inicio debe mostrar tres gráficos alimentados por MySQL.');
    assert.equal(await page.locator('.mg-clear-navigation .mg-nav-primary').count(),5);
    assert.equal(await page.locator('.mg-clear-navigation .cf-nav-group-head').count(),0);
    const inmediatamenteDespues=await inicio.locator('.mg-efsrt-charts-first').evaluate(
      el=>el.previousElementSibling?.classList.contains('mg-efsrt-kpis')===true);
    assert.equal(inmediatamenteDespues,true,
      'Los gráficos deben ir inmediatamente después de los cuatro indicadores.');
    await page.screenshot({
      path:'evidencias-dashboard/17_Inicio_EFSRT_Simplificado.png',
      fullPage:true,animations:'disabled'
    });
    const analisis=await inicio.locator('.mg-premium-analytics').innerText();
    assert.ok(analisis.includes('Ingresos'),'Los gráficos deben mostrar ingresos reales.');
    await page.screenshot({path:'evidencias-dashboard/33_Graficos_visibles_en_el_inicio.png',
      fullPage:true,animations:'disabled'});
    assert.equal(await inicio.locator('.mg-efsrt-optional-toggle').count(),0,
      'La analítica visible no necesita otro botón para descubrirla.');
    assert.equal(await inicio.locator('.mg-premium-analytics-grid .mg-premium-card').count(),3);
    assert.equal(await inicio.locator('button').count(),0,
      'Inicio es un resumen operativo, no debe tener controles duplicados.');
    await page.goto(base+'/reportes',{waitUntil:'domcontentloaded'});
    const herramientas=page.locator('.mg-advanced-tools-shell');
    await herramientas.waitFor({timeout:15000});
    await herramientas.getByRole('button',{name:'Abrir detalle'}).click();
    assert.equal(await herramientas.locator('app-admin-dashboard-tools').count(),1,
      'Las funciones de análisis avanzado no se borran, se trasladan a Reportes.');
  });

  await paso('Formulario de socios en la página, sin oscurecer ni duplicar scroll',async()=>{
    await page.goto(base+'/clientes',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Agregar Socio/i}).first().click();
    const area=page.locator('.client-editor-workspace');
    await area.waitFor({timeout:10000});
    assert.equal(await page.locator('.client-editor-backdrop').count(),0,
      'No debe seguir existiendo el modal que tapa la página.');
    assert.equal(await page.locator('.clients-v3-shell').count(),0,
      'La tabla de socios debe ocultarse al editar, para evitar doble interfaz.');
    const geometria=await area.locator('.client-editor-panel').evaluate(el=>{
      const style=getComputedStyle(el);
      const formulario=el.querySelector('.client-editor-form');
      return {
        ancho:el.getBoundingClientRect().width,
        alto:el.getBoundingClientRect().height,
        alturaTexto:parseFloat(getComputedStyle(el.querySelector('input[name=dni]')).fontSize),
        panelOverflow:style.overflowY,
        formularioOverflow:getComputedStyle(formulario).overflowY,
        posicion:style.position
      };
    });
    assert.ok(geometria.ancho>=650,'Formulario pequeño: '+JSON.stringify(geometria));
    assert.ok(geometria.alturaTexto>=14,'Texto aún demasiado pequeño');
    assert.notEqual(geometria.formularioOverflow,'auto','El formulario no debe tener segundo scroll');
    assert.notEqual(geometria.panelOverflow,'auto','El panel no debe tener segundo scroll');
    await page.screenshot({path:'evidencias-dashboard/14_Registrar_Socio_sin_drawer.png',fullPage:true,animations:'disabled'});
    await area.getByRole('button',{name:/Volver a la lista de socios/}).click();
    assert.equal(await area.count(),0,'El botón Volver debe cerrar el formulario.');
    await page.locator('.clients-v3-shell').waitFor({timeout:10000});
  });

  await paso('Registrar socio desde nueva interfaz y verificar MySQL al recargar',async()=>{
    await page.goto(base+'/clientes',{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Agregar Socio/i}).first().click();
    const form=page.locator('.client-editor-workspace form.client-editor-form');
    await form.waitFor({timeout:10000});
    await form.locator('input[name=dni]').fill('88776655');
    await form.locator('input[name=nombres]').fill('Prueba');
    await form.locator('input[name=apellidos]').fill('Interfaz Mallqui');
    await form.locator('input[name=telefono]').fill('987654321');
    await form.locator('input[name=correo]').fill('interfaz-ci@example.test');
    await form.locator('input[name=crear_acceso]').uncheck();
    await form.locator('button.save').click();
    await page.waitForFunction(()=>
      Boolean(document.querySelector('.mg-top-greeting h1')?.textContent?.includes('Membresías')),
      null,{timeout:25000}
    );
    await page.goto(base+'/clientes',{waitUntil:'domcontentloaded'});
    const tabla=page.locator('.clients-v3-shell');
    await tabla.waitFor({timeout:15000});
    await page.locator('.clients-v3-shell').getByText('Interfaz Mallqui',{exact:false}).first().waitFor({timeout:25000});
    await page.screenshot({path:'evidencias-dashboard/15_Socio_persistido_MySQL.png',fullPage:true});
  });

  await paso('Semana 06: preparar ejercicios editables de acuerdo al perfil del socio',async()=>{
    await page.goto(base+'/rutinas',{waitUntil:'domcontentloaded'});
    const editor=page.locator('.routine-management .routine-editor-card');
    await editor.waitFor({timeout:25000});
    const socios=editor.locator('select[name=rucliente]');
    await socios.evaluate(async el=>{
      const inicio=Date.now();
      while(el.options.length<2 && Date.now()-inicio<15000){
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      if(el.options.length<2) throw new Error('No hay socios para revisar rutinas.');
    });
    await socios.selectOption({index:1});
    await editor.getByRole('button',{name:'Sugerir ejercicios'}).click();
    assert.equal(await editor.locator('.routine-exercise-row').count(),3,
      'La propuesta inicial debe preparar ejercicios editables.');
    const nombre=await editor.locator('input[name=runombre]').inputValue();
    assert.match(nombre,/Plan .+ - (Principiante|Intermedio|Avanzado)/);
    await page.screenshot({
      path:'evidencias-dashboard/30_Rutina_segun_nivel_y_objetivo.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('Móvil muestra cinco accesos y Reservas abre la pantalla correcta',async()=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const movil=page.locator('.mg-efsrt-mobile-menu');
    await movil.waitFor({timeout:15000});
    assert.equal(await movil.locator('button').count(),5,'Menú móvil debe tener solo cinco opciones');
    const reserv=movil.getByRole('button',{name:'Reservas'});
    await reserv.click();
    await page.locator('.mg-current-topbar h1').waitFor({timeout:10000});
    const titulo=String(await page.locator('.mg-current-topbar h1').textContent()||'');
    assert.match(titulo,/reservas/i);
    await page.setViewportSize({width:1440,height:900});
  });

  let codigoProductoFoto = '';
  await paso('Crear producto con foto desde el formulario y verificar persistencia',async()=>{
    await page.goto(base+'/productos',{waitUntil:'domcontentloaded'});
    await page.locator('app-productos .tabla-productos').waitFor({timeout:30000});
    assert.equal(await page.locator('app-productos form.producto-form').count(),0,
      'El inventario se muestra primero y no un formulario largo.');
    await page.getByRole('button',{name:'Abrir formulario para agregar producto'}).click();
    const form=page.locator('app-productos form.producto-form').first();
    await form.waitFor({timeout:30000});
    const codigo='E2E-'+Date.now();
    codigoProductoFoto = codigo;
    const cat=form.locator('select[name=id_categoria]');
    // Los elementos <option> se consideran ocultos por Chromium, aunque el select
    // esté listo; comprobar cantidad de opciones en lugar de esperar visibilidad.
    await cat.evaluate(async el=>{
      const inicio=Date.now();
      while(el.options.length<2 && Date.now()-inicio<20000){
        await new Promise(resolve=>setTimeout(resolve,100));
      }
      if(el.options.length<2) throw new Error('No existen categorías activas.');
    });
    await cat.selectOption({index:1});
    await form.locator('input[name=codigo_producto]').fill(codigo);
    await form.locator('input[name=nombre_producto]').fill('Producto de prueba con fotografía');
    await form.locator('input[name=precio_compra]').fill('10');
    await form.locator('input[name=precio_venta]').fill('20');
    await form.locator('input[name=stock]').fill('3');
    await form.locator('input[name=stock_minimo]').fill('1');
    const png=Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jWl8AAAAASUVORK5CYII=',
      'base64'
    );
    await form.locator('input[type=file]').setInputFiles({
      name:'producto-prueba.png',mimeType:'image/png',buffer:png
    });
    await form.locator('.imagen-lista-para-guardar').waitFor({timeout:20000});
    await form.getByRole('button',{name:/Registrar producto/}).click();
    await page.locator('app-productos .mensaje-ok').waitFor({timeout:25000});
    await page.reload({waitUntil:'domcontentloaded'});
    const fila=page.locator('app-productos .tabla-productos tr').filter({hasText:codigo}).first();
    await fila.waitFor({timeout:25000});
    assert.equal(await fila.locator('img.producto-foto').count(),1,
      'La fotografía del producto no se recuperó de MySQL.');
    await fila.locator('img.producto-foto').evaluate(img=>{
      if (!img.complete || img.naturalWidth===0) {
        throw new Error('La foto existe en el HTML pero no se puede visualizar.');
      }
    });
    await page.locator('.inventario-verificacion').waitFor({timeout:15000});
    const diagnostico=await page.locator('.inventario-verificacion').innerText();
    assert.match(diagnostico,/fotos? guardadas?|con foto guardada/i);
    assert.match(diagnostico,/Base conectada:/i);
    await page.screenshot({path:'evidencias-dashboard/11_Producto_creado_y_foto.png',fullPage:true});
  });

  await paso('Subir imagen desde la fila sin alterar el precio ni el stock',async()=>{
    await page.goto(base+'/productos',{waitUntil:'domcontentloaded'});
    const tabla=page.locator('app-productos .tabla-productos');
    await tabla.waitFor({timeout:25000});
    let fila=tabla.locator('tr').filter({hasText:codigoProductoFoto}).first();
    await fila.waitFor({timeout:25000});
    const stockAntes=await fila.locator('.stock-cell b').innerText();
    const precioAntes=await fila.locator('.precio-tabla').innerText();

    // Una foto existente se quita desde el formulario; la fila vacía permite
    // volver a cargarla directamente sin abrir el formulario.
    await fila.getByRole('button',{name:/Editar \/ cambiar foto/}).click();
    const form=page.locator('app-productos form.producto-form').first();
    await form.getByRole('button',{name:/Quitar imagen/}).click();
    await form.getByRole('button',{name:/Guardar cambios/}).click();
    await page.locator('app-productos .mensaje-ok').waitFor({timeout:25000});
    await page.reload({waitUntil:'domcontentloaded'});
    fila=page.locator('app-productos .tabla-productos tr').filter({hasText:codigoProductoFoto}).first();
    await fila.waitFor({timeout:25000});
    assert.equal(await fila.locator('img.producto-foto').count(),0);

    await fila.getByRole('button',{name:'Elegir foto'}).click();
    const galeria=page.locator('.foto-catalogo-dialog');
    await galeria.waitFor({timeout:15000});
    assert.equal(await galeria.locator('.foto-catalogo-imagenes button').count(),11,
      'La galería debe usar once fotos reales de los productos aportados.');
    await galeria.getByRole('button',{name:/Usar fotografía de Level Pro Creatine Monohydrate/}).click();
    await page.locator('app-productos .mensaje-ok').waitFor({timeout:25000});
    await page.reload({waitUntil:'domcontentloaded'});
    fila=page.locator('app-productos .tabla-productos tr').filter({hasText:codigoProductoFoto}).first();
    await fila.waitFor({timeout:25000});
    assert.equal(await fila.locator('.stock-cell b').innerText(),stockAntes);
    assert.equal(await fila.locator('.precio-tabla').innerText(),precioAntes);
    const foto=fila.locator('img.producto-foto');
    await foto.waitFor({timeout:15000});
    await foto.evaluate(img=>{
      if(!img.complete || img.naturalWidth===0)
        throw new Error('La fotografía de la fila no se recuperó desde MySQL.');
    });
    await page.screenshot({
      path:'evidencias-dashboard/19_Foto_desde_fila_con_stock_intacto.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('Dashboard principal muestra fotografía recuperada de productos MySQL',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const catalogo=page.locator('.mg-catalog-preview');
    await catalogo.waitFor({timeout:25000});
    await catalogo.getByText('Producto de prueba con fotografía').first().waitFor({timeout:20000});
    const foto=catalogo.locator('.mg-catalog-product img').first();
    await foto.waitFor({timeout:15000});
    await foto.evaluate(img=>{
      if(!img.complete || img.naturalWidth===0)
        throw new Error('La fotografía del catálogo principal no cargó desde MySQL.');
    });
    await page.screenshot({
      path:'evidencias-dashboard/16_Foto_Producto_en_Dashboard_Principal.png',
      fullPage:true,animations:'disabled'
    });
  });

  await paso('Semana 11: respaldo SQL real conserva el producto y su fotografía',async()=>{
    await page.goto(base+'/mantenimiento-sistema',{waitUntil:'domcontentloaded'});
    const guardar=page.getByRole('button',{name:'Descargar backup'});
    await guardar.waitFor({timeout:20000});
    const [descarga]=await Promise.all([
      page.waitForEvent('download',{timeout:60000}),
      guardar.click()
    ]);
    assert.match(descarga.suggestedFilename(),/backup-mallqui-gym-.*\.sql$/i);
    const ruta=await descarga.path();
    assert.ok(ruta,'El servidor debe entregar un archivo SQL real.');
    const sql=await fs.readFile(ruta,'utf8');
    assert.ok(sql.length>100,'El respaldo no debe estar vacío.');
    assert.match(sql,/INSERT INTO `productos`/i,'Faltan productos en el respaldo.');
    assert.ok(sql.includes(codigoProductoFoto),'El producto recién creado no quedó en el respaldo.');
    assert.match(sql,/data:image\/(?:png|jpeg|webp);base64,/i,
      'El respaldo debe conservar también la fotografía guardada en MySQL.');
    await page.goto(base+'/verificacion-efsrt',{waitUntil:'domcontentloaded'});
    await page.getByRole('combobox',{name:'Seleccionar semana EFSRT'}).selectOption('11');
    assert.doesNotMatch(await page.locator('.efsrt-week-card').innerText(),
      /No existe todavía un respaldo SQL verificado/i,
      'El diagnóstico debe reconocer el respaldo recién generado.');
    await page.screenshot({
      path:'evidencias-dashboard/32_Respaldo_SQL_y_revision_semana11.png',
      fullPage:true,animations:'disabled'
    });
  });

  const movil=await browser.newContext({viewport:{width:390,height:844},locale:'es-PE'});
  const mobile=await movil.newPage();
  // Reutilizar solo la sesión admin de prueba.
  await mobile.addInitScript((sesion)=>{
    localStorage.setItem('mallqui_token',sesion.token);
    localStorage.setItem('mallqui_usuario',sesion.usuario);
  },await page.evaluate(()=>{
    const st=localStorage.getItem('mallqui_token')?localStorage:sessionStorage;
    return {token:st.getItem('mallqui_token'),usuario:st.getItem('mallqui_usuario')};
  }));
  await paso('Dashboard adaptable en pantalla móvil',async()=>{
    await mobile.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    await mobile.locator('.mg-current-topbar h1').waitFor({timeout:25000});
    await mobile.screenshot({path:'evidencias-dashboard/12_Movil.png',fullPage:true});
  });

  await fs.writeFile('evidencias-dashboard/reporte.json',JSON.stringify({
    fuente:'repo anyozasad/api-persona, Angular 20 + Laravel 12 + MySQL 8 CI',
    resultados:pasos,incidencias,
    nota:'Capturas de CI; la instalación local del alumno no fue utilizada'
  },null,2));
  if(incidencias.length) throw new Error('Hay '+incidencias.length+' errores JS o HTTP 5xx: '+JSON.stringify(incidencias));
  console.log('DASHBOARD REAL: '+pasos.length+' comprobaciones y capturas correctas.');
} finally {
  await browser.close();
}
