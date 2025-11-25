import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Factura {
    _id: string;
    orden_id: string;
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

@Injectable({
    providedIn: 'root'
})
export class FacturasService {
    private apiUrl = 'http://localhost:3000/api/facturas';

    constructor(private http: HttpClient) {}

    obtenerFacturas(): Observable<Factura[]> {
        return this.http.get<Factura[]>(`${this.apiUrl}/index`);
    }

    generarFactura(ordenId: string, datos: any): Observable<Factura> {
        return this.http.post<Factura>(`${this.apiUrl}/store/${ordenId}`, datos);
    }

    actualizarFactura(facturaId: string, datos: any): Observable<Factura> {
        return this.http.put<Factura>(`${this.apiUrl}/update/${facturaId}`, datos);
    }
}