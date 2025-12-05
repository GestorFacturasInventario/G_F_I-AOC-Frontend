import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { HomeLayoutComponent } from './layouts/home-layout/home-layout';
import { PlaceholderComponent } from './pages/placeholder/placeholder';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent),
    },
    {
        path: '',
        component: HomeLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
            {
                path: 'Inicio',
                loadComponent: () => import('./pages/inicio/inicio').then(m => m.InicioComponent)
            },
            {
                path: 'Usuarios',
                loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.UsuariosComponent)
            },
            { 
                path: 'Cotizaciones',
                loadComponent: () => import('./pages/cotizaciones/cotizaciones').then(m => m.CotizacionesComponent) 
            },
            { 
                path: 'Ordenes',
                loadComponent: () => import('./pages/ordenes/ordenes').then(m => m.OrdenesComponent)
            },
            {
                path: 'Facturas',
                loadComponent: () => import('./pages/facturas/facturas').then(m => m.FacturasComponent)
            },
            {
                path: 'Inventario',
                loadComponent: () => import('./pages/inventario/inventario').then(m => m.InventarioComponent)
            },
        ],
    },
    { path: '**', redirectTo: '' },
];