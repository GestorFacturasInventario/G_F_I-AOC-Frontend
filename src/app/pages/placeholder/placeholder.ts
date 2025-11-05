import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './placeholder.html',
  styleUrl: './placeholder.css',
})
export class PlaceholderComponent {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data?.['title'] ?? 'Pendiente';
}
