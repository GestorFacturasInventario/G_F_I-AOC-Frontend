import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cotizacion {
  _id: string;
  numero_cot: string;
  cliente: string;
  descripcion_cot?: string;
  archivo_cot?: string;
  costo: number;
  moneda: 'MXN' | 'USD';
  estado_cot: string;
  createdAt: string;
  updatedAt: string;
}

export interface FiltrosCotizacion {
  q?: string;        // Búsqueda de texto
  estado?: string;   // Estado
  anio?: number;     // Año
  mes?: number;      // Mes (1-12)
}

@Injectable({
  providedIn: 'root'
})
export class CotizacionesService {
  private apiUrl = 'http://localhost:3000/api/cotizaciones';

  constructor(private http: HttpClient) {}

  // Obtener todas
  obtenerCotizaciones(): Observable<Cotizacion[]> {
    return this.http.get<Cotizacion[]>(`${this.apiUrl}/index`);
  }

  // Obtener con filtros
  obtenerConFiltros(filtros: FiltrosCotizacion): Observable<any> {
    let params = new HttpParams();
    
    if (filtros.q) params = params.set('q', filtros.q);
    if (filtros.estado) params = params.set('estado', filtros.estado);
    if (filtros.anio) params = params.set('anio', filtros.anio.toString());
    if (filtros.mes) params = params.set('mes', filtros.mes.toString());

    return this.http.get<any>(`${this.apiUrl}/filtros`, { params });
  }

  // Obtener años disponibles
  obtenerAniosDisponibles(): Observable<{ años: number[] }> {
    return this.http.get<{ años: number[] }>(`${this.apiUrl}/anios`);
  }

  crearCotizacion(cotizacion: any): Observable<Cotizacion> {
    return this.http.post<Cotizacion>(`${this.apiUrl}/store`, cotizacion);
  }

  actualizarCotizacion(id: string, cotizacion: any): Observable<Cotizacion> {
    return this.http.put<Cotizacion>(`${this.apiUrl}/update/${id}`, cotizacion);
  }

  cambiarEstado(id: string, nuevoEstado: string): Observable<any> {
    return this.http.patch<Cotizacion>(`${this.apiUrl}/change/status/${id}`, {
      estado_cot: nuevoEstado
    });
  }

  eliminarCotizacion(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`);
  }
}