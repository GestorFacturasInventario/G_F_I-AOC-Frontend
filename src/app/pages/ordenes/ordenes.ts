import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService, Orden } from '../../services/ordenes.service';
import { FacturasService } from '../../services/facturas.service';
import { SearchService } from '../../services/serchbar.service';
import { ConfirmarService } from '../../services/confirmar.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-ordenes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ordenes.html',
  styleUrl: './ordenes.css',
})
export class OrdenesComponent implements OnInit, OnDestroy {
  ordenes: Orden[] = [];
  ordenesFiltradas: Orden[] = [];

  filtroEstado:  string = '';
  filtroAnio:  number | null = null;
  filtroMes: number | null = null;
  aniosDisponibles: number[] = [];
  mostrarFiltros: boolean = false;

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

  //Para edicion de ordenes
  ordenSeleccionada: Orden | null = null;
  mostrarFormularioEdicion: boolean = false;
  datosEdicion = {
    descripcion_ord: '',
    empleado: '',
    archivo_ord: '',
    fecha_limite: '',
    descuento: 0
  }
  // Para archivos
  archivoSeleccionado: File | null = null;
  nombreArchivo: string = '';

  // Boton de ver facturas desde ordenes
  facturas: any[] = [];
  mostrarFacturas = false;

  // Para generar facturas
  ordenParaFactura: Orden | null = null;
  mostrarFormularioFactura: boolean = false;
  datosFactura = {
    numero_fac: '',
    concepto: '',
    cantidad: 0,
    archivo_fac: null
  }

  private searchSubscription?: Subscription;

  constructor(
    private ordenesService: OrdenesService,
    private facturasService: FacturasService,
    private searchService: SearchService,
    private confirmarService: ConfirmarService
  ) {}

  ngOnInit(): void {
      this.cargarOrdenes();
      this.cargarAniosDisponibles();

      this.searchSubscription = this.searchService.searchQuery$
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(query => {
          this.aplicarFiltros(query);
        });
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    this.searchSubscription?.unsubscribe();
  }

  cargarAniosDisponibles(): void {
    this.ordenesService.obtenerAniosDisponibles().subscribe({
      next: (response) => {
        this.aniosDisponibles = response.años;
      },
      error: (error) => {
        console.error('Error al cargar años: ', error);
      }
    });
  }

