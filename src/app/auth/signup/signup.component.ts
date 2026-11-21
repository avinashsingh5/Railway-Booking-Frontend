import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { getErrorMessage } from '../../core/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  loading = signal(false);
  errorMessage = signal('');

  onSignup() {
    this.errorMessage.set('');
    this.loading.set(true);

    this.auth.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        // Auto-login upon registration
        this.auth.login({ email: this.email, password: this.password }).subscribe({
          next: () => {
            this.loading.set(false);
            this.router.navigate(['/']);
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
}

