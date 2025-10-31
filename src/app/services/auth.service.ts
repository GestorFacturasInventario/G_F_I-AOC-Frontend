import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, map, throwError } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'http://localhost:3000/api/oauth';
    private accessToken: string | null = null;

    constructor(private http: HttpClient, private router: Router) {}

    bootstrap(): Observable<void> {
        return this.http.post<{ token: string }>(`${this.apiUrl}/refresh`, {}, {withCredentials: true}).pipe(
            tap(res => { this.accessToken = res.token; }),
            map(() => void 0)
        );
    }

    loginWithGoogle(): void {
        window.location.href = `${this.apiUrl}/google`;
    }

    handleGoogleCallback(token: string, refresh: string, userId: any): void {
        this.accessToken = token || null;
        this.router.navigate(['/login']);
    }

    getToken() : string | null {
        return this.accessToken;
    }

    refreshAccessToken(): Observable<void> {
        return this.http.post<{ token: string }> (`${this.apiUrl}/refresh`, {}, {withCredentials: true}).pipe(
            tap(res => { this.accessToken = res.token; }),
            map(() => void 0)
        );
    }

    logout(): void {
        this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({
            complete: () => {
                this.accessToken = null;
                this.router.navigate(['/login']);
            }
        });
    }

    isAuthenticated(): boolean {
        return !!this.accessToken;
    }

}