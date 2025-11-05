import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent implements OnInit, OnDestroy {
  mensaje: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');

    this.route.queryParams.subscribe(params => {
      if (params['msg'] === 'noacceso') {
        this.mensaje = 'No tienes acceso al sistema';
      } else if (params ['error'] === 'unauthorized') {
        this.mensaje = 'Tu correo no esta autorizado';
      } else if (params['erro'] === 'server') {
        this.mensaje = 'Error del servidor. Intentar mas tarde!';
      }
    });
    
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    }
  };

  ngOnDestroy(): void {
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  }

  loginConGoogle(): void {
    this.authService.loginWithGoogle();
  }
}