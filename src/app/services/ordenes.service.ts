import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cotizacion {
    _id: string;
    numero_cot: string;
    cliente: string;
}

export interface Orden {
    _id?: string;
    cotizacion_id: Cotizacion;
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

export interface FiltrosOrden {
    q?: string;
    estado?: string;
    anio?: number;
    mes?: number;
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

    obtenerConFiltros(filtros: FiltrosOrden): Observable<any> {
        let params = new HttpParams();

        if (filtros.q) params = params.set('q', filtros.q);
        if (filtros.estado) params = params.set('estado', filtros.estado);
        if (filtros.anio) params = params.set('anio', filtros.anio.toString());
        if (filtros.mes) params = params.set('mes', filtros.mes.toString());

        return this.http.get<any>(`${this.apiUrl}/filtros`, { params });
    }

    obtenerAniosDisponibles(): Observable<{ años: number[] }>{
        return this.http.get<{años: number[] }>(`${this.apiUrl}/anios`);
    }

    obtenerOrdenes(): Observable<Orden[]> {
        return this.http.get<Orden[]>(`${this.apiUrl}/index`);
    }

    actualizarOrden(ordenId: string, datos: any): Observable<Orden> {
        return this.http.put<Orden>(`${this.apiUrl}/update/${ordenId}`, datos);
    }

    eliminarOrden(ordenId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${ordenId}`);
    }
}