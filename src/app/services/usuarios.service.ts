import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    private apiUrl = 'http://localhost:3000/api/usuarios';

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