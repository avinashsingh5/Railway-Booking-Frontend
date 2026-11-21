import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, getErrorMessage } from '../../core/api.service';
import { CreateTrainRequest, CreateTrainStopRequest, CreateTrainClassRequest, TrainDetailsResponse } from '../../core/models';

export interface UIStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;
  departureTime: string;
  dayOffset: number;
  distanceKm: number | null;
}

export interface UIClass {
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  totalSeats: number | null;
  farePerKm: number | null;
}

export const ALL_DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
] as const;

export const AVAILABLE_CLASSES: Array<'SL' | 'AC3' | 'AC2' | 'AC1'> = ['SL', 'AC3', 'AC2', 'AC1'];

@Component({
  selector: 'app-admin-trains',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trains.component.html',
  styleUrl: './trains.component.css'
})
export class TrainsComponent implements OnInit {
  private api = inject(ApiService);

  trains = signal<TrainDetailsResponse[]>([]);
  loading = signal(false);
  submitting = signal(false);
  errorMessage = signal('');
  validationError = signal('');
  showAddModal = signal(false);

  readonly allDays = ALL_DAYS;
  readonly availableClasses = AVAILABLE_CLASSES;

  // Form State
  trainNumber = '';
  trainName = '';

  stops: UIStop[] = [];
  classes: UIClass[] = [];
  selectedDays = new Set<string>();

  ngOnInit() {
    this.loadTrains();
    this.resetForm();
  }

