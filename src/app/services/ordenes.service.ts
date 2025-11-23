import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Orden {
    _id?: string;
    cotizacion_id: string;
    referencia_ord: string;
    descripcion_ord: string;
    empleado: string;
    archivo_ord: string;
    total: number;
    estado_ord: 'pendiente' | 'liquidado';
    fecha_limite: Date;
    descuento?: number;
    createdAt?: string;
    updateAt?: string;
}

export interface CrearOrdenData {
    referencia_ord: string;
    descripcion_ord?: string;
    empleado: string;
    archivo_ord: string;
    fecha_limite: string;
    descuento?: number;
}

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private apiUrl = 'http://localhost:3000/api/ordenes';

    constructor(private http: HttpClient) {}

    generarOrden(cotizacionId: string, datos: CrearOrdenData): Observable<Orden> {
        return this.http.post<Orden>(`${this.apiUrl}/store/${cotizacionId}`, datos);
    }

    obtenerOrdenes(): Observable<Orden[]> {
        return this.http.get<Orden[]>(`${this.apiUrl}/index`);
    }
}