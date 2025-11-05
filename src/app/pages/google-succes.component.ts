import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-google-success',
    standalone: true,
    template: `<p>Autenticando con Google...</p>`
})
export class GoogleSuccessComponent implements OnInit {
    private processed = false;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        if (this.processed) return;
        this.processed = true;

        this.authService.refreshAccessToken().subscribe({
            next: () => {
                this.router.navigate(['/home'], { replaceUrl: true });
            },
            error: () => {
                this.router.navigate(['/login'], { queryParams: { error: 'session' }, replaceUrl: true });
            }
        });
    }
}