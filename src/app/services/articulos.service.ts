import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Articulo {
  _id?: string;
  num_parte: string;
  descripcion_art: string;
  cantidad: number;
  imagen_art: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ArticulosService {
  private apiUrl = 'http://localhost:3000/api/articulos';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  buscarArticulos(query: string): Observable<{ total: number; articulo: Articulo[] }> {
    return this.http.post<{ total: number; articulo: Articulo[] }>(
      `${this.apiUrl}/serch/items`,
      {},
      { 
        headers: this.getHeaders(),
        params: { q: query }
      }
    );
  }

  obtenerArticulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.apiUrl}/index`);
  }

  obtenerUrlDescarga(articuloId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.apiUrl}/download/${articuloId}`);
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