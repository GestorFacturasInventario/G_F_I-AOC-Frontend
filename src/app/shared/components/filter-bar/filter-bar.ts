import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface FilterConfig {
  showDateFilter?: boolean;
  showStatusFilter?: boolean;
  statusOptions?: string[];
  aniosDisponibles?: number[];
}

export interface FilterValues {
  mes?: number;
  anio?: number;
  estado?: string;
}

@Component({
  selector: 'app-filter-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
})
export class FilterBarComponent {
  @Input() config: FilterConfig = {};
  @Output() filtersChanged = new EventEmitter<FilterValues>();
  @Output() clearFilters = new EventEmitter<void>();

  // Valores de los filtros
  mesSeleccionado?: number;
  anioSeleccionado?: number;
  estadoSeleccionado?: string;

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
    { valor: 12, nombre: 'Diciembre' },
  ];

  anios: number[] = [];

  ngOnInit(): void {
    if (this.config.aniosDisponibles && this.config.aniosDisponibles.length > 0) {
      this.anios = this.config.aniosDisponibles;
    } else {
      const anioActual = new Date().getFullYear();
      for (let i = 0; i < 5; i++) {
        this.anios.push(anioActual - i);
      }
    }
  }

  onFilterChange(): void {
    this.filtersChanged.emit({
      mes: this.mesSeleccionado,
      anio: this.anioSeleccionado,
      estado: this.estadoSeleccionado,
    });
  }

  onClearFilters(): void {
    this.mesSeleccionado = undefined;
    this.anioSeleccionado = undefined;
    this.estadoSeleccionado = undefined;
    this.clearFilters.emit();
  }

  get hasActiveFilters(): boolean {
    return !!(this.mesSeleccionado || this.anioSeleccionado || this.estadoSeleccionado);
  }
}