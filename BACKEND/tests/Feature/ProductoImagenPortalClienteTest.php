<?php

namespace Tests\Feature;

use Tests\TestCase;

class ProductoImagenPortalClienteTest extends TestCase
{
    public function test_la_imagen_del_producto_esta_conectada_desde_admin_hasta_usuario(): void
    {
        $adminHtml = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/productos/productos.html'));
        $adminTs = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/productos/productos.ts'));
        $usuario = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario.component.ts'));
        $usuarioCss = (string) file_get_contents(base_path('../FRONTEND/suma-angular/src/app/component/pages/usuario/usuario-productos.css'));
        $controller = (string) file_get_contents(app_path('Http/Controllers/PortalClienteController.php'));

        $this->assertStringContainsString('Imagen del producto', $adminHtml);
        $this->assertStringContainsString('(change)="seleccionarImagen($event)"', $adminHtml);
        $this->assertStringContainsString('[src]="producto.foto"', $adminHtml);
        $this->assertStringContainsString('seleccionarImagen(event: Event)', $adminTs);
        $this->assertStringContainsString('quitarImagen()', $adminTs);

        $this->assertStringContainsString('[disabled]="procesandoImagen || guardando"', $adminHtml);
        $this->assertStringContainsString('this.guardando = true;', $adminTs);
        $this->assertStringContainsString('Producto y fotografía guardados correctamente', $adminTs);

        $this->assertStringContainsString('*ngIf="p.foto"', $usuario);
        $this->assertStringContainsString('[src]="p.foto"', $usuario);
        $this->assertStringContainsString('.mallqui-product-home-media img', $usuarioCss);

        $this->assertStringNotContainsString('gym_portal_products', $controller);
        $this->assertStringContainsString("'foto' => \$producto->foto ?? null", $controller);
        $this->assertStringContainsString("Producto::with('categoria')", $controller);
        $this->assertStringNotContainsString("->where('stock', '>', 0)", $controller);
        $this->assertStringContainsString("p.stock>0 ? 'EN STOCK' : 'AGOTADO'", $usuario);
        $this->assertStringNotContainsString(".filter((p:any)=>Number(p?.stock??0)>0)", $usuario);
    }
}
