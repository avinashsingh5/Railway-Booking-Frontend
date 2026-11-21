import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./customer/search/search.component').then(m => m.SearchComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'signup',
    loadComponent: () => import('./auth/signup/signup.component').then(m => m.SignupComponent)
  },
  {
    path: 'register',
    redirectTo: 'signup',
    pathMatch: 'full'
  },
  {
    path: 'book/:trainId',
    loadComponent: () => import('./customer/book/book.component').then(m => m.BookComponent),
    canActivate: [authGuard]
  },
  {
    path: 'my-bookings',
    loadComponent: () => import('./customer/bookings/bookings.component').then(m => m.BookingsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'pnr',
    loadComponent: () => import('./customer/pnr/pnr.component').then(m => m.PnrComponent)
  },
  {
    path: 'admin/trains',
    loadComponent: () => import('./admin/trains/trains.component').then(m => m.TrainsComponent),
    canActivate: [adminGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
