import { Component, OnInit, Input } from "@angular/core";
import { AuthenticationService } from "src/app/core/authentication/authentication.service";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-forget-password",
  templateUrl: "./forget-password.component.html",
  styleUrls: ["./forget-password.component.css"]
})
export class ForgetPasswordComponent implements OnInit {
  public SEND_OTP = 1;
  public VERIFY_OTP = 2;
  public SET_PASSWORD = 3;

  public displayForms: {
    sendOtp: boolean;
    otpVerification: boolean;
    setPassword: boolean;
  } = {
      sendOtp: true,
      otpVerification: false,
      setPassword: false
    };
  public isSubmit = false;
  public generatedOtp: number;
  public enteredOtp = [];
  public showPassword = false;
  public showConfirmPassword = false;
  public toNavigate: string;
  public userType = 1;

  public sendOtpForm: FormGroup;
  public verifyOtpForm: FormGroup;
  public setPasswordForm: FormGroup;

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder,
    private route: Router,
    private activeRoute: ActivatedRoute,
    private TS: ToastrService
  ) { }

  ngOnInit() {
    this.getCurrentUrl();
    this.initForms();
  }

  private getCurrentUrl() {
    this.activeRoute.queryParams.subscribe(data => {
      if (data.type === 'rider') {
        this.userType = 1;
      }
      if (data.type === 'driver') {
        this.userType = 2;
      }
      this.toNavigate = data.type;
      if (data.toNavigate) {
        this.toNavigate = data.toNavigate;
      }
    });
  }

  showAndHideForm(displayFormName: string) {
    for (let key in this.displayForms) {
      if (key === displayFormName) {
        this.displayForms[displayFormName] = true;
      }
      if (key !== displayFormName) {
        this.displayForms[key] = false;
      }
    }
  }

  onOtp(event, position: number) {
    this.enteredOtp[position] = event.target.value;
    this.verifyOtpForm.setValue({
      otp: this.enteredOtp.join("")
    });
  }

  private initForms() {
    this.sendOtpForm = this.fb.group({
      email: ["", [Validators.required, Validators.email]]
    });
    this.verifyOtpForm = this.fb.group({
      otp: ["", [Validators.required]]
    });
    this.setPasswordForm = this.fb.group({
      password: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
      ],
      confirmPassword: [
        "",
        [Validators.required, Validators.minLength(6), Validators.maxLength(20)]
      ]
    });
  }

  sendOtp(displayFormName: string) {
    this.isSubmit = true;

    if (this.sendOtpForm.invalid) {
      return false;
    }
    this.authenticationService
      .forgetPassword({ stageNo: this.SEND_OTP, ...this.sendOtpForm.value })
      .subscribe(data => {
        if (data) {
          this.showAndHideForm(displayFormName);
          this.isSubmit = false;
          this.TS.success(data);
          // alert(data);
        }
      });
  }

  verifyOtp(displayFormName: string) {
    this.isSubmit = true;
    if (this.verifyOtpForm.get("otp").value.length < 6) {
      return false;
    }
    this.authenticationService.forgetPassword({ stageNo: this.VERIFY_OTP, ...this.verifyOtpForm.value, ...this.sendOtpForm.value })
      .subscribe(data => {
        if (data && data.isOtpVerified) {
          this.showAndHideForm(displayFormName);
          this.isSubmit = false;
        }
      });
  }

  resendOtp() {
    this.authenticationService
      .forgetPassword({ stageNo: this.SEND_OTP, ...this.sendOtpForm.value })
      .subscribe(data => {
        if (data) {
          this.TS.success(data);
          // alert(data);
        }
      });
  }


  setPassword() {
    this.isSubmit = true;
    this.setPasswordValidation();
    if (this.setPasswordForm.invalid) {
      return false;
    }
    this.authenticationService.forgetPassword({ stageNo: this.SET_PASSWORD, ...this.setPasswordForm.value, ...this.sendOtpForm.value }).subscribe(data => {
      if (data && data.isOtpVerified) {
        this.TS.success("Password changed successfully.");
        // this.route.navigate(['/auth/login'], { queryParams: { type: this.toNavigate } });
        this.navigateOnLogin();
      }
    });
  }

  private setPasswordValidation() {
    if (this.setPasswordForm.get('password').value != this.setPasswordForm.get('confirmPassword').value) {
      this.setPasswordForm.get('confirmPassword').setErrors({ notMatched: true });
    }
    if (this.setPasswordForm.get('password').value === this.setPasswordForm.get('confirmPassword').value && ((this.setPasswordForm.get('confirmPassword').value).length >= 6)) {
      this.setPasswordForm.get('confirmPassword').updateValueAndValidity();
    }
  }

  showAndHidePassword(type: string, showHide: boolean) {
    if (type === 'password') {
      if (showHide) {
        this.showPassword = false;
      }
      if (!showHide) {
        this.showPassword = true;
      }
    }
    if (type === 'confirmPassword') {
      if (showHide) {
        this.showConfirmPassword = false;
      }
      if (!showHide) {
        this.showConfirmPassword = true;
      }
    }
  }

  navigateOnLogin() {
    if (this.toNavigate === 'searched-ride' || this.toNavigate === 'book-event') {
      this.route.navigate(['/auth/login'], { queryParams: { toNavigate: this.toNavigate } });
      return;
    }
    if (this.toNavigate !== 'searched-ride' && this.toNavigate !== 'book-event') {
      this.route.navigate(['/auth/login'], { queryParams: { type: this.toNavigate } });
      return;
    }
  }

}
