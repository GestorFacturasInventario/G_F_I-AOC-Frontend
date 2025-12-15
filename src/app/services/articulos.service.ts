import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Articulo {
  _id?: string;
  num_parte: string;
  descripcion_art: string;
  cantidad: number;
  imagen_art: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FiltrosArticulo {
  q?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  private apiUrl = `${environment.apiUrl}/articulos`;

  constructor(private http: HttpClient) {}

  obtenerArticulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.apiUrl}/index`);
  }

  buscarArticulo(filtros: FiltrosArticulo): Observable<{total: number, articulo: Articulo[]}> {
    let params = new HttpParams();
    if (filtros.q) params = params.set('q', filtros.q);

    return this.http.get<{total: number, articulo: Articulo[]}>(`${this.apiUrl}/search`, { params });
  }

  crearArticulo(datos: FormData): Observable<Articulo> {
    return this.http.post<Articulo>(`${this.apiUrl}/store`, datos);
  }

  actualizarArticulo(articuloId: string, datos: FormData): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.apiUrl}/update/${articuloId}`, datos);
  }

  eliminarArticulo(articuloId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${articuloId}`);
  }
}