import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    // No se adjunta Authorization a endpoints de Auth para evitar loops
    const skipAuth = req.url.includes('/oauth/google') || req.url.includes('/oauth/refresh');

    const token = auth.getToken();
    const authReq = (!skipAuth && token)
        ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    
    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            const is401 = error.status === 401;
            const isRefreshCall = req.url.includes('/oauth/refresh');

            if (is401 && !isRefreshCall) {
                // Intenta una vez el refresh y reintenta la solicitud original
                return auth.refreshAccessToken().pipe(
                    switchMap(() => {
                        const newToken = auth.getToken();
                        const retryReq = newToken
                            ? req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } }) : req;
                        return next(retryReq);
                    }),
                    catchError(error => throwError(() => error))
                );
            }

            return throwError(() => error);
        })
    );
};