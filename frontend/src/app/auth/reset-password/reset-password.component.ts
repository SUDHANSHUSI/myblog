// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { AuthService } from '../auth.service';

// @Component({
//   selector: 'app-reset-password',
//   templateUrl: './reset-password.component.html',
//   styleUrls: ['./reset-password.component.css']
// })
// export class ResetPasswordComponent implements OnInit {
//   token: string = '';
//   password: string = '';
//   errorMessage: string = '';
//   successMessage: string = '';
//   isLoading: boolean = false;

//   constructor(
//     private route: ActivatedRoute,
//     private authService: AuthService,
//     private router: Router
//   ) { }

//   ngOnInit() {
//     this.token = this.route.snapshot.params['token'];
//   }

//   onResetPassword() {
//     this.isLoading = true;
//     this.errorMessage = '';

//     this.authService.resetPassword(this.token, this.password)
//       .subscribe(
//         () => {
//           this.successMessage = 'Password reset successful';
//           this.isLoading = false;
//           // Redirect to login page or any other desired page
//           this.router.navigate(['/login']);
//         },
//         error => {
//           this.errorMessage = error.message;
//           this.isLoading = false;
//         }
//       );
//   }
// }
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  password: string = '';
  error: any = null;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  onSubmit(form: any) {
    if (!form.valid) {
      return;
    }

    this.isLoading = true;
    const token = this.route.snapshot.params['token'];

    this.authService.resetPassword(token, this.password).subscribe(
      (response: any) => {
        console.log(response);
        // Handle success response
        this.isLoading = false;
        this.router.navigate(['/login']); // Redirect to the login page after successful password reset
      },
      (error: any) => {
        console.log(error);
        // Handle error response
        this.error = error;
        this.isLoading = false;
      }
    );
  }
}
