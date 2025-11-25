import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdenesService, Orden } from '../../services/ordenes.service';
import { FacturasService } from '../../services/facturas.service';
import { SearchService } from '../../services/serchbar.service';
import { ConfirmarService } from '../../services/confirmar.service';
import { Subscription } from 'rxjs';

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

  private searchSubscription?: Subscription;

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
  };

  // Para generar facturas
  ordenParaFactura: Orden | null = null;
  mostrarFormularioFactura: boolean = false;
  datosFactura = {
    numero_fac: '',
    concepto: '',
    cantidad: 0
  }

  constructor(
    private ordenesService: OrdenesService,
    private facturasService: FacturasService,
    private searchService: SearchService,
    private confirmarService: ConfirmarService
  ) {}

  ngOnInit(): void {
      this.cargarOrdenes();
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

  calcularTotalConDescuento(orden: Orden): number {
    if (!orden.descuento) return orden.total;
    return orden.total - (orden.total * (orden.descuento / 100));
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

  abrirFormularioEdicion(orden: Orden): void {
    this.ordenSeleccionada = orden;
    this.mostrarFormularioEdicion = true;

    // Cargar datos actuales
    this.datosEdicion = {
      descripcion_ord: orden.descripcion_ord,
      empleado: orden.empleado,
      archivo_ord: orden.archivo_ord,
      fecha_limite: new Date(orden.fecha_limite).toISOString().split('T')[0],
      descuento: orden.descuento || 0
    };
  }

  cerrarFormularioEdicion(): void {
    this.mostrarFormularioEdicion = false;
    this.ordenSeleccionada = null;
  }

  async actualizarOrden(): Promise<void> {
    if (!this.ordenSeleccionada) return;

    if (!this.datosEdicion.descripcion_ord || !this.datosEdicion.descripcion_ord.trim()) {
      this.mostrarMensaje('La descripcion es obligatoria', 'error');
      return;
    }

    if (!this.datosEdicion.empleado || !this.datosEdicion.empleado.trim()) {
      this.mostrarMensaje('El empleado es obligatorio', 'error');
      return;
    }

    if (!this.datosEdicion.archivo_ord || !this.datosEdicion.archivo_ord.trim()) {
      this.mostrarMensaje('El archivo es obligatorio', 'error');
      return;
    }

    if (!this.datosEdicion.fecha_limite) {
      this.mostrarMensaje('La fecha limite es obligatoria', 'error');
      return;
    }

    if (this.datosEdicion.descuento && this.datosEdicion.descuento >= 100) {
      this.mostrarMensaje('El descuento no puede del 100%', 'error');
      return;
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
    this.ordenesService.actualizarOrden(this.ordenSeleccionada._id!, this.datosEdicion).subscribe({
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
      cantidad: 0
    };
  }

  cerrarFormularioFactura(): void {
    this.mostrarFormularioFactura = false;
    this.ordenParaFactura = null;
  }

  async generarFactura(): Promise<void> {
    if (!this.ordenParaFactura) return;

    if (!this.datosFactura.numero_fac || !this.datosFactura.numero_fac.trim()) {
      this.mostrarMensaje('El numero de factura es obligatorio', 'error');
      return;
    }

    if (!this.datosFactura.concepto || !this.datosFactura.concepto.trim()) {
      this.mostrarMensaje('El concepto es obligatorio', 'error');
      return;
    }

    const totalOrden = this.calcularTotalConDescuento(this.ordenParaFactura);
    if (this.datosFactura.cantidad > totalOrden) {
      this.mostrarMensaje('La cantidad ingresada debe ser positiva', 'error');
      return;
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
    this.facturasService.generarFactura(this.ordenParaFactura._id!, this.datosFactura!).subscribe({
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
}