import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar';
import { SearchbarComponent } from '../../shared/searchbar/searchbar';

@Component({
  selector: 'app-home-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, SearchbarComponent],
  templateUrl: './home-layout.html',
  styleUrl: './home-layout.css',
})
export class HomeLayoutComponent {
  
}
