import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Articulo {
  _id?: string;
  num_parte: string;
  descripcion_art: string;
  cantidad: number;
  imagen: string;
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

  obtenerArticulos(): Observable<Articulo[]> {
    return this.http.get<Articulo[]>(`${this.apiUrl}/index`, { 
      headers: this.getHeaders() 
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

  crearArticulo(articulo: Partial<Articulo>): Observable<Articulo> {
    return this.http.post<Articulo>(`${this.apiUrl}/store`, articulo, { 
      headers: this.getHeaders() 
    });
  }

  actualizarArticulo(id: string, articulo: Partial<Articulo>): Observable<Articulo> {
    return this.http.put<Articulo>(`${this.apiUrl}/update/${id}`, articulo, { 
      headers: this.getHeaders() 
    });
  }

  eliminarArticulo(id: string): Observable<{ mensaje: string }> {
    return this.http.delete<{ mensaje: string }>(`${this.apiUrl}/delete/${id}`, { 
      headers: this.getHeaders() 
    });
  }
}