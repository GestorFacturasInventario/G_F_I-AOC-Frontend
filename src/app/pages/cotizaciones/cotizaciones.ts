import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionesService, Cotizacion } from '../../services/cotizaciones.service';
import { OrdenesService, CrearOrdenData } from '../../services/ordenes.service';
import { SearchService } from '../../services/serchbar.service';
import { Subscription } from 'rxjs';
import { ConfirmarService } from '../../services/confirmar.service';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.css',
})
export class CotizacionesComponent implements OnInit {
  cotizaciones: Cotizacion[] = [];
  cotizacionesFiltradas: Cotizacion[] = [];
  cotizacionSeleccionada: Cotizacion | null = null;

  // Datos del formulario
  numero_cot: string = '';
  cliente: string = '';
  descripcion_cot: string = '';
  archivo_cot: string = '';
  costo: number = 0;
  moneda: 'MXN' | 'USD' = 'MXN';
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  // Filtros
  filtroEstado: string = '';
  filtroAnio: number | null = null;
  filtroMes: number | null = null;
  aniosDisponibles: number[] = [];
  mostrarFiltros: boolean = false;

  // Estado
  cargando: boolean = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' = 'success';

  meses = [
    { valor: 1, nombre: 'Enero' },
    { valor: 2, nombre: 'Febrero' },
    { valor: 3, nombre: 'Marzo' },
    { valor: 4, nombre: 'Abril' },
    { valor: 5, nombre: 'Mayo' },
    { valor: 6, nombre: 'Junio' },
    { valor: 7, nombre: 'Julio' },
    { valor: 8, nombre: 'Agosto' },
    { valor: 9, nombre: 'Septiembre' },
    { valor: 10, nombre: 'Octubre' },
    { valor: 11, nombre: 'Noviembre' },
    { valor: 12, nombre: 'Diciembre' }
  ];

  mostrarFormularioOrden: boolean = false;
  cotizacionParaOrden: Cotizacion | null = null;

  ordenData: CrearOrdenData = {
    referencia_ord: '',
    descripcion_ord: '',
    empleado: '',
    archivo_ord: null,
    fecha_limite: '',
    descuento: 0
  };

  private searchSubscription?: Subscription;

  constructor(
    private cotizacionesService: CotizacionesService,
    private ordenesService: OrdenesService,
    private searchService: SearchService,
    private confirmarService: ConfirmarService
  ) {}

  ngOnInit(): void {
    this.cargarCotizaciones();
    this.cargarAniosDisponibles();

    this.searchSubscription = this.searchService.searchQuery$.subscribe(query => {
      this.aplicarFiltros(query);
    });
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    this.searchSubscription?.unsubscribe();
  }

  cargarAniosDisponibles(): void {
    this.cotizacionesService.obtenerAniosDisponibles().subscribe({
      next: (response) => {
        this.aniosDisponibles = response.años;
      },
      error: (error) => {
        console.error('Error al cargar años:', error);
      }
    });
  }

