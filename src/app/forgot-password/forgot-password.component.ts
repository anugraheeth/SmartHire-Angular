import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule,FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

   email: string = '';

  constructor(private http: HttpClient, private toastr: ToastrService ,private router : Router) {}

  resetPassword() {
    if (!this.email) {
      this.toastr.error('Please enter your email address.');
      return;
    }

    this.http.post('https://localhost:7113/api/Authentication/password-reset', JSON.stringify(this.email), {
      headers: { 'Content-Type': 'application/json' }
    }).subscribe({
      next: () => {
        this.toastr.success('Password reset instructions sent to your email.');
        this.router.navigate(['/'])
      },
      error: (err) => {
        this.toastr.error('Failed to send reset email. Please try again.');
        console.error(err);
      }
    });
  }
}
