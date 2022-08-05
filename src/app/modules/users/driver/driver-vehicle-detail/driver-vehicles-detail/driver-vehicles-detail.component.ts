import { Component, OnInit } from '@angular/core';
import { DriverService } from 'src/app/core/http/driver-service';
import { VehicleDetail } from 'src/app/shared/models/vehicle-detail.model';
import { environment } from 'src/environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { settingConfig } from 'src/app/configs/settings.config';

@Component({
  selector: 'app-driver-vehicles-detail',
  templateUrl: './driver-vehicles-detail.component.html',
  styleUrls: ['./driver-vehicles-detail.component.css']
})
export class DriverVehiclesDetailComponent implements OnInit {

  public isSubmit = false;
  public vehiclePhoto: any[] = [];
  public cinPhoto: any[] = [];
  public vehicleDetail: VehicleDetail = null;
  public vehicleDetailForm: FormGroup;
  public displaySelctedFile = false;
  // public titleForm: FormGroup;
  public hideModal = false;
  public showToaster = false;
  public imageChangedEvent: any = '';
  public croppedImage: any = '';
  public showRedBorder1 = false;
  public showRedBorder2 = false;
  public dayYearMonth;
  public allowUploadCinPhoto = true;
  public allowUploadVclPhoto = true;
  constructor(
    private driverService: DriverService,
    private fb: FormBuilder,
    private TS: ToastrService
  ) { }

  ngOnInit() {
    this.dayYearMonth = settingConfig.getYearAndMonth(0, 50);
    this.initForm();
    this.driverService.getVehicleDetail({ section: 2 }).subscribe(data => {
      this.driverService.driverVehicleDetail.next(data);
      this.vehicleDetail = data;
      this.appendUrl();
      this.setValue();
    });
  }

  private initForm() {
    this.vehicleDetailForm = this.fb.group({
      model: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      registrationNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      vin: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      cin: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      cinExpireMonth: ['', [Validators.required]],
      cinExpireYear: ['', [Validators.required]]
    });
    // this.titleForm = this.fb.group({
    //   title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
    // })
  }

  private setValue() {
    this.vehicleDetailForm.patchValue({
      model: this.vehicleDetail.model,
      registrationNumber: this.vehicleDetail.registrationNumber,
      vin: this.vehicleDetail.vin,
      cin: this.vehicleDetail.cin,
      cinExpireMonth: this.vehicleDetail.cinExpireMonth,
      cinExpireYear: this.vehicleDetail.cinExpireYear
    })
  }
  private appendUrl() {
    if (!this.vehicleDetail.vehicleDetailPhoto) {
      return false;
    }
    this.vehiclePhoto = [];
    this.vehicleDetail.vehicleDetailPhoto.forEach(elem => {
      if (elem) {
        let element = {};
        element['document'] = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
        // element['title'] = elem.title;
        element['_id'] = elem._id;
        this.vehiclePhoto.push(element);
      }
    });
    this.cinPhoto = [];
    this.vehicleDetail.cinPhoto.forEach(elem => {
      if (elem) {
        let element = {};
        element['document'] = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
        element['_id'] = elem._id;
        this.cinPhoto.push(element);
      }
    });
    if (this.cinPhoto.length > 0) {
      this.allowUploadCinPhoto = false;
    } else {
      this.allowUploadCinPhoto = true;
    }
    if (this.vehiclePhoto.length > 2) {
      this.allowUploadVclPhoto = false;
    } else {
      this.allowUploadVclPhoto = true;
    }
  }

