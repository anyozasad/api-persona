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

  await paso('Panel muestra indicadores operativos y accesos compactos, no solo una plantilla',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    await page.locator('.mg-efsrt-kpis').waitFor({timeout:25000});
    const prioridades=page.locator('.mg-efsrt-pulse-items button');
    assert.equal(await prioridades.count(),3);
    const textos=await page.locator('.mg-efsrt-pulse').innerText();
    assert.match(textos,/Membresías por vencer/);
    assert.match(textos,/Productos con stock bajo/);
    assert.match(textos,/Pagos pendientes/);
    const accesos=page.locator('.mg-efsrt-actions button');
    assert.equal(await accesos.count(),6);
    const primero=await accesos.first().boundingBox();
    const ultimo=await accesos.last().boundingBox();
    assert.ok(primero && ultimo,'Los accesos deben ser visibles.');
    assert.ok(Math.abs(primero.y-ultimo.y)<10,'Los seis accesos deben quedar en una sola fila en escritorio.');
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

  await paso('EFSRT lista exactamente once semanas y sus pendientes reales',async()=>{
    await page.goto(base+'/verificacion-efsrt',{waitUntil:'domcontentloaded'});
    const semanas=page.locator('.efsrt-week-card');
    await semanas.first().waitFor({timeout:25000});
    assert.equal(await semanas.count(),11,'La comprobación debe incluir las 11 semanas del documento.');
    assert.equal(await page.locator('.efsrt-week-activities').count(),11,
      'Cada semana necesita desglose de las cinco actividades de la bitácora.');
    const semanaCinco=semanas.filter({hasText:'Semana 05'});
    await semanaCinco.locator('.efsrt-week-activities summary').click();
    assert.equal(await semanaCinco.locator('.efsrt-week-activities li').count(),5,
      'La semana 05 debe comprobar sus cinco actividades, incluida la foto del producto.');
    assert.match(await semanaCinco.locator('.efsrt-week-activities').innerText(),/Imagen de producto/);
    assert.equal(await semanas.filter({hasText:'Semana 05'}).count(),1);
    assert.equal(await semanas.filter({hasText:'Semana 10'}).count(),1);
    assert.equal(await semanas.filter({hasText:'Semana 11'}).count(),1);
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

  await paso('Menú simplificado sin categorías repetidas',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.waitFor({timeout:20000});
    const grupos=menu.locator('.cf-nav-group-head');
    assert.equal(await grupos.count(),6,'El menú debe presentar seis grupos claros.');
    assert.equal(await menu.locator('.mg-direct-home').count(),1);
    const titulo=await grupos.allTextContents();
    assert.ok(titulo.some(t=>t.includes('Socios y membresías')));
    assert.ok(titulo.some(t=>t.includes('Entrenamientos')));
    assert.ok(titulo.some(t=>t.includes('Ventas e inventario')));
    await page.screenshot({path:'evidencias-dashboard/13_Menu_simplificado.png',fullPage:true});
  });

  await paso('Administración muestra solo Configuración y conserva funciones internas',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    const administracion=menu.locator('.cf-nav-group-head').filter({hasText:'Administración'});
    await administracion.click();
    const hijos=menu.locator('.cf-nav-children').filter({hasText:'Configuración'});
    await hijos.waitFor({timeout:12000});
    assert.equal(await hijos.locator('button').count(),1,
      'En Administración debe existir solo la entrada Configuración.');
    await hijos.getByRole('button',{name:/Configuración/}).click();
    const configuracion=page.locator('.config-page');
    await configuracion.waitFor({timeout:15000});
    // Los controles se muestran únicamente después de validar la respuesta MySQL.
    await configuracion.getByRole('button',{name:'Usuarios y permisos'}).waitFor({timeout:25000});
    for(const herramienta of [
      'Usuarios y permisos','Historial de actividad',
      'Gestionar respaldos','Diagnóstico avanzado'
    ]){
      assert.equal(await configuracion.getByRole('button',{name:herramienta}).count(),1,
        'Debe conservarse la herramienta: '+herramienta);
    }
    await page.screenshot({
      path:'evidencias-dashboard/21_Configuracion_sin_modulos_duplicados.png',
      fullPage:true,animations:'disabled'
    });
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

  await paso('Menú adicional agrupado y sin lista interminable',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const menu=page.locator('.mg-clear-navigation');
    await menu.locator('.cf-nav-group-head').filter({hasText:'Más funciones'}).click();
    assert.equal(await menu.locator('.mg-optional-category-head').count(),4);
    assert.equal(await menu.locator('.mg-optional-category-items').count(),0,
      'Las opciones adicionales deben estar cerradas inicialmente.');
    await menu.getByRole('button',{name:'Inventario y finanzas'}).click();
    assert.equal(await menu.locator('.mg-optional-category-items').count(),1);
    assert.equal(await menu.getByRole('button',{name:'Gastos',exact:true}).count(),1);
    await page.screenshot({path:'evidencias-dashboard/35_Menu_adicional_agrupado.png',
      fullPage:true,animations:'disabled'});
  });

  await paso('Inicio EFSRT tiene exactamente seis acciones y no duplica pestañas',async()=>{
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    const inicio=page.locator('.mg-efsrt-dashboard');
    await inicio.waitFor({timeout:15000});
    const acciones=inicio.locator('.mg-efsrt-actions>button');
    assert.equal(await acciones.count(),6,'Debe haber seis accesos principales, no una pantalla saturada de botones.');
    assert.equal(await page.locator('.mg-module-tabs').count(),0,'Las pestañas antiguas repiten el menú.');
    await inicio.locator('.mg-premium-analytics').waitFor({timeout:12000});
    assert.equal(await inicio.locator('.mg-premium-analytics-grid .mg-premium-card').count(),3,
      'Inicio debe mostrar tres gráficos alimentados por MySQL.');
    const nombres=await acciones.allTextContents();
    for(const esperado of ['Matricular socio','Reservas','Asistencia','Rutinas','Productos','Pagos']){
      assert.ok(nombres.some(x=>x.includes(esperado)),'Acceso faltante: '+esperado);
    }
    await page.screenshot({
      path:'evidencias-dashboard/17_Inicio_EFSRT_Simplificado.png',
      fullPage:true,animations:'disabled'
    });
    const analisis=await inicio.locator('.mg-premium-analytics').innerText();
    assert.ok(analisis.includes('Ingresos'),'Los gráficos deben mostrar ingresos reales.');
    await page.screenshot({path:'evidencias-dashboard/33_Graficos_visibles_en_el_inicio.png',
      fullPage:true,animations:'disabled'});
    await inicio.getByRole('button',{name:/Gráficos y análisis de ingresos/}).click();
    assert.equal(await inicio.locator('.mg-premium-analytics').count(),0,
      'Se puede ocultar el análisis para despejar la pantalla.');
    await inicio.getByRole('button',{name:/Gráficos y análisis de ingresos/}).click();
    assert.equal(await inicio.locator('.mg-premium-analytics-grid .mg-premium-card').count(),3);
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
