import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../../models/producto';
import { Categoria } from '../../../models/categoria';
import { ProductoService, DiagnosticoFotosProducto } from '../../../core/services/producto.service';
import { CategoriaService } from '../../../core/services/categoria.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrl: './productos.css'
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  diagnosticoFotos: DiagnosticoFotosProducto | null = null;
  errorDiagnostico = '';
  categorias: Categoria[] = [];
  editando = false;
  cargando = false;
  mensaje = '';
  error = '';
  busqueda = '';
  procesandoImagen = false;
  guardando = false;
  fotoCargandoId: number | null = null;
  private imagenSolicitud = 0;
  producto: Producto = this.productoVacio();

  constructor(
    private productoService: ProductoService,
    private categoriaService: CategoriaService,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.listarCategorias();
    this.listar();
  }

  listar(limpiarError = true): void {
    this.cargando = true;
    if (limpiarError) this.error = '';
    this.productoService.listar().subscribe({
      next: d => {
        this.productos = Array.isArray(d) ? d : [];
        this.cargando = false;
        this.cargarDiagnosticoFotos();
      },
      error: e => {
        this.cargando = false;
        this.diagnosticoFotos = null;
        this.error = this.mensajeError(e, 'No se pudieron obtener los productos. Comprueba la conexión con Laravel y la base MySQL.');
      }
    });
  }

  listarCategorias(): void {
    this.categoriaService.listar().subscribe({
      next: d => {
        this.categorias = d.filter(c => c.estado === 'Activo');
        if (!this.producto.id_categoria && this.categorias.length) {
          this.producto.id_categoria = this.categorias[0].id_categoria;
        }
      },
      error: e => this.error = this.mensajeError(e, 'No se pudieron cargar las categorías.')
    });
  }

  cargarDiagnosticoFotos(): void {
    this.productoService.diagnosticoFotos().subscribe({
      next: datos => { this.diagnosticoFotos = datos; this.errorDiagnostico = ''; },
      error: () => {
        this.diagnosticoFotos = null;
        this.errorDiagnostico = 'No se pudo comprobar qué fotos están guardadas en MySQL.';
      }
    });
  }

  /** No mostrar enlaces antiguos como imágenes rotas en el panel. */
  fotoVisible(foto?: string | null): boolean {
    const valor = String(foto || '').trim();
    return /^data:image\/(?:png|jpe?g|webp);base64,/i.test(valor) ||
      /^\/?assets\/mallqui\/[a-zA-Z0-9_./-]+\.(?:png|jpe?g|webp)$/i.test(valor);
  }

  get productosSinFoto(): number {
    return this.productos.filter(p => !this.fotoVisible(p.foto)).length;
  }

  guardar(): void {
    if (this.guardando) return;
    if (this.procesandoImagen) {
      this.error = 'La fotografía todavía se está preparando. Guarda el producto cuando termine.';
      return;
    }
    this.mensaje = '';
    this.error = '';
    this.guardando = true;
    const fotoEsperada = this.producto.foto;
    this.productoService.guardar(this.producto).subscribe({
      next: registrado => {
        this.guardando = false;
        if (fotoEsperada && registrado.foto !== fotoEsperada) {
          this.error = 'Se registró el producto, pero no se confirmó su fotografía. Revisa el producto en el inventario.';
        } else {
          this.mensaje = fotoEsperada
            ? 'Producto y fotografía guardados correctamente en MySQL.'
            : 'Producto registrado correctamente.';
        }
        this.limpiarFormulario();
        // No borrar la advertencia si el backend no confirmó la fotografía.
        this.listar(false);
      },
      error: e => {
        this.guardando = false;
        this.error = this.mensajeError(e, 'No se pudo registrar el producto.');
      }
    });
  }

  editar(p: Producto): void {
    // Anular lecturas de imágenes anteriores para no asignarlas a otro producto.
    this.imagenSolicitud++;
    this.procesandoImagen = false;
    this.producto = { ...p };
    this.editando = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  actualizar(): void {
    if (!this.producto.id_producto || this.guardando) return;
    if (this.procesandoImagen) {
      this.error = 'La fotografía todavía se está preparando. Guarda los cambios cuando termine.';
      return;
    }
    const id = this.producto.id_producto;
    this.guardando = true;
    const datos: Partial<Producto> = {
      id_categoria: this.producto.id_categoria,
      codigo_producto: this.producto.codigo_producto,
      nombre_producto: this.producto.nombre_producto,
      descripcion: this.producto.descripcion,
      foto: this.producto.foto ?? null,
      precio_compra: this.producto.precio_compra,
      precio_venta: this.producto.precio_venta,
      stock_minimo: this.producto.stock_minimo,
      unidad_medida: this.producto.unidad_medida,
      estado: this.producto.estado
    };
    this.productoService.actualizar(id, datos).subscribe({
      next: actualizado => {
        this.guardando = false;
        if (datos.foto && actualizado.foto !== datos.foto) {
          this.error = 'Se guardaron los datos, pero el servidor no confirmó la fotografía. Verifica el registro.';
        } else {
          this.mensaje = datos.foto
            ? 'Producto y fotografía actualizados correctamente en MySQL.'
            : 'Producto actualizado correctamente.';
        }
        this.limpiarFormulario();
        // No borrar la advertencia si el backend no confirmó la fotografía.
        this.listar(false);
      },
      error: e => {
        this.guardando = false;
        this.error = this.mensajeError(e, 'No se pudo actualizar el producto.');
      }
    });
  }

  eliminar(id: number): void {
    if (!confirm('¿Deseas desactivar este producto?')) return;
    this.productoService.eliminar(id).subscribe({
      next: r => { this.mensaje = r.mensaje; this.listar(); },
      error: e => this.error = this.mensajeError(e, 'No se pudo desactivar el producto.')
    });
  }

  get totalProductos(): number {
    return this.productos.length;
  }

  get productosActivos(): number {
    return this.productos.filter(p => String(p.estado).toLowerCase() === 'activo').length;
  }

  get productosStockBajo(): number {
    return this.productos.filter(p => this.esStockBajo(p)).length;
  }

  get valorInventario(): number {
    return this.productos.reduce((total, p) => total + (Number(p.stock || 0) * Number(p.precio_compra || 0)), 0);
  }

  get productosFiltrados(): Producto[] {
    const termino = this.busqueda.trim().toLowerCase();
    if (!termino) return this.productos;
    return this.productos.filter(p => {
      const categoria = String(p.categoria?.nombre_categoria ?? p.id_categoria ?? '').toLowerCase();
      return [
        p.nombre_producto,
        p.codigo_producto,
        p.descripcion,
        categoria
      ].some(valor => String(valor ?? '').toLowerCase().includes(termino));
    });
  }

  esStockBajo(p: Producto): boolean {
    const stock = Number(p.stock || 0);
    const minimo = Number(p.stock_minimo || 0);
    return minimo > 0 && stock <= minimo;
  }

  inicialProducto(nombre?: string): string {
    return String(nombre || 'P').trim().charAt(0).toUpperCase() || 'P';
  }

  /**
   * Carga la fotografía en la misma fila del inventario. No envía los demás
   * datos del producto y confirma la escritura con la respuesta de MySQL.
   */
  seleccionarFotoDirecta(event: Event, item: Producto): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    input.value = '';
    if (!archivo || !item.id_producto || this.fotoCargandoId !== null) return;

    this.mensaje = '';
    this.error = '';
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(archivo.type)) {
      this.error = 'Selecciona una fotografía JPG, PNG o WEBP.';
      return;
    }
    if (archivo.size === 0 || archivo.size > 5 * 1024 * 1024) {
      this.error = 'La fotografía debe pesar entre 1 byte y 5 MB.';
      return;
    }

    const id = item.id_producto;
    this.fotoCargandoId = id;
    this.prepararFotoDirecta(archivo).then(foto => {
      this.productoService.actualizarFoto(id, foto).subscribe({
        next: guardado => {
          this.fotoCargandoId = null;
          if (guardado.foto !== foto) {
            this.error = 'MySQL no confirmó la fotografía. Comprueba el registro.';
            return;
          }
          this.productos = this.productos.map(p => p.id_producto === id ? guardado : p);
          this.mensaje = 'Fotografía guardada en MySQL para ' + item.nombre_producto + '.';
          this.cargarDiagnosticoFotos();
        },
        error: e => {
          this.fotoCargandoId = null;
          this.error = this.mensajeError(e, 'No se pudo guardar la fotografía en MySQL.');
        }
      });
    }).catch((mensaje: string) => {
      this.fotoCargandoId = null;
      this.error = mensaje || 'No se pudo leer la fotografía.';
    });
  }

  private prepararFotoDirecta(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onerror = () => reject('No se pudo leer el archivo seleccionado.');
      lector.onload = () => {
        const imagen = new Image();
        imagen.onerror = () => reject('El archivo seleccionado no es una imagen válida.');
        imagen.onload = () => {
          try {
            // Mantener resolución original cuando sea posible; reducir solo
            // cuando la API necesite una imagen más ligera.
            const dimensiones = [3840, 3200, 2560, 2048, 1600, 1200];
            const calidades = [0.92, 0.88, 0.83, 0.76];
            for (const maximo of dimensiones) {
              const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
              const ancho = Math.max(1, Math.round(imagen.width * escala));
              const alto = Math.max(1, Math.round(imagen.height * escala));
              const canvas = document.createElement('canvas');
              canvas.width = ancho;
              canvas.height = alto;
              const ctx = canvas.getContext('2d');
              if (!ctx) throw new Error('No se pudo preparar la fotografía.');
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(imagen, 0, 0, ancho, alto);
              for (const calidad of calidades) {
                let foto = canvas.toDataURL('image/webp', calidad);
                if (!foto.startsWith('data:image/webp')) {
                  foto = canvas.toDataURL('image/jpeg', calidad);
                }
                if (foto.length <= 2_900_000) {
                  resolve(foto);
                  return;
                }
              }
            }
            reject('La fotografía supera el tamaño admitido. Selecciona una más liviana.');
          } catch {
            reject('No se pudo optimizar la fotografía.');
          }
        };
        imagen.src = String(lector.result || '');
      };
      lector.readAsDataURL(archivo);
    });
  }

  seleccionarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;

    this.error = '';
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp'];
    if (!tiposPermitidos.includes(archivo.type)) {
      this.error = 'La imagen debe ser JPG, PNG o WEBP.';
      input.value = '';
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      this.error = 'La imagen no debe superar los 5 MB.';
      input.value = '';
      return;
    }

    this.procesandoImagen = true;
    const solicitud = ++this.imagenSolicitud;
    const lector = new FileReader();

    lector.onload = () => {
      if (solicitud !== this.imagenSolicitud) return;
      const origen = String(lector.result || '');
      const imagen = new Image();

      imagen.onload = () => {
        if (solicitud !== this.imagenSolicitud) return;
        try {
          // Conservar hasta 4K cuando el archivo cabe en el límite de la API.
          // Antes se reducía cualquier foto a 900 px y quedaba borrosa.
          // Solo se disminuye resolución/calidad cuando el tamaño lo exige.
          const dimensiones = [3840, 3200, 2560, 2048, 1600, 1200];
          const calidades = [0.92, 0.88, 0.83, 0.76];
          let fotoValida = '';

          for (const maximo of dimensiones) {
            const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
            const ancho = Math.max(1, Math.round(imagen.width * escala));
            const alto = Math.max(1, Math.round(imagen.height * escala));
            const canvas = document.createElement('canvas');
            canvas.width = ancho;
            canvas.height = alto;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('No se pudo preparar la imagen.');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(imagen, 0, 0, ancho, alto);

            for (const calidad of calidades) {
              let foto = canvas.toDataURL('image/webp', calidad);
              if (!foto.startsWith('data:image/webp')) {
                foto = canvas.toDataURL('image/jpeg', calidad);
              }
              if (foto.length <= 2_900_000) {
                fotoValida = foto;
                break;
              }
            }
            if (fotoValida) break;
          }

          if (!fotoValida) {
            this.error = 'La fotografía supera el tamaño permitido. Elige una imagen optimizada de hasta 5 MB.';
            this.producto.foto = null;
          } else {
            this.producto.foto = fotoValida;
          }
        } catch {
          this.error = 'No se pudo procesar la imagen seleccionada.';
        } finally {
          this.procesandoImagen = false;
          input.value = '';
        }
      };

      imagen.onerror = () => {
        if (solicitud !== this.imagenSolicitud) return;
        this.procesandoImagen = false;
        this.error = 'El archivo seleccionado no contiene una imagen válida.';
        input.value = '';
      };

      imagen.src = origen;
    };

    lector.onerror = () => {
      if (solicitud !== this.imagenSolicitud) return;
      this.procesandoImagen = false;
      this.error = 'No se pudo leer la imagen seleccionada.';
      input.value = '';
    };

    lector.readAsDataURL(archivo);
  }

  quitarImagen(): void {
    this.imagenSolicitud++;
    this.procesandoImagen = false;
    this.producto.foto = null;
  }

  cerrarSesion(): void {
    this.auth.logout().subscribe({
      next: () => { this.auth.limpiarSesion(); this.router.navigate(['/login']); },
      error: () => { this.auth.limpiarSesion(); this.router.navigate(['/login']); }
    });
  }

  limpiarFormulario(): void {
    this.imagenSolicitud++;
    this.procesandoImagen = false;
    const cat = this.categorias[0]?.id_categoria ?? 0;
    this.producto = this.productoVacio();
    this.producto.id_categoria = cat;
    this.editando = false;
  }

  private productoVacio(): Producto {
    return {
      id_categoria: 0,
      codigo_producto: '',
      nombre_producto: '',
      descripcion: '',
      foto: null,
      precio_compra: 0,
      precio_venta: 0,
      stock: 0,
      stock_minimo: 0,
      unidad_medida: 'Unidad',
      estado: 'Activo'
    };
  }

  private mensajeError(e: any, fallback: string): string {
    if (e?.status === 401) {
      this.auth.limpiarSesion();
      this.router.navigate(['/login']);
      return 'La sesión venció.';
    }
    if (e?.status === 403) return 'Tu usuario no tiene permisos de Administrador.';
    const errores = e?.error?.errors;
    if (errores) {
      const primero = Object.values(errores)[0];
      if (Array.isArray(primero) && primero[0]) return String(primero[0]);
    }
    return e?.error?.mensaje ?? fallback;
  }
}
