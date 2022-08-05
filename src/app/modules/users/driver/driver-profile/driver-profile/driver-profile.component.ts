import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors, ValidatorFn, FormControl } from '@angular/forms';
import { NgbDateAdapter, NgbDateStruct, NgbDateNativeAdapter } from '@ng-bootstrap/ng-bootstrap';
import { DriverService } from 'src/app/core/http/driver-service';
import { Driver } from 'src/app/shared/models/driver';
import { environment } from 'src/environments/environment';
import { from } from 'rxjs';
import * as moment from 'moment';
import { settingConfig } from 'src/app/configs/settings.config';
import { ToastrService } from 'ngx-toastr';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-driver-profile',
  templateUrl: './driver-profile.component.html',
  styleUrls: ['./driver-profile.component.css'],
  providers: [{ provide: NgbDateAdapter, useClass: NgbDateNativeAdapter }]
})
export class DriverProfileComponent implements OnInit {
  public driver: Driver = null;
  public availableLanguages: any = []; // all language with checkbox
  public checkedLanguage: any = [];
  public Driverdetails: any = [];
  public Driverdocuments: any = [];
  public DriverLiscence: any = [];
  public driverProfileform: FormGroup;
  public myCheckboxGroup: FormGroup;
  public isSubmit: boolean;
  public isfileSubmit: boolean;
  public minDate: Date;
  public maxDate = moment(new Date()).subtract(16, 'years').toDate();
  public val: any;
  public selectedLanguage: any = [];
  public imageUrl: string;
  public document: any;
  public displaySelctedFile = false;
  public driverSelectedLiscence = false;
  public titleForm: FormGroup;
  public hideModal = false;
  public selectedFileUrl: string;
  public fileType: boolean;
  public dayYearMonth;
  public yearExperience = [];
  public showToaster = false;
  public profileDetail;
  public imageChangedEvent: any = '';
  public imageChangedEvent2: any = '';
  public croppedImage: any = '';
  public croppedDrLiscence: any = '';
  public showRedIcon = false;
  public showDrLiscenceRedIcon = false;
  public allowUploadCl = true;
  public allowUploadDl = true;
  constructor(
    private fb: FormBuilder,
    private TS: ToastrService,
    private driverservice: DriverService
  ) { }

  ngOnInit() {
    this.dayYearMonth = settingConfig.getYearAndMonth(1920, 16, 'dob');
    this.setYearExp();
    this.driverservice.getDriverDetail().subscribe(data => {
      this.driver = data;
      this.profileDetail = data;
      this.driverservice.driverProfile.next(data);
      // this.showToasterMessage();
      this.availableLanguages = data.availableLanguage;  // all language with checkbox
      if (data.driverDetail) {
        this.driver.profileDocumentPhoto = data.driverDetail.profileDocumentPhoto;
        this.driver.driverLiscense = data.driverDetail.driverLiscense;
        if (data.driverDetail.languages) {
          this.checkedLanguage = data.driverDetail.languages; //   only checked language from api 
          this.availableLanguages = this.availableLanguages.map(element => {
            this.checkedLanguage.map(id => {
              if (element._id == id) {
                element['isSelected'] = true;
              }
            });
            return element;
          });
          this.selectedLanguage = this.driver.driverDetail.languages;  // to send checked by api
        }
        this.driverAllDocument();
      }
      this.bindForm();
    });
    this.initForm();
  }


  private setYearExp() {
    this.yearExperience.push('Less than 1 year');
    for (let i = 1; i <= 30; i++) {
      this.yearExperience.push('' + i);
    }
    this.yearExperience.push('More than 30 years');
  }

