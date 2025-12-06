import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdenesService, Orden, OrdenesProximasVencer } from '../../services/ordenes.service'

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioComponent implements OnInit{
  // Arrays para ambas secciones
  ordenesVencidas: Orden[] = [];
  ordenesProximas: Orden[] = [];

  // Para el modal de detalles (boton "ver orden")
  ordenSeleccionada: Orden | null = null;
  mostrarModal: boolean = false;

  cargando: boolean = false;
  error: string | null = null;

  constructor(private ordenesService: OrdenesService) {}

  ngOnInit(): void {
    this.cargarOrdenesProximasVencer();
  }

  cargarOrdenesProximasVencer(): void {
    this.cargando = true;
    this.error = null;

    this.ordenesService.ordenesProximasVencer().subscribe({
      next: (data) => {
        this.ordenesVencidas = data.vencidas.ordenes;
        this.ordenesProximas = data.proximas.ordenes;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar ordenes: ', error);
        this.error = 'Error al cargar ordenes';
        this.cargando = false;
      }
    });
  }

  calcularDiasRestantes(fechaLimite: Date): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const limite = new Date(fechaLimite);
    limite.setHours(0, 0, 0, 0);

    const diferencia = limite.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  }

  obtenerTextoDias(orden: Orden): string {
    const dias = this.calcularDiasRestantes(orden.fecha_limite);

    if (dias < 0) {
      return `Vencida hace ${Math.abs(dias)} dia${Math.abs(dias) !== 1 ? 's' : ''}`;
    } else if (dias === 0) {
      return 'Vence hoy';
    } else {
      return `${dias} dia${dias !== 1 ? 's' : ''}`;
    }
  }

  getClaseUrgencia(orden: Orden): string {
    const dias = this.calcularDiasRestantes(orden.fecha_limite);

    if (dias < 0) return 'vencida';
    if (dias <= 7) return 'urgente';
    if (dias <= 14) return 'atencion';
    return 'normal';
  }

  verDetallesOrden(ordenId: string): void {
    this.cargando = true;

    this.ordenesService.verOrdenPorId(ordenId).subscribe({
      next: (orden) => {
        this.ordenSeleccionada = orden;
        this.mostrarModal = true;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar detalles de la orden: ', error);
        this.error = 'Error al cargar detalles de la orden';
        this.cargando = false;
      }
    });
  }

  cerrarModal(): void {
    this.mostrarModal = false;
    this.ordenSeleccionada = null;
  }

  trackByOrdenId(index: number, orden: Orden): string {
    return orden._id!;
  }
}