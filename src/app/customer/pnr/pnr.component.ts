import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, getErrorMessage } from '../../core/api.service';
import { ReservationResponse } from '../../core/models';

@Component({
  selector: 'app-pnr',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pnr.component.html',
  styleUrl: './pnr.component.css'
})
export class PnrComponent {
  private api = inject(ApiService);

  pnrNumber = '';
  loading = signal(false);
  errorMessage = signal('');
  ticket = signal<ReservationResponse | null>(null);

  checkPnr() {
    if (!this.pnrNumber || this.pnrNumber.trim().length !== 10) {
      this.errorMessage.set('Please enter a valid 10-digit numeric PNR number.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.ticket.set(null);

    this.api.getTicketByPnr(this.pnrNumber.trim()).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.ticket.set(res);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }
}

