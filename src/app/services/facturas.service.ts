import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
    archivo_fac?: File | null; 
    createdAt: string;
    updatedAt: string;
}

export interface CrearFacturaData {
    numero_fac: string;
    concepto: string;
    cantidad: number;
    archivo_fac: File | null;
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
    private apiUrl = `${environment.apiUrl}/facturas`;

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

    obtenerUrlDescargar(id: string): Observable<{ url: string }> {
        return this.http.get<{ url: string }>(`${this.apiUrl}/download/${id}`);
    }

    generarFactura(ordenId: string, datos: FormData): Observable<Factura> {
        return this.http.post<Factura>(`${this.apiUrl}/store/${ordenId}`, datos);
    }

    actualizarFactura(facturaId: string, datos: FormData): Observable<Factura> {
        return this.http.put<Factura>(`${this.apiUrl}/update/${facturaId}`, datos);
    }

    eliminarFactura(facturaId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/delete/${facturaId}`);
    }
}