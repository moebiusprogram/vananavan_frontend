import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { settingConfig } from 'src/app/configs';
import { DriverService } from 'src/app/core/http/driver-service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from 'src/environments/environment';
import { UsersService } from 'src/app/core/services';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-driver-personal-info',
  templateUrl: './driver-personal-info.component.html',
  styleUrls: ['./driver-personal-info.component.css']
})
export class DriverPersonalInfoComponent implements OnInit {

  public settingConfig = settingConfig;
  public profileForm: FormGroup;
  public displayForm = {
    personalInfo1Form: false,
    personalInfo2Form: false,
    vehicleDetailForm: false,
    routeForm: false
  }
  public isSubmit = false;
  public dayYearMonth;
  public ExpirationYearMonth;
  public availableLanguage = [];
  public yearExperience = [];
  public selectedLanguages = [];
  public clImageChangedEvent: any = '';
  public dlImageChangedEvent: any = '';
  public cinImageChangedEvent: any = '';
  public vinImageChangedEvent: any = '';
  public croppedDlImage: any = '';
  public croppedClImage: any = '';
  public croppedCinImage: any = '';
  public croppedVinImage: any = '';
  public stage;
  public driver = null;
  public driverDetail = null;
  public driverVehicle = null;
  public showCLRedIcon = false;
  public showDLRedIcon = false;
  public showCinRedIcon = false;
  public showVinRedIcon = false;
  public displaySelctedDl = false;
  public displaySelctedCl = false;
  public displaySelctedCin = false;
  public displaySelctedVin = false;
  public hideModal = false;
  public fileType: boolean;
  public dlDocumnts = null;
  public clDocuments = null;
  public vinDocuments = null;
  public cinDocuments = null;
  public isForm1Complete = false;
  public isForm2Complete = false;
  public isVehcileFormComplete = false;

  public currentLatLng = {
    lat: 27.994402,
    lng: -81.760254,
  };
  public routeForm: FormGroup;
  public directionsService;
  public directionsRenderer;
  public map;
  public centerPoints: any = {
    lat: 27.994402,
    lng: -81.760254
  };

