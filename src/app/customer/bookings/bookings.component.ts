import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, getErrorMessage } from '../../core/api.service';
import { PassengerResponse, ReservationResponse } from '../../core/models';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {
  private api = inject(ApiService);

  bookings = signal<ReservationResponse[]>([]);
  loading = signal(false);
  errorMessage = signal('');

  selectedForCancel = signal<ReservationResponse | null>(null);
  selectedPassengerIds = signal<number[]>([]);
  cancelLoading = signal(false);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.api.getMyBookings().subscribe({
      next: (res) => {
        this.loading.set(false);
        this.bookings.set(res);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'CONFIRMED': return 'status-confirmed';
      case 'PENDING_PAYMENT': return 'status-pending';
      case 'PARTIALLY_CANCELLED': return 'status-partial';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-expired';
    }
  }

  openCancelModal(ticket: ReservationResponse) {
    this.selectedForCancel.set(ticket);
    this.selectedPassengerIds.set([]);
  }

  closeCancelModal() {
    this.selectedForCancel.set(null);
    this.selectedPassengerIds.set([]);
  }

  activePassengers(): PassengerResponse[] {
    const t = this.selectedForCancel();
    if (!t) return [];
    return t.passengers.filter(p => p.status === 'CONFIRMED');
  }

  isPassengerSelected(id: number): boolean {
    return this.selectedPassengerIds().includes(id);
  }

  togglePassengerSelection(id: number) {
    const current = [...this.selectedPassengerIds()];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    this.selectedPassengerIds.set(current);
  }

  confirmCancellation() {
    const ticket = this.selectedForCancel();
    if (!ticket || !ticket.pnr) return;

    this.cancelLoading.set(true);
    const passengerIds = this.selectedPassengerIds();

    this.api.cancelTicket({
      pnr: ticket.pnr,
      passengerIds: passengerIds.length > 0 ? passengerIds : undefined
    }).subscribe({
      next: (res) => {
        this.cancelLoading.set(false);
        alert(`Cancellation successful! Refund issued: ₹${res.refundAmount.toFixed(2)}`);
        this.closeCancelModal();
        this.loadBookings();
      },
      error: (err) => {
        this.cancelLoading.set(false);
        alert(getErrorMessage(err));
      }
    });
  }
}

