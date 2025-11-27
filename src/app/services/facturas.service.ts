import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Factura {
    _id: string;
    orden_id: {
        _id: string;
        referencia_ord: string;
        descripcion_ord: string;
        empleado: string;
        total: number;
        descuento: number;
        estado_ord: string;
        cotizacion_id: {
            _id: string;
            numero_cot: string;
            cliente: string;
        }
    }
    numero_fac: string;
    concepto: string;
    cantidad: number;
    createdAt: string;
    updatedAt: string;
}

export interface CrearFacturaData {
    numero_fac: string;
    concepto: string;
    cantidad: number;
}

export interface FiltrosFactura {
    q?: string;
    anio?: string;
    mes?: string;
}

@Injectable({
    providedIn: 'root'
})
export class FacturasService {
    private apiUrl = 'http://localhost:3000/api/facturas';

    constructor(private http: HttpClient) {}

    obtenerFacturas(): Observable<Factura[]> {
        return this.http.get<Factura[]>(`${this.apiUrl}/index`);
    }

    obtenerConFiltros(filtros: FiltrosFactura): Observable<{total: number, facturas: Factura[]}> {
        let params = new HttpParams();
        if (filtros.q) params = params.set('q', filtros.q);
        if (filtros.anio) params = params.set('anio', filtros.anio);
        if (filtros.mes) params = params.set('mes', filtros.mes);

        return this.http.get<{total: number, facturas: Factura[]}>(`${this.apiUrl}/filtros`, { params });
    }

    obtenerAniosDisponibles(): Observable<{ años: number[]}> {
        return this.http.get<{años: number[]}>(`${this.apiUrl}/anios`);
    }

    generarFactura(ordenId: string, datos: any): Observable<Factura> {
        return this.http.post<Factura>(`${this.apiUrl}/store/${ordenId}`, datos);
    }

    actualizarFactura(facturaId: string, datos: any): Observable<Factura> {
        return this.http.put<Factura>(`${this.apiUrl}/update/${facturaId}`, datos);
    }
}