  cargarCotizaciones(): void {
    this.cargando = true;
    this.cotizacionesService.obtenerCotizaciones().subscribe({
      next: (cotizaciones) => {
        this.cotizaciones = cotizaciones;
        this.cotizacionesFiltradas = cotizaciones;

        const currentQuery = this.searchService.getCurrentQuery();
        if (currentQuery) {
          this.aplicarFiltros(currentQuery);
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar las cotizaciones:', error);
        this.mostrarMensaje('Error al cargar cotizaciones', 'error');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(queryBusqueda?: string): void {
    if (this.filtroEstado || this.filtroAnio || this.filtroMes) {
      this.aplicarFiltrosServidor(queryBusqueda);
    } else {
      this.filtrarCotizacionesLocal(queryBusqueda || '');
    }
  }

  aplicarFiltrosServidor(queryBusqueda?: string): void {
    this.cargando = true;
    
    const filtros: any = {};
    
    if (queryBusqueda && queryBusqueda.trim()) {
      filtros.q = queryBusqueda.trim();
    }
    
    if (this.filtroEstado) {
      filtros.estado = this.filtroEstado;
    }
    
    if (this.filtroAnio) {
      filtros.anio = this.filtroAnio;
    }
    
    if (this.filtroMes) {
      filtros.mes = this.filtroMes;
    }

    this.cotizacionesService.obtenerConFiltros(filtros).subscribe({
      next: (response) => {
        this.cotizacionesFiltradas = response.cotizaciones || response;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar cotizaciones:', error);
        this.mostrarMensaje('Error al aplicar filtros', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarCotizacionesLocal(query: string): void {
    if (!query || !query.trim()) {
      this.cotizacionesFiltradas = this.cotizaciones;
      return;
    }

    const queryLower = query.toLowerCase().trim();

    this.cotizacionesFiltradas = this.cotizaciones.filter(cotizaciones => {
      return (
        (cotizaciones.numero_cot && cotizaciones.numero_cot.toLowerCase().includes(queryLower)) ||
        (cotizaciones.cliente && cotizaciones.cliente.toLowerCase().includes(queryLower))
      );
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroAnio = null;
    this.filtroMes = null;
    this.searchService.clearSearch();
    this.cargarCotizaciones();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  get filtrosActivos(): boolean {
    return !!(this.filtroEstado || this.filtroAnio || this.filtroMes);
  }

  seleccionarCotizacion(cotizacion: Cotizacion): void {
    this.cotizacionSeleccionada = cotizacion;
    this.numero_cot = cotizacion.numero_cot || '';
    this.cliente = cotizacion.cliente || '';
    this.descripcion_cot = cotizacion.descripcion_cot || '';
    this.archivo_cot = cotizacion.archivo_cot || '';
    this.costo = cotizacion.costo || 0;
    this.moneda = cotizacion.moneda || 'MXN';
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
  }

  limpiarFormulario(): void {
    this.cotizacionSeleccionada = null;
    this.numero_cot = '';
    this.cliente = '';
    this.descripcion_cot = '';
    this.archivo_cot = '';
    this.costo = 0;
    this.moneda = 'MXN';
    this.archivoSeleccionado = null;
    this.nombreArchivo = '';
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

  onArchivoSeleccionado(event: any, tipo: 'cotizacion' | 'orden'): void {
    const file = event.target.files[0];
    
    if (!file) return;

    if (tipo === 'cotizacion') {
      this.archivoSeleccionado = file;
    } else if (tipo === 'orden') {
      this.ordenData.archivo_ord = file;
    }

    this.nombreArchivo = file.name;
  }

  validarFormulario(): boolean {
    if (!this.numero_cot || !this.numero_cot.trim()) {
      this.mostrarMensaje('El número de cotización es obligatorio', 'error');
      return false;
    }
    if (!this.cliente || !this.cliente.trim()) {
      this.mostrarMensaje('El cliente es obligatorio', 'error');
      return false;
    }
    if (!this.descripcion_cot || !this.descripcion_cot.trim()) {
      this.mostrarMensaje('La descripción es obligatoria', 'error');
      return false;
    }
    // Al crear: el archivo es obligatorio
    if (!this.cotizacionSeleccionada && !this.archivoSeleccionado) {
      this.mostrarMensaje('El archivo es obligatorio', 'error');
      return false;
    }
    if (!this.costo || this.costo <= 0) {
      this.mostrarMensaje('El costo debe ser mayor a 0', 'error');
      return false;
    }
    if (!this.moneda) {
      this.mostrarMensaje('La moneda es obligatoria', 'error');
      return false;
    }
    return true;
  }

  guardarCotizacion(): void {
    if (!this.validarFormulario()) return;

    this.cargando = true;
    
    // Crear FormData para enviar archivo
    const formData = new FormData();
    formData.append('numero_cot', this.numero_cot);
    formData.append('cliente', this.cliente);
    formData.append('descripcion_cot', this.descripcion_cot);
    formData.append('costo', this.costo.toString());
    formData.append('moneda', this.moneda);
    
    // Agregar archivo si hay uno seleccionado
    if (this.archivoSeleccionado) {
      formData.append('archivo_cot', this.archivoSeleccionado);
    }

    if (this.cotizacionSeleccionada) {
      // Método para actualizar
      this.cotizacionesService.actualizarCotizacion(this.cotizacionSeleccionada._id!, formData).subscribe({
        next: () => {
          this.mostrarMensaje('Cotización actualizada correctamente', 'success');
          this.cargarCotizaciones();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar cotización:', error);
          const mensaje = error.error?.mensaje || 'Error al actualizar cotización';
          this.mostrarMensaje(mensaje, 'error');
          this.cargando = false;
        }
      });
    } else {
      // Método para crear
      this.cotizacionesService.crearCotizacion(formData).subscribe({
        next: () => {
          this.mostrarMensaje('Cotización agregada correctamente', 'success');
          this.cargarCotizaciones();
          this.limpiarFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear cotización:', error);
          const mensaje = error.error?.mensaje || 'Error al crear cotización';
          this.mostrarMensaje(mensaje, 'error');
          this.cargando = false;
        }
      });
    }
  }

   async eliminarCotizacion(cotizacion: Cotizacion): Promise<void> {
    const confirmed = await this.confirmarService.confirm({
      titulo: 'Eliminar Cotizacion',
      mensaje: `¿Estas seguro de eliminar "${cotizacion.numero_cot}"? Esta accion no se puede deshacer.`,
      textoConfirmar: 'Si, eliminar',
      textoCancelar: 'Cancelar',
      tipo: 'danger'
    });
    
    if (!confirmed) return;

    this.cargando = true;
    this.cotizacionesService.eliminarCotizacion(cotizacion._id!).subscribe({
      next: () => {
        this.mostrarMensaje('Cotización eliminada correctamente', 'success');
        this.cargarCotizaciones();
        if (this.cotizacionSeleccionada?._id === cotizacion._id) {
          this.limpiarFormulario();
        }
      },
      error: (error) => {
        console.error('Error al eliminar cotización:', error);
        const mensaje = error.error?.mensaje || 'Error al eliminar cotización';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  async cambiarEstadoCotizacion(cotizacion: Cotizacion, event: Event): Promise<void> {
    event.stopPropagation();

    if (cotizacion.estado_cot === 'aprobado') {
      await this.confirmarService.confirm({
        titulo: 'No permitido',
        mensaje: 'No se puede cambiar el estado de una cotizacion aprobada.',
        textoConfirmar: 'Entendido',
        textoCancelar: 'Cancelar',
        tipo: 'warning'
      });
      return;
    }

    const nuevoEstado = cotizacion.estado_cot === 'en proceso' ? 'rechazado' : 'en proceso';

    const confirmacion = await this.confirmarService.confirm({
      titulo: 'Cambiar estado',
      mensaje: `¿Cambiar estado de "${cotizacion.estado_cot}" a "${nuevoEstado}"?`,
      textoConfirmar: 'Sí, cambiar',
      textoCancelar: 'Cancelar',
      tipo: 'info'
    });

    if (!confirmacion) return;

    this.cargando = true;
    this.cotizacionesService.cambiarEstado(cotizacion._id!, nuevoEstado).subscribe({
      next: (cotizacionActualizada) => {
        this.mostrarMensaje(`Estado cambiado a: ${nuevoEstado}`, 'success');

        //Actualizar el estado en la lista local
        const index = this.cotizacionesFiltradas.findIndex(c => c._id === cotizacion._id);
        if (index !== -1) {
          this.cotizaciones[index] = cotizacionActualizada;
        }

        const indexFiltradas = this.cotizacionesFiltradas.findIndex(c => c._id === cotizacion._id);
        if (indexFiltradas !== -1) {
          this.cotizacionesFiltradas[indexFiltradas] = cotizacionActualizada;
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cambiar estado: ', error);
        const mensaje = error.error?.mensaje || 'Error al cambiar estado';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  puedeEditarEstado(cotizacion: Cotizacion): boolean {
    return cotizacion.estado_cot !== 'aprobado';
  }

  get textoBoton(): string {
    return this.cotizacionSeleccionada ? 'Actualizar' : 'Agregar';
  }

  descargarArchivo(cotizacion: Cotizacion): void {
    if (!cotizacion.archivo_cot) {
      this.mostrarMensaje('No hay archivo adjunto', 'error');
      return;
    }

    this.cargando = true;
    this.cotizacionesService.obtenerUrlDescarga(cotizacion._id!).subscribe({
      next: (response) => {
        // Abrir el archivo en nueva pestaña
        window.open(response.url, '_blank');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener URL:', error);
        this.mostrarMensaje('Error al descargar archivo', 'error');
        this.cargando = false;
      }
    });
  }

  //Funciones para generar orden desde este modulo
  puedeGenerarOrden(cotizacion: Cotizacion): boolean {
    return cotizacion.estado_cot === 'en proceso';
  }

  get fechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  abrirFormularioOrden(cotizacion: Cotizacion): void {
    this.cotizacionParaOrden = cotizacion;
    this.mostrarFormularioOrden = true;

    this.ordenData = {
      referencia_ord: '',
      descripcion_ord: cotizacion.descripcion_cot || '',
      empleado: '',
      archivo_ord: null,
      fecha_limite: this.fechaMinima,
      descuento: 0
    };
  }

  cerrarFormularioOrden(): void {
    this.mostrarFormularioOrden = false;
    this.cotizacionParaOrden = null;
  }

  async generarOrden(): Promise<void> {
    if (!this.cotizacionParaOrden) return;

    const formData = new FormData();
    formData.append('referencia_ord', this.ordenData.referencia_ord);
    formData.append('empleado', this.ordenData.empleado);
    formData.append('fecha_limite', this.ordenData.fecha_limite);

    if (this.ordenData.descripcion_ord !== undefined) {
      formData.append('descripcion_ord', this.ordenData.descripcion_ord);
    }

    if (this.ordenData.descuento !== undefined) {
      formData.append('descuento', this.ordenData.descuento.toString());
    }

    if (this.ordenData.archivo_ord) {
      formData.append('archivo_ord', this.ordenData.archivo_ord);
    }

    //Confirmacion la generacion de la orden
    const confirmado = await this.confirmarService.confirm({
      titulo: 'Generar Orden de Compra',
      mensaje: `¿Quieres generar la orden de la siguiente cotizacion: "${this.cotizacionParaOrden.numero_cot}"?`,
      textoConfirmar: 'Si, generar',
      textoCancelar: 'Cancelar',
      tipo: 'success'
    });

    if (!confirmado) return;

    this.cargando = true;
    this.ordenesService.generarOrden(this.cotizacionParaOrden._id!, formData).subscribe({
      next: (orden) => {
        this.mostrarMensaje('Orden generada correctamente', 'success');
        this.cerrarFormularioOrden();
        this.cargarCotizaciones();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al generar orden: ', error);
        const mensaje = error.error?.mensaje || 'Error al generar orden';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }
}