  loadTrains() {
    this.loading.set(true);
    this.errorMessage.set('');

    this.api.getAdminTrains().subscribe({
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

  toggleAddModal() {
    if (!this.showAddModal()) {
      this.resetForm();
    }
    this.showAddModal.set(!this.showAddModal());
  }

  resetForm() {
    this.trainNumber = '';
    this.trainName = '';
    this.validationError.set('');

    // Default 2 empty stops (Origin and Destination)
    this.stops = [
      {
        stationCode: '',
        stationName: '',
        arrivalTime: '',
        departureTime: '',
        dayOffset: 0,
        distanceKm: 0
      },
      {
        stationCode: '',
        stationName: '',
        arrivalTime: '',
        departureTime: '',
        dayOffset: 0,
        distanceKm: null
      }
    ];

    // Default 1 empty class
    this.classes = [
      {
        travelClass: 'SL',
        totalSeats: null,
        farePerKm: null
      }
    ];

    // Default all days selected
    this.selectedDays = new Set<string>(ALL_DAYS);
  }

  // --- Stop Management ---
  addStop() {
    // Insert new stop just before destination
    const insertIndex = this.stops.length > 1 ? this.stops.length - 1 : this.stops.length;
    const prevStop = this.stops[insertIndex - 1];

    this.stops.splice(insertIndex, 0, {
      stationCode: '',
      stationName: '',
      arrivalTime: '',
      departureTime: '',
      dayOffset: prevStop ? prevStop.dayOffset : 0,
      distanceKm: null
    });
  }

  removeStop(index: number) {
    if (this.stops.length <= 2) {
      this.validationError.set('A train route must have at least 2 stops (Origin and Destination).');
      return;
    }
    this.stops.splice(index, 1);
    this.validationError.set('');
  }

  // --- Class Management ---
  addClass() {
    // Pick first unused travelClass if available, else default to 'SL'
    const usedClasses = new Set(this.classes.map(c => c.travelClass));
    const nextAvailable = this.availableClasses.find(c => !usedClasses.has(c)) || 'SL';

    this.classes.push({
      travelClass: nextAvailable,
      totalSeats: null,
      farePerKm: null
    });
  }

  removeClass(index: number) {
    if (this.classes.length <= 1) {
      this.validationError.set('A train must configure at least 1 seating class.');
      return;
    }
    this.classes.splice(index, 1);
    this.validationError.set('');
  }

  // --- Running Days Management ---
  isDaySelected(day: string): boolean {
    return this.selectedDays.has(day);
  }

  toggleDay(day: string) {
    if (this.selectedDays.has(day)) {
      this.selectedDays.delete(day);
    } else {
      this.selectedDays.add(day);
    }
  }

  // --- Validation ---
  validate(): string | null {
    if (!this.trainNumber.trim()) return 'Train number is required.';
    if (!this.trainName.trim()) return 'Train name is required.';

    if (this.stops.length < 2) {
      return 'At least 2 stops (Origin and Destination) are required.';
    }

    let prevDistance = -1;
    for (let i = 0; i < this.stops.length; i++) {
      const s = this.stops[i];
      const isFirst = i === 0;
      const isLast = i === this.stops.length - 1;
      const label = isFirst ? 'Origin Stop' : isLast ? 'Destination Stop' : `Stop #${i + 1}`;

      if (!s.stationCode.trim()) return `${label}: Station Code is required.`;
      if (!s.stationName.trim()) return `${label}: Station Name is required.`;

      if (isFirst) {
        if (!s.departureTime) return `Origin Stop: Departure Time is required.`;
        if (s.distanceKm !== 0) return `Origin Stop distance must be 0 km.`;
      } else if (isLast) {
        if (!s.arrivalTime) return `Destination Stop: Arrival Time is required.`;
      } else {
        if (!s.arrivalTime) return `${label}: Arrival Time is required.`;
        if (!s.departureTime) return `${label}: Departure Time is required.`;
      }

      if (s.distanceKm === null || s.distanceKm === undefined || isNaN(s.distanceKm)) {
        return `${label}: Distance in km is required.`;
      }

      if (s.distanceKm <= prevDistance) {
        return `${label} (${s.stationCode}): Distance (${s.distanceKm} km) must be strictly greater than preceding stop distance (${prevDistance} km).`;
      }
      prevDistance = s.distanceKm;

      if (s.dayOffset === null || s.dayOffset === undefined || s.dayOffset < 0) {
        return `${label}: Day offset must be 0 or greater.`;
      }
    }

    if (this.classes.length === 0) {
      return 'At least 1 travel class must be configured.';
    }

    const seenClasses = new Set<string>();
    for (const c of this.classes) {
      if (seenClasses.has(c.travelClass)) {
        return `Duplicate class ${c.travelClass}. Each class can only be configured once.`;
      }
      seenClasses.add(c.travelClass);

      if (!c.totalSeats || c.totalSeats <= 0) {
        return `Class ${c.travelClass}: Total seats must be greater than 0.`;
      }
      if (c.farePerKm === null || c.farePerKm === undefined || c.farePerKm <= 0) {
        return `Class ${c.travelClass}: Fare per km must be greater than 0.`;
      }
    }

    if (this.selectedDays.size === 0) {
      return 'At least 1 running day must be selected.';
    }

    return null;
  }

  // --- Submit & Payload Transformation ---
  createTrain() {
    this.validationError.set('');
    this.errorMessage.set('');

    const error = this.validate();
    if (error) {
      this.validationError.set(error);
      return;
    }

    // Build payload according to backend specification
    const transformedStops: CreateTrainStopRequest[] = this.stops.map((s, index) => {
      const isFirst = index === 0;
      const isLast = index === this.stops.length - 1;

      return {
        stationCode: s.stationCode.trim().toUpperCase(),
        stationName: s.stationName.trim(),
        arrivalTime: isFirst ? null : (s.arrivalTime.trim() || null),
        departureTime: isLast ? null : (s.departureTime.trim() || null),
        dayOffset: Number(s.dayOffset),
        distanceKm: Number(s.distanceKm)
      };
    });

    const transformedClasses: CreateTrainClassRequest[] = this.classes.map(c => ({
      travelClass: c.travelClass,
      totalSeats: Number(c.totalSeats),
      farePerKm: Number(c.farePerKm)
    }));

    // Preserve order of days
    const orderedRunningDays = ALL_DAYS.filter(day => this.selectedDays.has(day));

    const payload: CreateTrainRequest = {
      trainNumber: this.trainNumber.trim(),
      name: this.trainName.trim(),
      stops: transformedStops,
      classes: transformedClasses,
      runningDays: orderedRunningDays
    };

    // Logging final transformed payload as requested
    console.log(JSON.stringify(payload, null, 2));

    this.submitting.set(true);

    this.api.createTrain(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showAddModal.set(false);
        this.loadTrains();
      },
      error: (err) => {
        this.submitting.set(false);
        this.errorMessage.set(getErrorMessage(err));
      }
    });
  }

  deleteTrain(id: number) {
    if (!confirm('Are you sure you want to delete this train?')) return;

    this.api.deleteTrain(id).subscribe({
      next: () => this.loadTrains(),
      error: (err) => this.errorMessage.set(getErrorMessage(err))
    });
  }
}