  private initForm() {
    this.driverProfileform = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.minLength(14), Validators.maxLength(14)]],
      chauffeurLicenseNumber: ['', [Validators.required, Validators.minLength(3)]],
      licenseNumber: ['', [Validators.required, Validators.minLength(3)]],
      drivingFromYear: ['', [Validators.required]],
      day: ['', [Validators.required]],
      month: ['', [Validators.required]],
      year: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      languages: ['', [Validators.required]],
      about: ['']
    });
  }
  SubmitDriverdetail() {
    this.isSubmit = true;
    this.patchFormValue();
    if (this.driverProfileform.invalid || this.Driverdocuments.length == 0) {
      this.showRedIcon = true;
      return false;
    } else {
      this.showRedIcon = false;
    }
    if (this.DriverLiscence.length == 0) {
      this.showDrLiscenceRedIcon = true;
      return false;
    } else {
      this.showDrLiscenceRedIcon = false;
    }
    this.driverservice.postDriverdetail({
      ...this.driverProfileform.value,
      profileDocumentPhoto: this.driver.profileDocumentPhoto,
      driverLiscense: this.driver.driverLiscense,
      section: 'DRIVER_DETAIL'
    }).subscribe(data => {
      this.driverservice.driverProfile.next(data);
      this.profileDetail = data
      console.log(data, '***SUBMITED DATa')
    });
  }

  resetFormValue(driverForm) {
    driverForm.form.reset();
  }

  selectedLang(event, lang) {
    if (event.target.checked) {
      if (this.selectedLanguage.includes(event.target.name) === false) {
        this.selectedLanguage.push(lang._id);
      }
    }
    if (!event.target.checked) {
      this.selectedLanguage = this.selectedLanguage.filter(elem => elem !== lang._id);
    }
  }

  patchFormValue() {
    this.driverProfileform.patchValue({
      languages: this.selectedLanguage
    });
  }
  private bindForm() {
    this.driverProfileform.patchValue({
      firstName: this.driver.driver.firstName,
      lastName: this.driver.driver.lastName,
      email: this.driver.driver.email,
      mobile: this.driver.driver.mobile,
      day: this.driver.driver.day,
      month: this.driver.driver.month,
      year: this.driver.driver.year
    });
    this.driverDetailValue();
  }
  driverDetailValue() {
    if (this.driver.driverDetail) {
      this.driverProfileform.patchValue({
        chauffeurLicenseNumber: this.driver.driverDetail.chauffeurLicenseNumber,
        licenseNumber: this.driver.driverDetail.licenseNumber,
        drivingFromYear: this.driver.driverDetail.drivingFromYear,
        drivingFromMonth: this.driver.driverDetail.drivingFromMonth,
        rate: this.driver.driverDetail.rate,
        about: this.driver.driverDetail.about,
      });
    }
  }
  selectFile(event) {
    const [file] = event.target.files;
    const fileType: string = file.type;
    if ((fileType === 'application/pdf' || fileType === 'image/pdf' || fileType === 'image/svg+xml') ? this.fileType = true : this.fileType = false) {
      return false;
    }
    if ((fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') ? this.displaySelctedFile = true : this.displaySelctedFile = false) {
      this.imageChangedEvent = event;
    }
  }
  selectLiscence(event) {
    const [file] = event.target.files;
    const fileType: string = file.type;
    if ((fileType === 'application/pdf' || fileType === 'image/pdf' || fileType === 'image/svg+xml') ? this.fileType = true : this.fileType = false) {
      return false;
    }
    if ((fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') ? this.driverSelectedLiscence = true : this.driverSelectedLiscence = false) {
      this.imageChangedEvent2 = event;
    }
  }
  submitFile() {
    this.isfileSubmit = true;
    if (this.croppedImage == '') {
      return false;
    }
    this.hideModal = true;
    let toSend = {
      document: this.croppedImage,
      section: "DRIVER_DETAIL",
      actionType: 1
    }
    this.driverservice.postDriverDocument(toSend).subscribe(data => {
      this.driverservice.driverProfile.next(data);
      this.profileDetail = data;
      this.driver.profileDocumentPhoto = data.driverDetail.profileDocumentPhoto;
      this.driver.driverLiscense = data.driverDetail.driverLiscense;
      this.cancelDocument();
      this.driverAllDocument();
    });
  }

  submitDrLiscence() {
    this.isfileSubmit = true;
    if (this.croppedDrLiscence == '') {
      return false;
    }
    this.hideModal = true;
    let toSend = {
      document: this.croppedDrLiscence,
      section: "DRIVER_DETAIL",
      actionType: 3
    }
    this.driverservice.postDriverDocument(toSend).subscribe(data => {
      this.driverservice.driverProfile.next(data);
      this.profileDetail = data;
      this.driver.profileDocumentPhoto = data.driverDetail.profileDocumentPhoto;
      this.driver.driverLiscense = data.driverDetail.driverLiscense;
      this.cancelDocument();
      this.driverAllDocument();
    });
  }
  cancelDocument() {
    this.hideModal = true;
    this.displaySelctedFile = false;
    this.driverSelectedLiscence = false;
    this.selectedFileUrl = '';
    this.document = null;
  }
  private driverAllDocument() {
    this.Driverdocuments = [];
    this.DriverLiscence = [];
    if (this.driver && this.driver.profileDocumentPhoto && this.driver.profileDocumentPhoto.length > 0) {
      this.driver.profileDocumentPhoto.forEach(elem => {
        if (elem) {
          const element = {};
          element['document'] = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
          element['title'] = elem.title;
          element['_id'] = elem._id;
          this.Driverdocuments.push(element);
        }
      });
    }
    if (this.driver && this.driver.driverLiscense && this.driver.driverLiscense.length > 0) {
      this.driver.driverLiscense.forEach(elem => {
        if (elem) {
          let url = `${environment.host}${environment.imageBaseUrl}${elem}`;
          this.DriverLiscence.push(url);
        }
      })
    }
    this.changeUploadDocumentStatus()
  }

  private changeUploadDocumentStatus() {
    if (this.DriverLiscence.length > 0) {
      this.allowUploadDl = false;
    } else {
      this.allowUploadDl = true;
    }
    if (this.Driverdocuments.length > 0) {
      this.allowUploadCl = false;
    } else {
      this.allowUploadCl = true;
    }
  }
  removeImage(item, type) {
    if (type == 'PROFILE_DOCUMENT') {
      this.Driverdocuments = this.Driverdocuments.filter(elem => elem._id !== item._id);
      this.driver.profileDocumentPhoto = this.driver.profileDocumentPhoto
        .filter(elem => elem._id !== item._id);
    }
    if (type == 'DRIVER_LISCENCE') {
      this.DriverLiscence = this.DriverLiscence.filter(elem => {
        let url = item.split('/');
        let elemUrl = elem.split('/');
        return elemUrl[elemUrl.length - 1] != url[url.length - 1]
      });
      this.driver.driverLiscense = this.driver.driverLiscense.filter(elem => {
        let url = item.split('/');
        return elem != url[url.length - 1]
      });
    }
    if (this.Driverdocuments.length == 0) {
      this.showRedIcon = true;
    } else {
      this.showRedIcon = false;
    }
    if (this.DriverLiscence.length == 0) {
      this.showDrLiscenceRedIcon = true;
    } else {
      this.showDrLiscenceRedIcon = false;
    }

    this.driverProfileform.patchValue({
      languages: this.selectedLanguage
    });
    this.changeUploadDocumentStatus();
    this.driverservice.postDriverdetail({
      ...this.driverProfileform.value,
      profileDocumentPhoto: this.driver.profileDocumentPhoto,
      driverLiscense: this.driver.driverLiscense,
      section: 'DRIVER_DETAIL'
    }).subscribe(data => {
      this.driverservice.driverProfile.next(data);
      this.profileDetail = data
    });
  }

  private showToasterMessage() {
    this.checkNullField();
    if (this.showToaster) {
      this.TS.error('Required. Please complete all profile and vehicle details before accepting trips.',
        '', {
        timeOut: 11111111 // Hide manually
      });
    }
  }

  private checkNullField() {
    let documentDetail = this.profileDetail.driverDetail;
    if (documentDetail) {
      if (!documentDetail.profileDocumentPhoto || documentDetail.profileDocumentPhoto.length == 0 || !documentDetail.chauffeurLicenseNumber || !documentDetail.licenseNumber || !documentDetail.drivingFromYear ||
        !documentDetail.languages || documentDetail.languages.length == 0
      ) {
        this.showToaster = true;
      }
      let basicDetail = this.profileDetail.driver;
      if (!basicDetail || !basicDetail.firstName || !basicDetail.lastName
        || !basicDetail.day || !basicDetail.month || !basicDetail.year || !basicDetail.email
        || !basicDetail.mobile) {
        this.showToaster = true;
      }
    }
    if (!documentDetail) {
      this.showToaster = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.showRedIcon = false;
  }

  liscenceCropped(event: ImageCroppedEvent) {
    this.croppedDrLiscence = event.base64;
    this.showDrLiscenceRedIcon = false;
  }

  changePhoneFormat(e) {
    let value = this.driverProfileform.get('mobile').value;
    value = value.trim();
    this.driverProfileform.patchValue({
      mobile: value
    })
    if (e.inputType != 'deleteContentBackward') {
      if (value.length == 3) {
        this.driverProfileform.patchValue({
          mobile: '(' + value + ') '
        })
      }
      if (value.length == 9) {
        this.driverProfileform.patchValue({
          mobile: value + '-'
        })
      }
    }
  }

}
