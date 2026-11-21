import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService, getErrorMessage } from '../../core/api.service';
import { SearchTrainResponse, TrainDetailsResponse } from '../../core/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  source = '';
  destination = '';
  date = '';
  travelClass = '';

  loading = signal(false);
  searched = signal(false);
  errorMessage = signal('');
  trains = signal<SearchTrainResponse[]>([]);
  selectedTrainRoute = signal<TrainDetailsResponse | null>(null);

  ngOnInit() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.date = tomorrow.toISOString().split('T')[0];
  }

  getFare(cls: any): number {
    return cls.fare ?? cls.farePerPassenger ?? 0;
  }

  search() {
    if (!this.source || !this.destination || !this.date) return;

    this.loading.set(true);
    this.searched.set(true);
    this.errorMessage.set('');

    this.api.searchTrains(this.source, this.destination, this.date, this.travelClass).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.trains.set(res);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }

  toggleRoute(trainId: number) {
    if (this.selectedTrainRoute()?.id === trainId) {
      this.selectedTrainRoute.set(null);
      return;
    }

    this.api.getTrainById(trainId).subscribe({
      next: (details) => this.selectedTrainRoute.set(details),
      error: (err) => this.errorMessage.set(getErrorMessage(err))
    });
  }

  bookTicket(train: SearchTrainResponse, travelClass: string) {
    this.router.navigate(['/book', train.trainId], {
      queryParams: {
        date: train.boardingDate,
        class: travelClass,
        src: train.boardingStation,
        dest: train.destinationStation
      }
    });
  }
}

