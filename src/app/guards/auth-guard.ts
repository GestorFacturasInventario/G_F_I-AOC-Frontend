import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of } from 'rxjs';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Intento de bootstrap/refresh para recuperar la sesion desde cookie httpOnly
  return auth.refreshAccessToken().pipe(
    map(() => true),
    catchError(() => of(router.createUrlTree(['/login'], {queryParams: { returnUrl: state.url } } as any)))
  ) as any;
};
