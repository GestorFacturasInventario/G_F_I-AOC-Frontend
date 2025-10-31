import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-google-success',
    standalone: true,
    template: `<p>Autenticando con Google...</p>`
})
export class GoogleSuccessComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            const refresh = params['refresh'];

            if (token) {
                const userId = this.decodeToken(token)?.id;
                this.authService.handleGoogleCallback(token, refresh, userId);
            } else {
                this.router.navigate(['/login']);
            }
        });
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            return JSON.parse(atob(payload));
        } catch (error) {
            return null;
        }
    }
}