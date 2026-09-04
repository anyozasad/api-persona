import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../models/producto';
import { Categoria } from '../../models/categoria';
import { ProductoService } from '../../services/producto';
import { CategoriaService } from '../../services/categoria';
import { AuthService } from '../../services/auth';

@Component({ selector: 'app-productos', standalone: true, imports: [CommonModule, FormsModule], templateUrl: './productos.html', styleUrl: './productos.css' })
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  categorias: Categoria[] = [];
  editando = false;
  cargando = false;
  mensaje = '';
  error = '';
  producto: Producto = this.productoVacio();
  constructor(private productoService: ProductoService, private categoriaService: CategoriaService, public auth: AuthService, private router: Router) {}
  ngOnInit(): void { this.listarCategorias(); this.listar(); }
  listar(): void {
    this.cargando = true; this.error = '';
    this.productoService.listar().subscribe({ next: d => { this.productos = d; this.cargando = false; }, error: e => { this.cargando = false; this.error = this.mensajeError(e, 'No se pudieron obtener los productos.'); } });
  }
  listarCategorias(): void {
    this.categoriaService.listar().subscribe({ next: d => { this.categorias = d.filter(c => c.estado === 'Activo'); if (!this.producto.id_categoria && this.categorias.length) this.producto.id_categoria = this.categorias[0].id_categoria; }, error: e => this.error = this.mensajeError(e, 'No se pudieron cargar las categorías.') });
  }
  guardar(): void {
    this.mensaje = ''; this.error = '';
    this.productoService.guardar(this.producto).subscribe({ next: () => { this.mensaje = 'Producto registrado correctamente.'; this.limpiarFormulario(); this.listar(); }, error: e => this.error = this.mensajeError(e, 'No se pudo registrar el producto.') });
  }
  editar(p: Producto): void { this.producto = { ...p }; this.editando = true; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  actualizar(): void {
    if (!this.producto.id_producto) return;
    const id = this.producto.id_producto;
    const datos: Partial<Producto> = { id_categoria: this.producto.id_categoria, codigo_producto: this.producto.codigo_producto, nombre_producto: this.producto.nombre_producto, descripcion: this.producto.descripcion, precio_compra: this.producto.precio_compra, precio_venta: this.producto.precio_venta, stock_minimo: this.producto.stock_minimo, unidad_medida: this.producto.unidad_medida, estado: this.producto.estado };
    this.productoService.actualizar(id, datos).subscribe({ next: () => { this.mensaje = 'Producto actualizado correctamente.'; this.limpiarFormulario(); this.listar(); }, error: e => this.error = this.mensajeError(e, 'No se pudo actualizar el producto.') });
  }
  eliminar(id: number): void {
    if (!confirm('¿Deseas desactivar este producto?')) return;
    this.productoService.eliminar(id).subscribe({ next: r => { this.mensaje = r.mensaje; this.listar(); }, error: e => this.error = this.mensajeError(e, 'No se pudo desactivar el producto.') });
  }
  cerrarSesion(): void { this.auth.logout().subscribe({ next: () => this.router.navigate(['/login']), error: () => { this.auth.limpiarSesion(); this.router.navigate(['/login']); } }); }
  limpiarFormulario(): void { const cat = this.categorias[0]?.id_categoria ?? 0; this.producto = this.productoVacio(); this.producto.id_categoria = cat; this.editando = false; }
  private productoVacio(): Producto { return { id_categoria: 0, codigo_producto: '', nombre_producto: '', descripcion: '', precio_compra: 0, precio_venta: 0, stock: 0, stock_minimo: 0, unidad_medida: 'Unidad', estado: 'Activo' }; }
  private mensajeError(e: any, fallback: string): string {
    if (e?.status === 401) { this.auth.limpiarSesion(); this.router.navigate(['/login']); return 'La sesión venció.'; }
    if (e?.status === 403) return 'Tu usuario no tiene permisos de Administrador.';
    const errores = e?.error?.errors;
    if (errores) { const primero = Object.values(errores)[0]; if (Array.isArray(primero) && primero[0]) return String(primero[0]); }
    return e?.error?.mensaje ?? fallback;
  }
}
