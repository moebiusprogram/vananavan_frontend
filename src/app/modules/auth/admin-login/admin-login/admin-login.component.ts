import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {

  public showPassword = true;
  public loginForm: FormGroup;
  public isSubmit = false;
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    })
  }
  
  goToManageUser() {
    this.router.navigate(['/admin/manage-user']);
  }

   showAndHidePassword(showPassword) {
    if (showPassword) {
      this.showPassword = false;
    }
    if (!showPassword) {
      this.showPassword = true;
    }
   }
  
  submitLoginForm() {
     this.isSubmit = true;
    if (this.loginForm.invalid) {
      return false;
    }
    this.authenticationService.adminLogin({ ...this.loginForm.value }).subscribe(data => {
      if (data) {
      this.router.navigate(['/admin/dashboard']);
      }
    });
  }
}
