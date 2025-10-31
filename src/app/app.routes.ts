import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { LoginComponent } from './pages/login/login';
import { GoogleSuccessComponent } from './pages/google-succes.component';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'google-success', component: GoogleSuccessComponent },
    { path: 'home', component: HomeComponent, canActivate: [authGuard] },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];