import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ArticulosService, Articulo } from '../../services/articulos.service';
import { SearchService } from '../../services/serchbar.service';
import { ConfirmarService } from '../../services/confirmar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css',
})
export class InventarioComponent implements OnInit, OnDestroy {
  articulos: Articulo[] = [];
  articulosFiltrados: Articulo[] = [];
  articuloSeleccionado: Articulo | null = null;

  // Datos del formulario
  num_parte: string = '';
  descripcion_art: string = '';
  cantidad: number = 0;
  imagen: string = '';

  // Estado
  cargando: boolean = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' = 'success';
  modoEdicion: boolean = false;

  private searchSubscription?: Subscription;

  constructor(
    private articulosService: ArticulosService,
    private searchService: SearchService,
    private confirmarService: ConfirmarService
  ) {}

  ngOnInit(): void {
    this.cargarArticulos();

    this.searchSubscription = this.searchService.searchQuery$.subscribe(query => {
      this.filtrarArticulosLocal(query);
    });
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    this.searchSubscription?.unsubscribe();
  }

  cargarArticulos(): void {
    this.cargando = true;
    this.articulosService.obtenerArticulos().subscribe({
      next: (articulos) => {
        this.articulos = articulos;
        this.articulosFiltrados = articulos;

        const currentQuery = this.searchService.getCurrentQuery();
        if (currentQuery) {
          this.filtrarArticulosLocal(currentQuery);
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar artículos:', error);
        this.mostrarMensaje('Error al cargar artículos', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarArticulosLocal(query: string): void {
    if (!query || !query.trim()) {
      this.articulosFiltrados = this.articulos;
      return;
    }

    const queryLower = query.toLowerCase().trim();

    this.articulosFiltrados = this.articulos.filter(articulo => {
      return (
        (articulo.num_parte && articulo.num_parte.toLowerCase().includes(queryLower)) ||
        (articulo.descripcion_art && articulo.descripcion_art.toLowerCase().includes(queryLower))
      );
    });
  }

  seleccionarParaEditar(articulo: Articulo): void {
    this.modoEdicion = true;
    this.articuloSeleccionado = articulo;
    this.num_parte = articulo.num_parte || '';
    this.descripcion_art = articulo.descripcion_art || '';
    this.cantidad = articulo.cantidad || 0;
    this.imagen = articulo.imagen || '';
  }

  cancelarEdicion(): void {
    this.limpiarFormulario();
  }

  limpiarFormulario(): void {
    this.modoEdicion = false;
    this.articuloSeleccionado = null;
    this.num_parte = '';
    this.descripcion_art = '';
    this.cantidad = 0;
    this.imagen = '';
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

  validarFormulario(): boolean {
    if (!this.num_parte || !this.num_parte.trim()) {
      this.mostrarMensaje('El número de parte es obligatorio', 'error');
      return false;
    }
    if (!this.descripcion_art || !this.descripcion_art.trim()) {
      this.mostrarMensaje('La descripción es obligatoria', 'error');
      return false;
    }
    if (this.cantidad < 0) {
      this.mostrarMensaje('La cantidad no puede ser negativa', 'error');
      return false;
    }
    if (!this.imagen || !this.imagen.trim()) {
      this.mostrarMensaje('La imagen es obligatoria', 'error');
      return false;
    }
    return true;
  }

  guardarArticulo(): void {
    if (!this.validarFormulario()) return;

    this.cargando = true;
    const datosArticulo = {
      num_parte: this.num_parte,
      descripcion_art: this.descripcion_art,
      cantidad: this.cantidad,
      imagen: this.imagen
    };

    if (this.modoEdicion && this.articuloSeleccionado) {
      // Actualizar artículo existente
      this.articulosService.actualizarArticulo(this.articuloSeleccionado._id!, datosArticulo).subscribe({
        next: () => {
          this.mostrarMensaje('Artículo actualizado correctamente', 'success');
          this.cargarArticulos();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar artículo:', error);
          const mensaje = error.error?.mensaje || 'Error al actualizar artículo';
          this.mostrarMensaje(mensaje, 'error');
          this.cargando = false;
        }
      });
    } else {
      // Crear nuevo artículo
      this.articulosService.crearArticulo(datosArticulo).subscribe({
        next: () => {
          this.mostrarMensaje('Artículo agregado correctamente', 'success');
          this.cargarArticulos();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear artículo:', error);
          const mensaje = error.error?.mensaje || 'Error al crear artículo';
          this.mostrarMensaje(mensaje, 'error');
          this.cargando = false;
        }
      });
    }
  }

  async eliminarArticulo(articulo: Articulo, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmed = await this.confirmarService.confirm({
      titulo: 'Eliminar Artículo',
      mensaje: `¿Estás seguro de eliminar "${articulo.num_parte}"? Esta acción no se puede deshacer.`,
      textoConfirmar: 'Sí, eliminar',
      textoCancelar: 'Cancelar',
      tipo: 'danger'
    });

    if (!confirmed) return;

    this.cargando = true;
    this.articulosService.eliminarArticulo(articulo._id!).subscribe({
      next: () => {
        this.mostrarMensaje('Artículo eliminado correctamente', 'success');
        this.cargarArticulos();
        if (this.articuloSeleccionado?._id === articulo._id) {
          this.limpiarFormulario();
        }
      },
      error: (error) => {
        console.error('Error al eliminar artículo:', error);
        const mensaje = error.error?.mensaje || 'Error al eliminar artículo';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  get textoBoton(): string {
    return this.modoEdicion ? 'Actualizar' : 'Agregar';
  }

  get tituloFormulario(): string {
    return this.modoEdicion ? 'Editar Artículo' : 'Nuevo Artículo';
  }
}
