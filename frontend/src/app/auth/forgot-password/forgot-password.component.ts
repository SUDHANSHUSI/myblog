import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email!: string;

  constructor(private authService: AuthService,
    private router:Router) {}

  onSubmit() {
    this.authService.forgotPassword(this.email).subscribe(
      response => {
        alert('Email for password reset sent!');
          const token = response.token;
        this.router.navigate(['/reset-password', token]);
      },
      error => {
        alert('Error sending email for password reset.');
      }
    );
  }
}
