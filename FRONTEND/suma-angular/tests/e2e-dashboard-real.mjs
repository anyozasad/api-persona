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

  await paso('API Laravel + MySQL están disponibles',async()=>{
    const res=await context.request.get(base+'/api/estado-sistema');
    assert.equal(res.status(),200);
    const data=await res.json();
    assert.equal(data.api,true);
    assert.equal(data.database,true);
    assert.equal(data.operativo,true,
      'No están todas las tablas necesarias: '+JSON.stringify(data.faltantes));
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
    ['/usuarios','Usuarios','10_Usuarios']
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
    const tabla=page.locator('.clients-v3-table, .clients-v3-shell');
    await tabla.waitFor({timeout:15000});
    await page.locator('.clients-v3-shell').getByText('Interfaz Mallqui',{exact:false}).first().waitFor({timeout:25000});
    await page.screenshot({path:'evidencias-dashboard/15_Socio_persistido_MySQL.png',fullPage:true});
  });

  await paso('Botón Fitness abre rutinas, no clases',async()=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/admin',{waitUntil:'domcontentloaded'});
    await page.locator('.mg-current-topbar h1').waitFor();
    const boton=page.locator('.admin-mobile-modules button').filter({hasText:'Fitness'});
    if(await boton.count()){
      await boton.first().click();
      await page.waitForTimeout(350);
      const titulo=String(await page.locator('.mg-current-topbar h1').textContent()||'');
      assert.notEqual(titulo.trim().toLowerCase(),'dashboard');
      assert.match(titulo,/rutina/i);
      await page.setViewportSize({width:1440,height:900});
    }else{
      throw new Error('No aparece el botón Fitness');
    }
  });

  await paso('Crear producto con foto desde el formulario y verificar persistencia',async()=>{
    await page.goto(base+'/productos',{waitUntil:'domcontentloaded'});
    const form=page.locator('app-productos form.producto-form').first();
    await form.waitFor({timeout:30000});
    const codigo='E2E-'+Date.now();
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
    await page.screenshot({path:'evidencias-dashboard/11_Producto_creado_y_foto.png',fullPage:true});
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
