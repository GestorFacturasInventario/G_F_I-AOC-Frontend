import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FacturasService, Factura, FiltrosFactura } from '../../services/facturas.service';
import { SearchService } from '../../services/serchbar.service';
import { ConfirmarService } from '../../services/confirmar.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-facturas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './facturas.html',
  styleUrl: './facturas.css',
})
export class FacturasComponent implements OnInit, OnDestroy {
  facturas: Factura[] = [];
  facturasFiltradas: Factura[] = [];
  cargando: boolean = false;
  mensaje: string = '';
  tipoMensaje: 'success' | 'error' | 'info' = 'info';

  // Filtros
  filtroAnio: number | null = null;
  filtroMes: number | null = null;
  aniosDisponibles: number[] =[];
  mostrarFiltros: boolean = false;

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

  // Para edicion de facturas
  facturaSeleccionada: Factura | null = null;
  mostrarFormularioEdicion: boolean = false;
  nombreArchivo: string = ''; 
  datosEdicion = {
    concepto: '',
    cantidad: 0,
    archivo_fac: null
  };

  private searchSubscription?: Subscription;

  constructor(
    private facturasService: FacturasService,
    private searchService: SearchService,
    private confirmarService: ConfirmarService
  ) {}
  
  ngOnInit(): void {
    this.cargarFacturas();
    this.cargarAniosDisponibles();

    this.searchSubscription = this.searchService.searchQuery$
      .pipe(debounceTime(300),
      distinctUntilChanged()
      )
      .subscribe(query => {
        this.aplicarFiltros(query);
      });
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  cargarFacturas(): void {
    this.cargando = true;
    this.facturasService.obtenerFacturas().subscribe({
      next: (data) => {
        this.facturas = data;
        this.facturasFiltradas = data;

        const currentQuery = this.searchService.getCurrentQuery();
        if (currentQuery) {
          this.aplicarFiltros();
        }
        
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar las facturas: ', error);
        this.mostrarMensaje('Error al cargar facturas', 'error');
        this.cargando = false;
      }
    });
  }

  cargarAniosDisponibles(): void {
    this.facturasService.obtenerAniosDisponibles().subscribe({
      next: (data) => {
        this.aniosDisponibles = data.años;
      },
      error: (error) => {
        console.error('Error al cargar años: ', error);
      }
    });
  }

  aplicarFiltros(queryBusqueda?: string): void {
    if (this.filtroAnio || this.filtroMes) {
      this.aplicarFiltrosServidor(queryBusqueda);
    } else {
      this.filtrarFacturasLocal(queryBusqueda || '');
    }
  }

  aplicarFiltrosServidor(queryBusqueda?: string): void {
    this.cargando = true;
    
    const filtros: any = {};

    if (queryBusqueda && queryBusqueda.trim()) {
      filtros.q = queryBusqueda.trim();
    }
    
    if (this.filtroAnio) {
      filtros.anio = this.filtroAnio;
    }

    if (this.filtroMes) {
      filtros.mes = this.filtroMes;
    }

    this.facturasService.obtenerConFiltros(filtros).subscribe({
      next: (data) => {
        this.facturas = data.facturas || [];
        this.facturasFiltradas = this.facturas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al aplicar filtros: ', error);
        this.mostrarMensaje('Error al aplicar filtros', 'error');
        this.cargando = false;
      }
    });
  }

  filtrarFacturasLocal(query: string): void {
    if (!query || !query.trim()) {
      this.facturasFiltradas = this.facturas;
      return;
    }

    const queryLower = query.toLowerCase().trim();

    this.facturasFiltradas = this.facturas.filter(factura => {
      return (
        (factura.numero_fac && factura.numero_fac.toLowerCase().includes(queryLower)) ||
        (factura.concepto && factura.concepto.toLowerCase().includes(queryLower)) ||
        (factura.orden_id?.referencia_ord && factura.orden_id?.referencia_ord.toLowerCase().includes(queryLower)) ||
        (factura.orden_id?.cotizacion_id?.numero_cot && factura.orden_id?.cotizacion_id?.numero_cot.toLowerCase().includes(queryLower)) ||
        (factura.orden_id?.cotizacion_id?.cliente && factura.orden_id?.cotizacion_id?.cliente.toLowerCase().includes(queryLower))
      );
    });
  }

  limpiarFiltros(): void {
    this.filtroAnio = null;
    this.filtroMes = null;
    this.searchService.clearSearch();
    this.cargarFacturas(); 
  }

  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  get filtrosActivos(): boolean {
    return !!(this.filtroAnio || this.filtroMes);
  }

  onArchivoSeleccionado(event: any): void {
    const file = event.target.files[0];

    if (file) {
      this.datosEdicion.archivo_fac = file;
      this.nombreArchivo = file.name;
    }
  }

  descargarArchivo(factura: Factura): void {
    if (!factura.archivo_fac) {
      this.mostrarMensaje('No hay archivo adjunto', 'error');
      return
    }

    this.cargando = true;
    this.facturasService.obtenerUrlDescargar(factura._id!).subscribe({
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

  abrirFormularioEdicion(factura: Factura): void {
    this.facturaSeleccionada = factura;
    this.datosEdicion = {
      concepto: factura.concepto,
      cantidad: factura.cantidad,
      archivo_fac: null
    };
    this.mostrarFormularioEdicion = true;
  }

  cerrarFormularioEdicion(): void {
    this.mostrarFormularioEdicion = false;
    this.facturaSeleccionada = null;
    this.datosEdicion = {
      concepto: '',
      cantidad: 0,
      archivo_fac: null
    };
  }

  async actualizarFactura(): Promise<void> {
    if (!this.facturaSeleccionada) return;

    const formData = new FormData();
    formData.append('concepto', this.datosEdicion.concepto);
    formData.append('cantidad', this.datosEdicion.cantidad.toString());

    if (this.datosEdicion.archivo_fac) {
      formData.append('archivo_fac', this.datosEdicion.archivo_fac);
    }

    const confirmado = await this.confirmarService.confirm({
      titulo: 'Actualizar Factura',
      mensaje: `¿Quieres actualizar la factura: "${this.facturaSeleccionada.numero_fac}"?`,
      textoConfirmar: 'Si, actualizar',
      textoCancelar: 'Cancelar',
      tipo: 'info'
    });

    if (!confirmado) return;

    this.cargando = true;
    this.facturasService.actualizarFactura(this.facturaSeleccionada._id!, formData).subscribe({
      next: () => {
        this.mostrarMensaje('Factura actualizada correctamente', 'success');
        this.cerrarFormularioEdicion();
        this.cargarFacturas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al actualizar factura: ', error);
        this.mostrarMensaje('Error al actualizar factura', 'error');
        this.cargando = false;
      }
    });
  }

  async eliminarFactura(factura: Factura): Promise<void> {
    const confirmacion = await this.confirmarService.confirm({
      titulo: 'Eliminar Factura',
      mensaje: `¿Estás seguro de querer eliminar la factura: "${factura.numero_fac}"?`,
      textoConfirmar: 'Si, eliminar',
      textoCancelar: 'Cancelar',
      tipo: 'danger'
    });

    if (!confirmacion) return;

    this.cargando = true;
    this.facturasService.eliminarFactura(factura._id!).subscribe({
      next: () => {
        this.mostrarMensaje('Factura eliminada correctamente', 'success');
        this.cargarFacturas();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al eliminar factura: ', error);
        const mensaje = error.error?.mensaje || 'Error al eliminar factura';
        this.mostrarMensaje(mensaje, 'error');
        this.cargando = false;
      }
    });
  }

  // Utilidades
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error' | 'info'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = '';
    }, 5000);
  }

  trackByFacturaId(index: number, factura: Factura): string {
    return factura._id;
  }
}
