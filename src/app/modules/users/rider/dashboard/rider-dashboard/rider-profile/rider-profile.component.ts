import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { User } from 'src/app/shared/models/user';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedService } from 'src/app/core/http/shared-service';

@Component({
  selector: 'app-rider-profile',
  templateUrl: './rider-profile.component.html',
  styleUrls: ['./rider-profile.component.css']
})
export class RiderProfileComponent implements OnInit {

  public user: User;
  public isSubmit = false;
  public profileForm: FormGroup
  constructor(
    private authService: AuthenticationService,
    private riderService: RiderService,
    private fb: FormBuilder,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.sharedService.getUserProfile().subscribe(data => {
      this.user = data;
      this.patchFormValue();
    });
    this.initForm();
  }

  private initForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: [''],
      mobile: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]]
    });
  }

  private patchFormValue() {
    this.profileForm.patchValue({
      email: this.user.email,
      firstName: this.user.firstName,
      lastName: this.user.lastName,
      mobile: this.user.mobile
    });
  }

    changePhoneFormat(e) {
    let value = this.profileForm.get('mobile').value;
    value = value.trim();
    this.profileForm.patchValue({
      mobile: value
    })
    if (e.inputType != 'deleteContentBackward') {
      if (value.length == 3) {
        this.profileForm.patchValue({
          mobile: '(' + value + ') '
        })
      }
      if (value.length == 9) {
        this.profileForm.patchValue({
          mobile: value + '-'
        })
      }
    }
    }
  
  submitForm() {
    this.isSubmit = true;
    if (this.profileForm.invalid) {
      return false;
    }
    this.riderService.postRiderProfile(this.profileForm.value).subscribe();
  }

}