  public polygonPoints = [];
  public editPolygonPoints = [];
  public isEdit = false;
  public isPolygon = false;
  public routeId = '';
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private driverService: DriverService,
    private router: Router,
    private authenticationService: AuthenticationService,
    private zone: NgZone,
    private userServise: UsersService,
    private TS: ToastrService
  ) { }

  ngOnInit() {
    this.getCurrentLocation();
    this.initMap();

    this.authenticationService.getUserInfo().subscribe(data => {
      if (!data) {
        this.router.navigate(['']);
      }
      if (data && data.isCompleteRegistered) {
        this.router.navigate(['/driver/dashboard']);
      }
    })

    this.dayYearMonth = settingConfig.getYearAndMonth(1920, 16, 'dob');
    this.ExpirationYearMonth = settingConfig.getYearAndMonth(0, 50);
    this.initForm();
    this.activatedRoute.queryParams.subscribe(path => {
      this.getUpdatedProfile()
      this.displayActiveForm(path.type);
    });
    this.setYearExp();
  }

  getAvailableLanguage() {
    this.driverService.getAvailableLanguages().subscribe(data => {
      this.availableLanguage = data;
    })
  }

  initForm() {
    this.profileForm = this.fb.group({
      personalInfo1Form: this.fb.group({
        day: ['', [Validators.required]],
        month: ['', [Validators.required]],
        year: ['', [Validators.required]],
        languages: [''],
        rate: ['', [Validators.required]],
        about: [''],
        drivingFromYear: ['', [Validators.required]]
      }),
      personalInfo2Form: this.fb.group({
        chauffeurLicenseNumber: ['', [Validators.required, Validators.minLength(3)]],
        licenseNumber: ['', [Validators.required, Validators.minLength(3)]],
      }),
      vehicleDetailForm: this.fb.group({
        model: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        registrationNumber: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        vin: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        cin: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
        cinExpireMonth: ['', [Validators.required]],
        cinExpireYear: ['', [Validators.required]]
      })
    });

    this.routeForm = this.fb.group({
      schoolName: ['', Validators.required],
      title: ['', Validators.required]
    });
  }

  get personalInfo1Form() { return this.profileForm.get('personalInfo1Form') };
  get personalInfo2Form() { return this.profileForm.get('personalInfo2Form') };
  get vehicleDetailForm() { return this.profileForm.get('vehicleDetailForm') };


  private setYearExp() {
    this.yearExperience.push('Less than 1 year');
    for (let i = 1; i <= 30; i++) {
      this.yearExperience.push('' + i);
    }
    this.yearExperience.push('More than 30 years');
  }

  getUpdatedProfile() {
    this.driverService.getDriverDetail().subscribe(data => {
      this.availableLanguage = data.availableLanguage;
      this.driver = data.driver;
      this.driverDetail = data.driverDetail;
      this.driverVehicle = data.driverVehicle;
      if (this.driverDetail && this.driverDetail.languages) {
        this.selectedLanguages = this.driverDetail.languages;
      }
      this.patchFormValue();
      this.setDocuments();
      this.checkForm1Value();
      this.checkForm2Value();
      this.checkVehicleForm();
    })
  }

  patchFormValue() {
    this.personalInfo1Form.patchValue({
      day: this.driver.day,
      month: this.driver.month,
      year: this.driver.year,
      about: this.driverDetail ? this.driverDetail.about : '',
      drivingFromYear: this.driverDetail ? this.driverDetail.drivingFromYear : '',
      rate: this.driverDetail ? this.driverDetail.rate : ''
    });
    this.personalInfo2Form.patchValue({
      chauffeurLicenseNumber: this.driverDetail ? this.driverDetail.chauffeurLicenseNumber : '',
      licenseNumber: this.driverDetail ? this.driverDetail.licenseNumber : ''
    });
    this.vehicleDetailForm.patchValue({
      model: this.driverVehicle ? this.driverVehicle.model : '',
      registrationNumber: this.driverVehicle ? this.driverVehicle.registrationNumber : '',
      vin: this.driverVehicle ? this.driverVehicle.vin : '',
      cin: this.driverVehicle ? this.driverVehicle.cin : '',
      cinExpireMonth: this.driverVehicle ? this.driverVehicle.cinExpireMonth : '',
      cinExpireYear: this.driverVehicle ? this.driverVehicle.cinExpireYear : '',
    })
  }

  public setDocuments() {
    this.dlDocumnts = null;
    this.clDocuments = null;
    this.cinDocuments = null;
    this.vinDocuments = [];
    if (this.driverDetail && this.driverDetail.profileDocumentPhoto && this.driverDetail.profileDocumentPhoto.length > 0) {
      this.driverDetail.profileDocumentPhoto.forEach(elem => {
        if (elem) {
          this.clDocuments = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
        }
      });
    }
    if (this.driverDetail && this.driverDetail.driverLiscense && this.driverDetail.driverLiscense.length > 0) {
      this.driverDetail.driverLiscense.forEach(elem => {
        if (elem) {
          this.dlDocumnts = `${environment.host}${environment.imageBaseUrl}${elem}`;
        }
      })
    }
    if (this.driverVehicle && this.driverVehicle.cinPhoto && this.driverVehicle.cinPhoto.length > 0) {
      this.driverVehicle.cinPhoto.forEach(elem => {
        if (elem) {
          this.cinDocuments = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
        }
      })
    }
    if (this.driverVehicle && this.driverVehicle.vehicleDetailPhoto && this.driverVehicle.vehicleDetailPhoto.length > 0) {
      this.driverVehicle.vehicleDetailPhoto.forEach(elem => {
        if (elem) {
          let url = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
          this.vinDocuments.push(url);
        }
      })
    }
  }

  isLanguageSelected(id) {
    let isSelected = null;
    this.selectedLanguages.forEach(elem => {
      if (elem == id) {
        isSelected = true;
      }
    });
    return isSelected;
  }

  resetForm() {
    this.personalInfo1Form.reset();
  }

  goToGivenRoute(path, type?: string) {
    this.router.navigate([path], { queryParams: { type } });
  }

  private displayActiveForm(formName) {
    if (formName == 'personalInfo1Form') {
      this.stage = 3
    }
    if (formName == 'personalInfo2Form') {
      let isFormCompelte = this.checkForm1Value();
      if (!isFormCompelte) {
        this.router.navigate(['/driver/personal-info'], { queryParams: { type: 'personalInfo1Form' } })
      }
      this.stage = 4
    }
    if (formName == 'vehicleDetailForm') {
      let isFormComplete = this.checkForm2Value();
      if (!isFormComplete) {
        this.router.navigate(['/driver/personal-info'], { queryParams: { type: 'personalInfo2Form' } })
      }
      this.stage = 5
    }
    if (formName == 'routeForm') {
      let isFormCompelte = this.checkVehicleForm();
      if (!isFormCompelte) {
        this.router.navigate(['/driver/personal-info'], { queryParams: { type: 'vehicleDetailForm' } })
      }
    }
    for (let key in this.displayForm) {
      this.displayForm[key] = false;
    }
    this.displayForm[formName] = true;
  }

  checkForm1Value() {
    let formValues = this.personalInfo1Form.value;
    if (formValues.day && formValues.month && formValues.year && this.selectedLanguages.length > 0
      && formValues.rate && formValues.drivingFromYear) {
      this.isForm1Complete = true;
      return true;
    } else {
      return false;
    }
  }

  checkForm2Value() {
    let formValues = this.personalInfo2Form.value;
    if (formValues.chauffeurLicenseNumber && formValues.licenseNumber
      && this.clDocuments && this.dlDocumnts) {
      this.isForm2Complete = true;
      return true;
    } else {
      return false;
    }
  }


  checkVehicleForm() {
    let formValues = this.vehicleDetailForm.value;
    if (formValues.model && formValues.registrationNumber && formValues.vin &&
      formValues.cin && formValues.cinExpireMonth && formValues.cinExpireYear &&
      this.cinDocuments && this.vinDocuments.length > 0) {
      this.isVehcileFormComplete = true;
    } else {
      this.isVehcileFormComplete = false;
    }
    return this.isVehcileFormComplete;
  }


  selectLanguage(event, id) {
    let checked = event.target.checked;
    if (checked) {
      this.selectedLanguages.push(id);
    } else {
      this.selectedLanguages = this.selectedLanguages.filter(elem => elem != id);
    }
    this.setLanguageValidation();
  }

  setLanguageValidation() {
    if (this.selectedLanguages.length == 0) {
      this.personalInfo1Form.get('languages').setErrors({ invalid: true });
    } else {
      this.personalInfo1Form.get('languages').setErrors(null);
    }
  }

  submitProfile() {
    this.isSubmit = true;
    this.setLanguageValidation();
    let rate = this.personalInfo1Form.get('rate').value;
    if (this.stage == 3 && rate.length == 1) {
      this.personalInfo1Form.get('rate').setErrors({ required: true })
      return false;
    }
    if ((this.stage == 3 && this.personalInfo1Form.invalid) ||
      (this.stage == 4 && this.personalInfo2Form.invalid) ||
      (this.stage == 5 && this.vehicleDetailForm.invalid)) {
      return false;
    }
    if (this.stage == 4 && (!this.dlDocumnts || !this.clDocuments)) {
      this.showDLRedIcon = true;
      this.showCLRedIcon = true;
      return false;
    } else {
      this.showDLRedIcon = false;
      this.showCLRedIcon = false;
    }
    if (this.stage == 5 && (!this.cinDocuments || !this.vinDocuments)) {
      this.showCinRedIcon = true;
      this.showVinRedIcon = true;
      return false;
    } else {
      this.showCinRedIcon = false;
      this.showVinRedIcon = false;
    }
    let toSend = this.setDataToSend();
    this.driverService.postDriverInfo(toSend).subscribe(data => {
      this.isSubmit = false;
      if (data) {
        this.driver = data.driver;
        this.driverDetail = data.driverDetail;
        this.driverVehicle = data.driverVehicle;
      }
      if (this.stage == 3) {
        this.goToGivenRoute('/driver/personal-info', 'personalInfo2Form');
      }
      if (this.stage == 4) {
        this.goToGivenRoute('/driver/personal-info', 'vehicleDetailForm');
      }
      if (this.stage == 5) {
        this.goToGivenRoute('/driver/personal-info', 'routeForm');
        // if (this.driver.isCompleteRegistered) {
        //   localStorage.removeItem('currentUser');
        //   localStorage.setItem('currentUser', JSON.stringify(this.driver));
        //   this.goToGivenRoute('/driver/dashboard');
        // }
      }
    })
  }

  setDataToSend() {
    let toSend;
    if (this.stage == 3) {
      toSend = {
        ...this.personalInfo1Form.value,
      }
      toSend['languages'] = this.selectedLanguages;
    }
    if (this.stage == 4) {
      toSend = {
        ...this.personalInfo2Form.value
      }
    }
    if (this.stage == 5) {
      toSend = {
        ...this.vehicleDetailForm.value
      }
    }
    toSend['stage'] = this.stage;
    return toSend;
  }

  selectFile(event, eventName, displayImage) {
    const [file] = event.target.files;
    const fileType: string = file.type;
    if ((fileType === 'application/pdf' || fileType === 'image/pdf' || fileType === 'image/svg+xml') ? this.fileType = true : this.fileType = false) {
      return false;
    }
    if ((fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') ? this[displayImage] = true : this[displayImage] = false) {
      this[eventName] = event;
    }
  }

  clCropped(event: ImageCroppedEvent) {
    this.croppedClImage = event.base64;
    this.showDLRedIcon = false;
  }

  dlCropped(event: ImageCroppedEvent) {
    this.croppedDlImage = event.base64;
    this.showCLRedIcon = false;
  }

  cinCropped(event: ImageCroppedEvent) {
    this.croppedCinImage = event.base64;
    this.showCinRedIcon = false;
  }

  vinCropped(event: ImageCroppedEvent) {
    this.croppedVinImage = event.base64;
    this.showVinRedIcon = false;
  }

  cancelDocument() {
    this.hideModal = true;
    this.displaySelctedCl = false;
    this.displaySelctedDl = false;
    this.displaySelctedCin = false;
    this.displaySelctedVin = false;
    this.croppedClImage = '';
    this.croppedDlImage = '';
    this.croppedCinImage = '';
    this.croppedVinImage = '';
  }

  submitFile(imageName, keyName) {
    if (this[imageName] == '') {
      return false;
    }
    this.hideModal = true;
    let toSend = {
      stage: 6
    }
    toSend[keyName] = this[imageName];
    this.driverService.postDriverInfo(toSend).subscribe(data => {
      this.availableLanguage = data.availableLanguage;
      this.driver = data.driver;
      this.driverDetail = data.driverDetail;
      this.driverVehicle = data.driverVehicle;
      this.cancelDocument();
      this.setDocuments()
    });
  }

  removeImage(imageName, item?: string) {
    let vehicleDetailPhoto = [];
    if (imageName != 'vinDocuments') {
      this[imageName] = null;
    }
    if (imageName == 'vinDocuments') {
      this[imageName] = this[imageName].filter(elem => {
        let url = item.split('/');
        let elemUrl = elem.split('/');
        if (elemUrl[elemUrl.length - 1] != url[url.length - 1]) {
          vehicleDetailPhoto.push({ document: elemUrl[elemUrl.length - 1] });
          return elemUrl[elemUrl.length - 1] != url[url.length - 1];
        }
      });
    }
    if (imageName == 'clDocuments') {
      this.deleteImage({ driverLiscense: [] });
    }
    if (imageName == 'dlDocumnts') {
      this.deleteImage({ profileDocumentPhoto: [] });
    }
    if (imageName == 'cinDocuments') {
      this.deleteImage({ cinPhoto: [] });
    }
    if (imageName == 'vinDocuments') {
      this.deleteImage({ vehicleDetailPhoto: vehicleDetailPhoto });
    }
  }

  deleteImage(image) {
    this.driverService.driverDeleteImage(image).subscribe(data => {
    })
  }


  cancelRoute() {
    this.routeForm.reset()
    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
      polygonOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      }
    });
    drawingManager.setMap(this.map);
    this.polygonPoints = [];
    this.initMap()
  }


  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem("CURRENT_LOCATION"));
    if (location) {
      this.centerPoints["lat"] = location.latitude;
      this.centerPoints["lng"] = location.longitude;
    }
  }

  initMap(zoom?: number) {
    this.directionsRenderer = (<any>window).directionsRenderer;
    this.directionsService = (<any>window).directionsService;

    let currentPoints;
    if (this.centerPoints.lng && this.centerPoints) {
      currentPoints = new google.maps.LatLng(
        this.centerPoints.lat,
        this.centerPoints.lng
      );
    }

    var mapOptions = {
      zoom: 10,
      // maxZoom: 10,
      streetViewControl: false,
      center: currentPoints,
    };

    if (zoom) {
      mapOptions['maxZoom'] = zoom;
    }
    this.map = new google.maps.Map(
      document.getElementById("local"),
      mapOptions
    );

    this.directionsRenderer.setMap(this.map);
    this.setPolygonProperty();
  }


  private setPolygonProperty() {
    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
      polygonOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      }
    });
    drawingManager.setMap(this.map);

    var that = this;
    google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
      if (polygon) {
        this.isPolygon = true;
        let pointsArray = polygon.getPath().getArray();
        that.setPolygonPoints(pointsArray);

        drawingManager.setOptions({
          drawingControl: true,
          drawingMode: null
        });

        polygon.getPaths().forEach(function (path, index) {
          google.maps.event.addListener(path, 'insert_at', function () {
            let pointsArray = path.getArray();
            that.polygonPoints = [];
            that.setPolygonPoints(pointsArray);
          });
        });


        google.maps.event.addListener(polygon, 'dragend', function () {
          let length = that.polygonPoints.length;
          let pointsArray = polygon.getPath().getArray();
          that.setPolygonPoints(pointsArray);
          that.polygonPoints = that.polygonPoints.splice(0, length);
        });

        polygon.getPaths().forEach(function (path, index) {
          google.maps.event.addListener(path, 'set_at', function () {
            let pointsArray = path.getArray();
            that.polygonPoints = [];
            that.setPolygonPoints(pointsArray);
          });
        })


      }
    })
  }

  setPolygonPoints(pointsArray) {
    pointsArray.forEach(points => {
      let latLng = {
        lat: points.lat(),
        lng: points.lng()
      };
      this.polygonPoints.push(latLng);
    });
  }

  selectAddress(event) {
    if (!event || !event.lat || !event.long) {
      return false;
    }
    this.zone.run(() => {
      this.routeForm.get('schoolName').setValue(event.formatted_address)
      this.centerPoints.lat = event.lat;
      this.centerPoints.lng = event.long;
      this.initMap(15);
      this.initMarker();
    });
  }

  private initMarker() {
    let bounds = new google.maps.LatLngBounds();
    let markers = [];
    bounds.extend({
      lat: parseFloat(this.centerPoints.lat),
      lng: parseFloat(this.centerPoints.lng)
    });
    var latLng = new google.maps.LatLng(
      parseFloat(this.centerPoints.lat),
      parseFloat(this.centerPoints.lng));
    var marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
    });
    markers.push(marker);
    // this.map.setZoom(10);
    this.map.fitBounds(bounds);
  }

  saveRoute() {
    this.isSubmit = true;
    if (!this.isPolygon || this.routeForm.invalid) {
      return false
    }
    let points = [];
    this.polygonPoints.forEach(point => {
      points.push([parseFloat(point.lng), parseFloat(point.lat)]);
    });
    points.push([
      parseFloat(this.polygonPoints[0].lng),
      parseFloat(this.polygonPoints[0].lat)])
    // let isValidSchool = this.checkSchoolWithinPolygon(points);
    // if (!isValidSchool) {
    //   return false;
    // }
    let route = {
      polygonPoints: JSON.stringify(points),
      type: 2,
      title: this.routeForm.get('title').value,
      isEdit: this.isEdit,
      routeId: this.routeId,
      schoolName: this.routeForm.get('schoolName').value,
      schoolCoordinates: JSON.stringify([
        parseFloat(this.centerPoints.lat).toFixed(3),
        parseFloat(this.centerPoints.lng).toFixed(3)]),
      isRegister: "Register"
    }
    this.userServise.saveSchoolRoute(route).subscribe((data) => {
      if (data && data.response) {
        this.TS.success("Add route successful");
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser', JSON.stringify(data.response.driver));
        this.router.navigate(['/driver/dashboard']);
      }
    });
  }

  checkSchoolWithinPolygon(polygonPoints) {
    let formatedPoints = polygonPoints.map(elem => {
      return { lat: elem[0], lng: elem[1] }
    })
    let coordinates = new google.maps.LatLng(
      this.centerPoints.lng,
      this.centerPoints.lat
    );
    let polyPoints = new google.maps.Polygon({ paths: formatedPoints });
    let isValidSchoolPoints = google.maps.geometry.poly.containsLocation(coordinates, polyPoints);
    if (!isValidSchoolPoints) {
      this.TS.error("Please select school within polygon");
    }
    return isValidSchoolPoints;
  }


}
