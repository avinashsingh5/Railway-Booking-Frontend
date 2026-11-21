import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import {
  CancelRequest,
  CancelResponse,
  CreateReservationRequest,
  CreateTrainRequest,
  PaymentCallbackRequest,
  PaymentInitiateRequest,
  PaymentInitiateResponse,
  ReservationResponse,
  SearchTrainResponse,
  TrainDetailsResponse,
  User
} from './models';

export function getErrorMessage(err: any): string {
  if (err?.error?.message) return err.error.message;
  if (typeof err?.error === 'string') return err.error;
  if (err?.message) return err.message;
  return 'An unexpected error occurred. Please try again.';
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<User>(`${this.base}/api/users/me`);
  }

  searchTrains(source: string, destination: string, date: string, travelClass?: string) {
    let params = new HttpParams()
      .set('source', source.toUpperCase())
      .set('destination', destination.toUpperCase())
      .set('date', date);
    if (travelClass) params = params.set('travelClass', travelClass);
    return this.http.get<SearchTrainResponse[]>(`${this.base}/api/trains`, { params });
  }

  getTrainById(id: number) {
    return this.http.get<TrainDetailsResponse>(`${this.base}/api/trains/${id}`);
  }

  createReservation(req: CreateReservationRequest) {
    return this.http.post<ReservationResponse>(`${this.base}/api/reservations`, req);
  }

  getMyBookings() {
    return this.http.get<ReservationResponse[]>(`${this.base}/api/reservations/my`);
  }

  getTicketByPnr(pnr: string) {
    return this.http.get<ReservationResponse>(`${this.base}/api/reservations/pnr/${pnr}`);
  }

  initiatePayment(req: PaymentInitiateRequest) {
    return this.http.post<PaymentInitiateResponse>(`${this.base}/api/payments`, req);
  }

  paymentCallback(req: PaymentCallbackRequest) {
    return this.http.post<any>(`${this.base}/api/payments/callback`, req);
  }

  cancelTicket(req: CancelRequest) {
    return this.http.post<CancelResponse>(`${this.base}/api/cancellations`, req);
  }

  getAdminTrains() {
    return this.http.get<TrainDetailsResponse[]>(`${this.base}/api/admin/trains`);
  }

  createTrain(req: CreateTrainRequest) {
    return this.http.post<TrainDetailsResponse>(`${this.base}/api/admin/trains`, req);
  }

  deleteTrain(id: number) {
    return this.http.delete<void>(`${this.base}/api/admin/trains/${id}`);
  }
}

