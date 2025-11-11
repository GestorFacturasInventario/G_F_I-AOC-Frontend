import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CotizacionesService, Cotizacion, FiltrosCotizacion } from '../../services/cotizaciones.service';
import { SearchService } from '../../services/serchbar.service';
import { FilterBarComponent, FilterConfig, FilterValues } from '../../shared/components/filter-bar/filter-bar';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cotizaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterBarComponent],
  templateUrl: './cotizaciones.html',
  styleUrl: './cotizaciones.css',
})
export class CotizacionesComponent implements OnInit, OnDestroy {
  cotizaciones: Cotizacion[] = [];
  cargando: boolean = false;
  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' = 'success';

  // Configuración del FilterBar
  filterConfig: FilterConfig = {
    showDateFilter: true,
    showStatusFilter: true,
    statusOptions: ['Pendiente', 'Aprobada', 'Rechazada', 'Cancelada'],
    aniosDisponibles: []
  };

  // Filtros actuales
  private filtrosActuales: FilterValues = {};
  private terminoBusqueda: string = '';
  private searchSubscription?: Subscription;

  constructor(
    private cotizacionesService: CotizacionesService,
    private searchService: SearchService
  ) {}

  ngOnInit(): void {
    // Cargar años disponibles primero
    this.cargarAniosDisponibles();
    
    // Cargar cotizaciones iniciales
    this.cargarCotizaciones();

    // Suscribirse a búsquedas del SearchBar
    this.searchSubscription = this.searchService.searchQuery$.subscribe(query => {
      this.terminoBusqueda = query;
      this.aplicarFiltros();
    });
  }

  ngOnDestroy(): void {
    this.searchService.clearSearch();
    this.searchSubscription?.unsubscribe();
  }

  cargarAniosDisponibles(): void {
    this.cotizacionesService.obtenerAniosDisponibles().subscribe({
      next: (response) => {
        this.filterConfig.aniosDisponibles = response.años;
      },
      error: (error) => {
        console.error('Error al cargar años:', error);
        // Usar años por defecto si falla
        const anioActual = new Date().getFullYear();
        this.filterConfig.aniosDisponibles = [anioActual, anioActual - 1, anioActual - 2];
      }
    });
  }

  cargarCotizaciones(): void {
    this.cargando = true;
    this.cotizacionesService.obtenerCotizaciones().subscribe({
      next: (cotizaciones) => {
        this.cotizaciones = cotizaciones;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar cotizaciones:', error);
        this.mostrarMensaje('Error al cargar cotizaciones', 'error');
        this.cargando = false;
      }
    });
  }

  // Cuando cambian los filtros del FilterBar
  onFiltersChanged(filters: FilterValues): void {
    this.filtrosActuales = filters;
    this.aplicarFiltros();
  }

  // Cuando se limpian los filtros
  onClearFilters(): void {
    this.filtrosActuales = {};
    this.aplicarFiltros();
  }

  // Aplicar filtros combinando búsqueda + filtros estructurados
  aplicarFiltros(): void {
    this.cargando = true;

    const filtros: FiltrosCotizacion = {
      q: this.terminoBusqueda || undefined,
      estado: this.filtrosActuales.estado,
      anio: this.filtrosActuales.anio,
      mes: this.filtrosActuales.mes
    };

    // Si no hay filtros activos, cargar todas
    if (!filtros.q && !filtros.estado && !filtros.anio && !filtros.mes) {
      this.cargarCotizaciones();
      return;
    }

    // Llamar al endpoint de filtros del backend
    this.cotizacionesService.obtenerConFiltros(filtros).subscribe({
      next: (response) => {
        this.cotizaciones = response.cotizaciones;
        console.log('Filtros aplicados:', response.filtros_aplicados);
        console.log('Total resultados:', response.total);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al filtrar:', error);
        this.mostrarMensaje('Error al aplicar filtros', 'error');
        this.cargando = false;
      }
    });
  }

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;
    setTimeout(() => {
      this.mensaje = null;
    }, 3000);
  }
}