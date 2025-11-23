import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { SearchService } from '../../services/serchbar.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-searchbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './searchbar.html',
  styleUrl: './searchbar.css',
})
export class SearchbarComponent implements OnInit, OnDestroy {
  @Input() placeholder: string = 'Buscar...';
  @Input() showFilters: boolean = false;
  
  searchQuery: string = '';
  isSearching: boolean = false;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private searchService: SearchService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Búsqueda con debounce (espera 300ms después de dejar de escribir)
    this.searchSubject.pipe(
      debounceTime(300), // Espera 300ms
      distinctUntilChanged(), // Solo si cambió el valor
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.searchService.setSearchQuery(query);
    });

    // Limpiar búsqueda al cambiar de página
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.onClear();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(): void {
    // Emite el valor cada vez que escribes (con debounce)
    this.searchSubject.next(this.searchQuery);
  }

  onSearch(): void {
    // Búsqueda manual al presionar Enter o botón
    if (!this.searchQuery.trim()) {
      this.searchService.clearSearch();
      return;
    }
    this.searchService.setSearchQuery(this.searchQuery);
  }

  onClear(): void {
    this.searchQuery = '';
    this.searchService.clearSearch();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}