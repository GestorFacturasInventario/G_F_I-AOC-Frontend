import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    facturas?: any[];
    descuento?: number;
    createdAt?: string;
    updateAt?: string;
}


export interface CrearOrdenData {
    referencia_ord: string;
    descripcion_ord?: string;
    empleado: string;
    archivo_ord: File | null;
    fecha_limite: string;
    descuento?: number;
}

export interface FiltrosOrden {
    q?: string;
    estado?: string;
    anio?: number;
    mes?: number;
}

// Interfaz para seccion de Inicio
export interface OrdenesProximasVencer {
    vencidas: {
        total: number;
        ordenes: Orden[];
    };
    proximas: {
        total: number;
        ordenes: Orden[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class OrdenesService {
    private apiUrl = `${environment.apiUrl}/ordenes`;

    constructor(private http: HttpClient) {}

    obtenerOrdenes(): Observable<Orden[]> {
        return this.http.get<Orden[]>(`${this.apiUrl}/index`);
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

    obtenerUrlDescarga(id: string): Observable<{ url: string }> {
        return this.http.get<{ url: string }>(`${this.apiUrl}/download/${id}`);
    }

    // Endpoints para seccion de inicio -------------------------------------------------------------------
    ordenesProximasVencer(): Observable<OrdenesProximasVencer> {
        return this.http.get<OrdenesProximasVencer>(`${this.apiUrl}/ordenesPorVencer`);
    }

    verOrdenPorId(ordenId: string): Observable<Orden> {
        return this.http.get<Orden>(`${this.apiUrl}/show/${ordenId}`);
    }

    verFacturasDeOrden(ordenId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/show/facturas_orden/${ordenId}`);
    }

    generarOrden(cotizacionId: string, datos: FormData): Observable<Orden> {
        return this.http.post<Orden>(`${this.apiUrl}/store/${cotizacionId}`, datos);
    }

    actualizarOrden(ordenId: string, datos: FormData): Observable<Orden> {
        return this.http.put<Orden>(`${this.apiUrl}/update/${ordenId}`, datos);
    }

    eliminarOrden(ordenId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${ordenId}`);
    }
}