  cargarOrdenes(): void {
    this.cargando = true;
    this.ordenesService.obtenerOrdenes().subscribe({
      next: (ordenes) => {
        this.ordenes = ordenes;
        this.ordenesFiltradas = ordenes;

        const currentQuery = this.searchService.getCurrentQuery();
        if (currentQuery) {
          this.aplicarFiltros(currentQuery);
        }

        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar ordenes: ', error);
        this.mostrarMensaje('Error al cargar ordenes', 'error');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(queryBusqueda?: string): void {
    if (this.filtroEstado || this.filtroAnio || this.filtroMes) {
      this.aplicarFiltrosServidor(queryBusqueda);
    } else {
      this.filtrarOrdenesLocal(queryBusqueda || '');
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

     this.ordenesService.obtenerConFiltros(filtros).subscribe({
      next: (response) => {
        this.ordenesFiltradas = response.ordenes || response;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar ordenes: ', error);
        this.mostrarMensaje('Error al aplicar filtros', 'error');
        this.cargando = false;
      }
     });
  }

  filtrarOrdenesLocal(query: string): void {
    if (!query || !query.trim()) {
      this.ordenesFiltradas = this.ordenes;
      return;
    }

    const queryLower = query.toLowerCase().trim();

    this.ordenesFiltradas = this.ordenes.filter(orden => {
      return (
        (orden.referencia_ord && orden.referencia_ord.toLowerCase().includes(queryLower)) ||
        (orden.empleado && orden.empleado.toLowerCase().includes(queryLower)) ||
        (orden.cotizacion_id?.numero_cot && orden.cotizacion_id?.numero_cot.toLowerCase().includes(queryLower)) ||
        (orden.cotizacion_id?.cliente && orden.cotizacion_id?.cliente.toLowerCase().includes(queryLower))
      );
    });
  }

  limpiarFiltros(): void {
    this.filtroEstado = '';
    this.filtroAnio = null;
    this.filtroMes = null;
    this.searchService.clearSearch();
    this.cargarOrdenes();
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  get filtrosActivos(): boolean {
    return !!(this.filtroEstado || this.filtroAnio || this.filtroMes);
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }

  calcularTotalOriginal(orden: Orden): number {
    if (!orden.descuento || orden.descuento === 0) return orden.total;
    return orden.total / (1 - (orden.descuento / 100));
  }

  calcularAhorro(orden: Orden): number {
    if (!orden.descuento || orden.descuento === 0) return 0;
    return this.calcularTotalOriginal(orden) - orden.total;
  }

  estaVencida(orden: Orden): boolean {
    const hoy = new Date();
    const fechaLimite = new Date(orden.fecha_limite);
    return fechaLimite < hoy && orden.estado_ord === 'pendiente';
  }

  diasRestantes(orden: Orden): number{
    const hoy = new Date();
    const fechaLimite = new Date(orden.fecha_limite);
    const diferencia = fechaLimite.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  // Bloque para edicion de ordenes y eliminacion
  get fechaMinima(): string {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  }

  onArchivoSeleccionado(event: any, tipo: 'orden' | 'factura'): void {
    const file = event.target.files[0];

    if (!file) return;

    if (tipo === 'orden') {
      this.datosEdicion.archivo_ord = file;
    } else if (tipo === 'factura') {
      this.datosFactura.archivo_fac = file;
    }

    this.nombreArchivo = file.name;
  }

  //Funcion para descargar el archivo
  descargarArchivo(orden: Orden): void {
    if (!orden.archivo_ord) {
      this.mostrarMensaje('No hay archivo adjunto', 'error');
      return;
    }

    this.cargando = true;
    this.ordenesService.obtenerUrlDescarga(orden._id!).subscribe({
      next: (response) => {
        window.open(response.url, '_blank');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener UR: ', error);
        this.mostrarMensaje('Error al descargar archivo', 'error');
        this.cargando = false;
      }
    });
  }

  abrirFormularioEdicion(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.mostrarFormularioEdicion = true;

    // Cargar datos actuales
    this.datosEdicion = {
      descripcion_ord: orden.descripcion_ord,
      empleado: orden.empleado,
      archivo_ord: orden.archivo_ord || '',
      fecha_limite: new Date(orden.fecha_limite).toISOString().split('T')[0],
      descuento: orden.descuento || 0,
    };
  }

  cerrarFormularioEdicion(): void {
    this.mostrarFormularioEdicion = false;
    this.ordenSeleccionada = null;
  }

  async actualizarOrden(): Promise<void> {
    if (!this.ordenSeleccionada) return;

    const formData = new FormData();
    formData.append('empleado', this.datosEdicion.empleado);
    formData.append('fecha_limite', this.datosEdicion.fecha_limite);
    
    if (this.datosEdicion.descripcion_ord !== undefined) {
      formData.append('descripcion_ord', this.datosEdicion.descripcion_ord)
    }
    
    if (this.datosEdicion.descuento !== undefined) {
      formData.append('descuento', this.datosEdicion.descuento.toString());
    }

    if (this.datosEdicion.archivo_ord) {
      formData.append('archivo_ord', this.datosEdicion.archivo_ord);
    }

    const confirmado = await this.confirmarService.confirm({
      titulo: 'Actualizar Orden',
      mensaje: `¿Quieres actualizar la orden: "${this.ordenSeleccionada.referencia_ord}"?`,
      textoConfirmar: 'Si, actualizar',
      textoCancelar: 'Cancelar',
      tipo: 'info'
    });

    if (!confirmado) return;

    this.cargando = true;
    this.ordenesService.actualizarOrden(this.ordenSeleccionada._id!, formData).subscribe({
      next: () => {
        this.mostrarMensaje('Orden actualizada correctamente', 'success');
        this.cerrarFormularioEdicion();
        this.cargarOrdenes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar orden: ', error);
        const mensaje = error.error?.mensaje || 'Error al actualizar orden';
        this.mostrarMensaje('Error al actualizar orden', 'error');
        this.cargando = false;
      }
    });
  }

  async eliminarOrden(orden: Orden, event: Event): Promise<void> {
    event.stopPropagation();

    const confirmado = await this.confirmarService.confirm({
      titulo: 'Eliminar Orden',
      mensaje: `¿Estas seguro de eliminar la orden: "${orden.referencia_ord}"?`,
      textoConfirmar: 'Si, eliminar',
      textoCancelar: 'Cancelar',
      tipo: 'danger'
    });

    if (!confirmado) return;

    this.cargando = true;
    this.ordenesService.eliminarOrden(orden._id!).subscribe({
      next: () => {
        this.mostrarMensaje('Orden eliminada correctamente', 'success');
        this.cargarOrdenes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar orden: ', error);
        const mensaje = error.error?.mensaje || 'Error al eliminar orden';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  verFacturas(orden: Orden) {
    this.cargando = true;

    this.ordenesService.verFacturasDeOrden(orden._id!).subscribe({
      next: (data) => {
        this.facturas = data.facturas;
        this.mostrarFacturas = true;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar facturas: ', error);
        this.cargando = false;
      }
    });
  }

  cerrarFacturas() {
    this.mostrarFacturas = false;
    this.cargarOrdenes();
  }

  // Funcion para descargar el archivo de las facturas
  descargarArchivoFactura(facturaId: string): void {
    this.cargando = true;
    this.facturasService.obtenerUrlDescargar(facturaId).subscribe({
      next: (response) => {
        window.open(response.url, '_blank');
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener URL: ', error);
        this.mostrarMensaje('Error al descargar archivo', 'error');
        this.cargando = false;
      }
    });
  }

  // Generacion de facturas
  puedeGenerarFactura(orden: Orden): boolean {
    return orden.estado_ord === 'pendiente';
  }

  abrirFormularioFactura(orden: Orden, event: Event): void {
    event.stopPropagation();
    this.ordenParaFactura = orden;
    this.mostrarFormularioFactura = true;

    this.datosFactura = {
      numero_fac: '',
      concepto: '',
      cantidad: 0,
      archivo_fac: null
    };
  }

  cerrarFormularioFactura(): void {
    this.mostrarFormularioFactura = false;
    this.ordenParaFactura = null;
  }

  async generarFactura(): Promise<void> {
    if (!this.ordenParaFactura) return;

    const formData = new FormData();
    formData.append('numero_fac', this.datosFactura.numero_fac);
    formData.append('concepto', this.datosFactura.concepto);
    formData.append('cantidad', this.datosFactura.cantidad.toString());

    if (this.datosFactura.archivo_fac) {
      formData.append('archivo_fac', this.datosFactura.archivo_fac);
    }

    const confirmado = await this.confirmarService.confirm({
      titulo: 'Generar Factura',
      mensaje: `¿Quieres generar la factura para la orden: "${this.ordenParaFactura.referencia_ord}"?`,
      textoConfirmar: 'Si, generar',
      textoCancelar: 'Cancelar',
      tipo: 'success'
    });

    if (!confirmado) return;

    this.cargando = true;
    this.facturasService.generarFactura(this.ordenParaFactura._id!, formData!).subscribe({
      next: () => {
        this.mostrarMensaje('Factura generada correctamente', 'success');
        this.cerrarFormularioFactura();
        this.cargarOrdenes();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al generar factura: ', error);
        const mensaje = error.error?.mensaje || 'Error al generar factura';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  trackByOrdenId(index: number, orden: Orden): string {
    return orden._id!;
  }
}