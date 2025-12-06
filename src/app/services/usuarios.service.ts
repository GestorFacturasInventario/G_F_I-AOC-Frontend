import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
    _id?: string;
    nombre?: string;
    correo?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class UsuariosService {
    private apiUrl = `${environment.apiUrl}/usuarios`;

    constructor(private http: HttpClient) {}

    obtenerUsuarios(): Observable<Usuario[]> {
        return this.http.get<Usuario[]>(`${this.apiUrl}/index`);
    }

    crearUsuario(nombre: { nombre: string, correo: string }): Observable<Usuario> {
        return this.http.post<Usuario>(`${this.apiUrl}/store`, nombre);
    }

    actualizarUsuario(id: string, usuario: { nombre: string, correo: string }): Observable<any> {
        return this.http.put<Usuario>(`${this.apiUrl}/update/${id}`, usuario);
    }

    eliminarUsuario(id: string): Observable<any> {
        return this.http.delete<void>(`${this.apiUrl}/delete/user/${id}`);
    }
}