// reset-password.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit{
  token!: string;
  newPassword!: string;
  resetSuccess: boolean = false;
  resetError:boolean=false;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}
  
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      if (!this.token) {
        // Token not available, redirect to another page or show an error message
        this.router.navigate(['/forgot-password']);
      }
    });
  }
  onSubmit() {
    this.authService.resetPassword(this.newPassword, this.token).subscribe(
      (response) => {
        alert('Password changed successfully!');
        this.router.navigate(['/login'])
      },
      (error) => {
        alert('Error changing password.');
      }
    );
  }
    goBackToLogin() {
    // Redirect to the login page
    this.router.navigate(['/login']);
  }
}
