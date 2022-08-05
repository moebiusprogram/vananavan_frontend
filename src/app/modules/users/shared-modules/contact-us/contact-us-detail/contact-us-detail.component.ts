import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SharedService } from 'src/app/core/http/shared-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-contact-us-detail',
  templateUrl: './contact-us-detail.component.html',
  styleUrls: ['./contact-us-detail.component.css']
})
export class ContactUsDetailComponent implements OnInit {
  public isSubmit = false;
  public contactUsForm: FormGroup;
  constructor(
    private sharedService: SharedService,
    private fb: FormBuilder,
    private ts: ToastrService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.contactUsForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      comment: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(250)]]
    });
  }

  submitContact() {
    this.isSubmit = true;
    if (this.contactUsForm.invalid) {
      return false;
    }
    this.sharedService.saveContactDetail(this.contactUsForm.value).subscribe(data => {
      this.isSubmit = false;
      this.ts.success("We have send your detail please check your email");
      this.contactUsForm.reset();
    })
  }

}
