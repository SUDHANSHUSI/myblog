import { Component } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  error: any = null;
  isLoading: boolean = false;

  constructor(private authService: AuthService) {}

  onSubmit(form: any) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe(
      (response:any) => {
        console.log(response);
        // Handle success response
        this.isLoading = false;
      },
     ( error:any) => {
        console.log(error);
        // Handle error response
        this.error = error;
        this.isLoading = false;
      }
    );
  }
}
