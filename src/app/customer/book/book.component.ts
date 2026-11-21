import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, getErrorMessage } from '../../core/api.service';
import { PassengerRequest, ReservationResponse } from '../../core/models';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './book.component.html',
  styleUrl: './book.component.css'
})
export class BookComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);

  trainId = 0;
  journeyDate = '';
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1' = 'SL';
  boardingStation = '';
  destinationStation = '';

  step = signal<'PASSENGERS' | 'PAYMENT' | 'SUCCESS'>('PASSENGERS');
  loading = signal(false);
  errorMessage = signal('');

  passengers: PassengerRequest[] = [
    { name: '', age: 25, gender: 'MALE' }
  ];

  reservation = signal<ReservationResponse | null>(null);
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' = 'UPI';

  ngOnInit() {
    this.trainId = Number(this.route.snapshot.paramMap.get('trainId'));
    const q = this.route.snapshot.queryParams;
    this.journeyDate = q['date'] || '';
    this.travelClass = q['class'] || 'SL';
    this.boardingStation = q['src'] || '';
    this.destinationStation = q['dest'] || '';
  }

  addPassenger() {
    if (this.passengers.length < 6) {
      this.passengers.push({ name: '', age: 30, gender: 'MALE' });
    }
  }

  removePassenger(index: number) {
    if (this.passengers.length > 1) {
      this.passengers.splice(index, 1);
    }
  }

  proceedToPayment() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.api.createReservation({
      trainId: this.trainId,
      journeyDate: this.journeyDate,
      travelClass: this.travelClass,
      boardingStation: this.boardingStation,
      destinationStation: this.destinationStation,
      passengers: this.passengers
    }).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.reservation.set(res);
        this.step.set('PAYMENT');
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }

  simulatePayment() {
    const res = this.reservation();
    if (!res) return;

    this.loading.set(true);
    this.errorMessage.set('');

    // Step 1: Initiate payment
    this.api.initiatePayment({
      reservationId: res.id,
      paymentMethod: this.paymentMethod
    }).subscribe({
      next: (initRes) => {
        // Step 2: Simulate Payment Gateway Callback (Bank Webhook)
        this.api.paymentCallback({
          transactionId: initRes.transactionId,
          status: 'SUCCESS'
        }).subscribe({
          next: () => {
            // Step 3: Fetch updated reservation with confirmed PNR & seat numbers
            this.api.getMyBookings().subscribe({
              next: (bookings) => {
                this.loading.set(false);
                const updated = bookings.find(b => b.id === res.id) || res;
                this.reservation.set(updated);
                this.step.set('SUCCESS');
              },
              error: () => {
                this.loading.set(false);
                this.step.set('SUCCESS');
              }
            });
          },
          error: (err) => {
            this.loading.set(false);
            this.errorMessage.set(getErrorMessage(err));
          }
        });
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }

  printTicket() {
    window.print();
  }
}

