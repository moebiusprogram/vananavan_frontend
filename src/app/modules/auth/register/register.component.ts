import { Component, OnInit } from '@angular/core';
import { AuthService, SocialUser } from 'angularx-social-login';
import { FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';

import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  private user: SocialUser;
  private loggedIn: boolean;

  public userType = 1;
  public isSubmit = false;
  public emailRegistrationForm: FormGroup;
  public verifyOtpForm: FormGroup;
  public showPassword = false;
  public toNavigate = '';
  public eventData = null;
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
  ) {
  }

  ngOnInit() {
    this.authenticationService.logout();
    this.getCurrentUrl();
    this.initForm();
  }

  private getCurrentUrl() {
    this.activeRoute.queryParams.subscribe(activeUser => {
      if (activeUser.type === "driver") {
        this.showVerifyOtp = false;
        this.accountData = null;
        this.clearRegistrationData();
        this.userType = 2;
      }
      if (activeUser.type === "rider") {
        this.showVerifyOtp = false;
        this.accountData = null;
        this.clearRegistrationData();
        this.userType = 1;
      }
      if (activeUser.type === "verify-otp") {
        this.accountData = JSON.parse(sessionStorage.getItem('USER_REGISTRATION'))
        this.showVerifyOtp = true;
      }
      if (activeUser.toNavigate === 'searched-ride' || activeUser.toNavigate === 'book-event') {
        this.toNavigate = activeUser.toNavigate;
        this.userType = 1;
      }
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then((data: any) => {
      this.authenticationService.loginBySocial({ ...data, loginType: 1, type: this.userType }).subscribe(data => {
        this.navigateByUser(data);
      });
    });;
  }

  signInWithFB(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then((data: any) => {
      this.authenticationService.loginBySocial({ ...data, loginType: 1, type: this.userType, idToken: data.authToken }).subscribe(data => {
        this.navigateByUser(data);
      });
    }, (error) => {
        console.log(error, '-------')
    });
  }

  signOut(): void {
    this.authService.signOut();
  }

  private initForm() {
    this.emailRegistrationForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      mobile: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
      termsAndCondtion: ['', [Validators.required]],
      driver: ['']
    });
    this.verifyOtpForm = this.fb.group({
      otp: ["", [Validators.required]]
    });
  }

  submitRegistrationForm() {
    this.isSubmit = true;
    let isPasswordMatch = this.checkPasswordMatch();
    if (this.emailRegistrationForm.invalid || !isPasswordMatch) {
      return false;
    }
    this.setRegistrationInSession({ ...this.emailRegistrationForm.value, type: this.userType, loginType: 2 })
    this.authenticationService.registrationByEmail({ ...this.emailRegistrationForm.value, type: this.userType, loginType: 2, stage: 1 }).subscribe(data => {
      this.TS.success(data);
      this.route.navigate(['/auth/register'], { queryParams: { type: 'verify-otp' } })
    });
  }

  private setRegistrationInSession(toSet) {
    sessionStorage.setItem("USER_REGISTRATION", JSON.stringify(toSet));
  }

  private clearRegistrationData() {
    sessionStorage.removeItem("USER_REGISTRATION");
  }

  checkPasswordMatch() {
    let password = this.emailRegistrationForm.get('password').value;
    let confirmPassword = this.emailRegistrationForm.get('confirmPassword').value;
    if (password == confirmPassword) {
      this.emailRegistrationForm.get('confirmPassword').clearValidators();
      return true
    } else {
      this.emailRegistrationForm.get('confirmPassword').setErrors({ invalid: true });
      return false;
    }
  }

  goToGivenRoute(path) {
    if (this.toNavigate === 'searched-ride' || this.toNavigate === 'book-event') {
      this.route.navigate([path], { queryParams: { toNavigate: this.toNavigate } });
      return;
    }
    if (this.userType === 1) {
      this.route.navigate([path], { queryParams: { type: "rider" } })
    }
    if (this.userType === 2) {
      this.route.navigate([path], { queryParams: { type: "driver" } })
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

  navigateByUser(data) {
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
      this.sharedChatService.connectUser();
      if (data.type === 1) {
        this.route.navigate(['/rider/search-ride'], { queryParams: { type: 'logged-in' } });
        return
      }
      if (data.type === 2) {
        this.route.navigate(['/driver/personal-info'], {queryParams: {type: "personalInfo1Form"}});
        return
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

  changePhoneFormat(e) {
    let value = this.emailRegistrationForm.get('mobile').value;
    value = value.replace(/[^0-9 ( ) -]/g, '')
    value = value.trim();
    this.emailRegistrationForm.patchValue({
      mobile: value
    })
    if (e.inputType != 'deleteContentBackward') {
      if (value.length == 3) {
        this.emailRegistrationForm.patchValue({
          mobile: '(' + value + ') '
        })
      }
      if (value.length == 9) {
        this.emailRegistrationForm.patchValue({
          mobile: value + '-'
        })
      }
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
      this.clearRegistrationData();
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
