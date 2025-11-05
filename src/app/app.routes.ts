import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { LoginComponent } from './pages/login/login';
import { GoogleSuccessComponent } from './pages/google-succes.component';
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
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: PlaceholderComponent, data: { title: 'Inicio' } },
            { path: 'cotizaciones', component: PlaceholderComponent, data: { title: 'Cotizaciones' } },
            { path: 'ordenes', component: PlaceholderComponent, data: { title: 'Ordenes' } },
            { path: 'facturas', component: PlaceholderComponent, data: { title: 'Facturas' } },
            { path: 'inventario', component: PlaceholderComponent, data: { title: 'Inventario' } },
        ],
    },
    { path: '**', redirectTo: '' },
];