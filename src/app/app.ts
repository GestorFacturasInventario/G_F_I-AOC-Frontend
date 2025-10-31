import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('Frontend');

  constructor(private auth: AuthService) {}
  ngOnInit() {
    this.auth.bootstrap().subscribe({ error: () => { /* Puede fallar si no hay sesion */} });
  }
}
