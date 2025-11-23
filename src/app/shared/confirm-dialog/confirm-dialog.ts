import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmarService } from '../../services/confirmar.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent implements OnInit {
  isVisible = false;
  config: any = {};
  private callback?: (result: boolean) => void;

  constructor(private confirmarService: ConfirmarService) {}

  ngOnInit() {
    this.confirmarService.confirm$.subscribe((data) => {
      this.config = data;
      this.callback = data.callback;
      this.isVisible = true;
    });
  }

  onConfirm() {
    this.isVisible = false;
    this.callback?.(true);
  }

  onCancel() {
    this.isVisible = false;
    this.callback?.(false);
  }
}