  removeImage(item, type) {
    if (type == 'VEHICLE_PHOTO') {
      this.vehiclePhoto = this.vehiclePhoto.filter(elem => elem._id !== item._id);
      this.vehicleDetail.vehicleDetailPhoto = this.vehicleDetail.vehicleDetailPhoto
        .filter(elem => elem._id !== item._id);
    }
    if (type == 'INSPECTION_PHOTO') {
      this.cinPhoto = this.cinPhoto.filter(elem => elem._id !== item._id);
      this.vehicleDetail.cinPhoto = this.vehicleDetail.cinPhoto
        .filter(elem => elem._id !== item._id);
    }
    if (this.vehicleDetail.vehicleDetailPhoto.length == 0) {
      this.showRedBorder1 = true;
    } else {
      this.showRedBorder1 = false;
    }
    if (this.vehicleDetail.cinPhoto.length == 0) {
      this.showRedBorder2 = true;
      this.allowUploadCinPhoto = true;
    } else {
      this.showRedBorder2 = false;
      this.allowUploadCinPhoto = false;
    }
    if (this.vehiclePhoto.length > 2) {
      this.allowUploadVclPhoto = false;
    } else {
      this.allowUploadVclPhoto = true;
    }
    this.driverService.updateVehicleDetail({
      ...this.vehicleDetailForm.value,
      vehicleDetailPhoto: this.vehicleDetail.vehicleDetailPhoto,
      cinPhoto: this.vehicleDetail.cinPhoto,
      section: 'VEHICLE_DETAIL'
    }).subscribe(data => {
      this.driverService.driverVehicleDetail.next(data);
      this.isSubmit = false;
      console.log(data, 'AFTER UPDATE');
    });
  }

  updateVehicleDetail() {
    this.isSubmit = true;
    if (this.vehicleDetailForm.invalid) {
      if (this.vehicleDetail.vehicleDetailPhoto.length == 0) {
        this.showRedBorder1 = true;
      } else {
        this.showRedBorder1 = false;
      }
      if (this.vehicleDetail.cinPhoto.length == 0) {
        this.showRedBorder2 = true;
        this.allowUploadCinPhoto = true;
      } else {
        this.showRedBorder2 = false;
        this.allowUploadCinPhoto = false;
      }
      if (this.vehicleDetail.vehicleDetailPhoto.length > 2) {
        this.allowUploadVclPhoto = false;
      } else {
        this.allowUploadVclPhoto = true;
      }
      return false;
    }
    this.driverService.updateVehicleDetail({
      ...this.vehicleDetailForm.value,
      vehicleDetailPhoto: this.vehicleDetail.vehicleDetailPhoto,
      cinPhoto: this.vehicleDetail.cinPhoto,
      section: 'VEHICLE_DETAIL'
    }).subscribe(data => {
      this.driverService.driverVehicleDetail.next(data);
      this.isSubmit = false;
      console.log(data, 'AFTER UPDATE');
    });
  }

  selectFile(event) {
    this.imageChangedEvent = event;
    this.displaySelctedFile = true;
  }
  cancelBrowseFile() {
    this.hideModal = true;
    this.displaySelctedFile = false;
    // this.titleForm.setValue({
    //   title: ''
    // })
  }

  submitFile(type) {
    this.isSubmit = true;
    // this.titleForm.setValue({
    //   title: (this.titleForm.get('title').value).trim()
    // })
    // if (this.titleForm.invalid) {
    //   return false;
    // }
    if (!this.croppedImage) {
      return false;
    }
    this.hideModal = true;
    let toSend = {
      document: this.croppedImage,
      section: "VEHICLE_DETAIL",
      actionType: type == 'VEHICLE_PHOTO' ? 2 : 4
    }
    this.driverService.updateVehicleDetail(toSend).subscribe(data => {
      this.driverService.driverVehicleDetail.next(data);
      this.hideModal = false;
      this.vehicleDetail = data;
      this.cancelBrowseFile();
      this.appendUrl();
      // this.setValue();
    })
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
    if (!this.vehicleDetail.model || this.vehicleDetail.model == '' ||
      !this.vehicleDetail.registrationNumber || this.vehicleDetail.registrationNumber == '' ||
      !this.vehicleDetail.vin || this.vehicleDetail.vin == '' || !this.vehicleDetail.cin || this.vehicleDetail.cin == '' ||
      this.vehicleDetail.vehicleDetailPhoto.length == 0
    ) {
      this.showToaster = true;
    } else {
      this.showToaster = false;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.showRedBorder1 = false;
  }

}
