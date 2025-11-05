import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
})
export class HomeLayoutComponent {
  
}
