// import { routerTransition } from 'src/app/router.animations';
import { AuthenticationService } from './../../../core/authentication/authentication.service';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { appToaster } from 'src/app/configs';
import { Router, ActivatedRoute } from '@angular/router';
import { SocialUser, AuthService, GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {

  private user: SocialUser;
  private loggedIn: boolean;
  public eventData = null;
  public userType = 1;
  public isSubmit = false;
  public loginForm: FormGroup;
  public verifyOtpForm: FormGroup;
  public showPassword = true;
  public toNavigate = '';
  public showVerifyOtp = false;
  public accountData = null;
  public enteredOtp = [];

  constructor(
    private authService: AuthService,
    private authenticationService: AuthenticationService,
    private sharedChatService: SharedChatService,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private fb: FormBuilder,
    private riderService: RiderService,
    private TS: ToastrService
  ) { }

  ngOnInit() {
    this.authenticationService.logout();
    this.getCurrentUrl();
    this.initForm();
  }

  private getCurrentUrl() {
    this.activeRoute.queryParams.subscribe(activeUser => {
      if (activeUser.type === 'rider') {
        this.userType = 1;
      }
      if (activeUser.type === 'driver') {
        this.userType = 2;
      }
      if (activeUser.toNavigate === 'searched-ride' || activeUser.toNavigate === 'book-event') {
        this.toNavigate = activeUser.toNavigate;
        this.userType = 1;
      }
    })
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data: any) => {
      this.authenticationService.loginBySocial({ ...data, loginType: 1, type: this.userType }).subscribe(data => {
        this.navigateByUser(data);
      });
    });
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data: any) => {
      this.authenticationService.loginBySocial({ ...data, facebookId: data.id, loginType: 1, type: this.userType, idToken: data.authToken }).subscribe(data => {
        this.navigateByUser(data);
      });
    });
  }

  navigateByUser(data) {
    this.getCurrentUrl();
    this.sharedChatService.connectUser();
    if (this.toNavigate === 'searched-ride') {
      this.route.navigate(['/rider/available-ride']);
      return
    }
    if (this.toNavigate === 'book-event') {
      this.bookEvent();
      // this.route.navigate(['/rider/search-ride'], { queryParams: { type: 'logged-in' } });
      // return
    }
    if (data) {
      if (data.type === 1) {
        this.route.navigate(['/rider/search-ride'], { queryParams: { type: 'logged-in' } });
      }
      if (data.type === 2) {
        if (!data.isCompleteRegistered) {
          this.route.navigate(['/driver/personal-info'], {queryParams: {type: 'personalInfo1Form'}})
        } else {
        this.route.navigate(['/driver/dashboard']);
        }
      }
    }
  }

  private bookEvent() {
    this.riderService.getAvailableRideAndEvents('eventData').subscribe(data => {
      if (data) {
        this.eventData = data;
        this.riderService.removeAllDriversAndEvents('eventData');
        this.riderService.removeAllDriversAndEvents('allDrivers');
      }
    })

    const toSend = {
      ...this.eventData,
      requestType: 2,
      source: this.eventData.fromAddress,
      destination: this.eventData.toAddress
    }
    this.riderService.bookOtherEvent(toSend).subscribe(data => {
      if (data) {
        this.route.navigate(['/rider/my-request']);
      }
    })
  }

  signOut(): void {
    this.authService.signOut();
  }

  private initForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      // rememberMe: [''],
    });
    this.verifyOtpForm = this.fb.group({
      otp: ["", [Validators.required]]
    });
  }

  submitLoginForm() {
    this.isSubmit = true;
    if (this.loginForm.invalid) {
      return false;
    }
    this.authenticationService.riderLogin({ ...this.loginForm.value, loginType: 2, type: this.userType }).subscribe(data => {
      if (data && data.response.redirect == "verifyOtp") {
        this.TS.success(data.response.message);
        this.showVerifyOtp = true;
        this.accountData = this.loginForm.value;
      } else {
        this.navigateByUser(data.response);
      }
    });
  }

  goToForgetPassword() {
    if (this.toNavigate === 'searched-ride' || this.toNavigate === 'book-event') {
      this.route.navigate(['/auth/forget-password'], { queryParams: { toNavigate: this.toNavigate } });
      return;
    }
    if (this.userType === 1) {
      this.route.navigate(['/auth/forget-password'], { queryParams: { type: 'rider' } });
      return;
    }
    if (this.userType === 2) {
      this.route.navigate(['/auth/forget-password'], { queryParams: { type: 'driver' } });
      return;
    }
  }

  goToGivenRoute(path) {
    if (this.toNavigate === 'searched-ride' || this.toNavigate === 'book-event') {
      this.route.navigate([path], { queryParams: { toNavigate: this.toNavigate } });
      return;
    }
    if (this.userType === 1) {
      this.route.navigate([path], { queryParams: { type: 'rider' } });
      return;
    }
    if (this.userType === 2) {
      this.route.navigate(['/driver/personal-info'], {queryParams: {type: "personalInfo1Form"}});
        return
      // this.route.navigate([path], { queryParams: { type: 'driver' } });
    }
  }

  showAndHidePassword(showPassword) {
    if (showPassword) {
      this.showPassword = false;
    }
    if (!showPassword) {
      this.showPassword = true;
    }
  }

  onOtp(event, position: number) {
    this.enteredOtp[position] = event.target.value;
    this.verifyOtpForm.setValue({
      otp: this.enteredOtp.join("")
    });
  }


  verifyOtp() {
    this.isSubmit = true;
    if (this.verifyOtpForm.get("otp").value.length < 6) {
      return false;
    }
    this.authenticationService.registrationByEmail({ ...this.accountData, stage: 2, otp: this.verifyOtpForm.get("otp").value }).subscribe(data => {
      this.navigateByUser(data);
    });
  }

  resendOtp() {
    this.authenticationService.registrationByEmail({ ...this.accountData, stage: 1 }).subscribe(data => {
      this.TS.success(data);
      // alert(data);
    });
  }


}
