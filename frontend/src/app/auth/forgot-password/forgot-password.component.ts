import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email!: string;
resetToken: string='';

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.authService.forgotPassword(this.email).subscribe(
      response => {
        alert('Email for password reset sent!');
      },
      error => {
        alert('Error sending email for password reset.');
      }
    );
  }
}
