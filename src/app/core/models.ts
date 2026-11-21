export interface User {
  id: number;
  name: string;
  email?: string;
  role: 'PASSENGER' | 'ADMIN' | string;
}

export interface AuthResponse {
  token: string;
  tokenType?: string;
  userId?: number;
  name?: string;
  role?: string;
  user?: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface StopResponse {
  sequence: number;
  stationCode: string;
  stationName: string;
  arrivalTime: string | null;
  departureTime: string | null;
  dayOffset: number;
  distanceKm: number;
}

export interface TrainClassInfo {
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  fare?: number;
  farePerPassenger?: number;
  availableSeats: number;
  totalSeats?: number;
  status?: 'AVAILABLE' | 'WAITLIST' | 'REGRET';
}

export interface SearchTrainResponse {
  trainId: number;
  trainNumber: string;
  trainName: string;
  boardingStation: string;
  boardingStationName: string;
  destinationStation: string;
  destinationStationName: string;
  intermediateBooking: boolean;
  boardingDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  distanceKm: number;
  classes: TrainClassInfo[];
}

export interface TrainDetailsClass {
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  totalSeats: number;
  farePerKm: number;
}

export interface TrainDetailsResponse {
  id: number;
  trainNumber: string;
  name: string;
  source: string;
  destination: string;
  stops: StopResponse[];
  classes: TrainDetailsClass[];
  runningDays: string[];
}

export interface PassengerRequest {
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface PassengerResponse {
  id: number;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  seatNumber: number | null;
  status: 'CONFIRMED' | 'CANCELLED';
}

export interface CreateReservationRequest {
  trainId: number;
  journeyDate: string;
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  boardingStation: string;
  destinationStation: string;
  passengers: PassengerRequest[];
}

export interface ReservationResponse {
  id: number;
  pnr: string | null;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'PARTIALLY_CANCELLED' | 'CANCELLED' | 'EXPIRED';
  trainNumber: string;
  trainName: string;
  boardingStation: string;
  boardingStationName: string;
  destinationStation: string;
  destinationStationName: string;
  boardingDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  distanceKm: number;
  totalFare: number;
  remainingFare: number;
  passengers: PassengerResponse[];
  createdAt: string;
  paymentDueBy: string;
}

export interface PaymentInitiateRequest {
  reservationId: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING';
}

export interface PaymentInitiateResponse {
  paymentId: number;
  reservationId: number;
  transactionId: string;
  amount: number;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED';
  paymentMethod: string;
  refundAmount: number | null;
  message: string;
}

export interface PaymentCallbackRequest {
  transactionId: string;
  status: 'SUCCESS' | 'FAILURE';
}

export interface CancelRequest {
  pnr: string;
  passengerIds?: number[];
}

export interface CancelResponse {
  cancelId: number;
  pnr: string;
  status: 'REFUNDED' | 'NO_REFUND';
  refundAmount: number;
  cancelTime: string;
  type: 'PARTIAL' | 'FULL';
  cancelledPassengers: { id: number; name: string; seatNumber: number | null }[];
  remainingPassengers: number;
  remainingFare: number;
}

export interface CreateTrainStopRequest {
  stationCode: string;
  stationName: string;
  arrivalTime?: string | null;
  departureTime?: string | null;
  dayOffset: number;
  distanceKm: number;
}

export interface CreateTrainClassRequest {
  travelClass: 'SL' | 'AC3' | 'AC2' | 'AC1';
  totalSeats: number;
  farePerKm: number;
}

export interface CreateTrainRequest {
  trainNumber: string;
  name: string;
  stops: CreateTrainStopRequest[];
  classes: CreateTrainClassRequest[];
  runningDays: string[];
}

