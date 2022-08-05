import { Component, OnInit, NgZone } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { environment } from 'src/environments/environment';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-available-driver',
  templateUrl: './available-driver.component.html',
  styleUrls: ['./available-driver.component.css']
})
export class AvailableDriverComponent implements OnInit {

  public environment = environment;
  public allDrivers: Array<any>;
  public totalRides: number;
  public type = 'School';
  public selectedDriver = null;
  public schoolRideForm: FormGroup;
  public lat: any = 27.994402;
  public long: any = -81.760254;
  public coordinates = [{
    lat: null,
    long: null
  }, {
    lat: null,
    long: null
  }];
  public isSubmit = false;
  public formatedSchoolAddress = {
    fromAddress: '',
    toAddress: ''
  };
  public map;
  public schoolNames = [];
  public showSchoolDropDown = false;
  public showSearchedMessage = false;
  public driverSchoolId = '';
  constructor(
    private riderService: RiderService,
    private zone: NgZone,
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initForm();
    this.getDrivers();
    this.riderService.checkIsRidesChanged().subscribe(data => {
      if (data) {
        this.getDrivers();
      }
    })
  }

  private getDrivers() {
    let allDrivers = JSON.parse(sessionStorage.getItem('allDrivers'));
    this.coordinates = allDrivers.path.coordinates;
    this.lat = this.coordinates[0].lat;
    this.long = this.coordinates[0].long;
    this.allDrivers = allDrivers.drivers;
    this.driverSchoolId = allDrivers.driverSchoolId;
    this.patchFormValue(allDrivers.path);
    this.type = allDrivers.type;
    this.selectTopDriver();
    this.initMap();

  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem('CURRENT_LOCATION'));
    if (location) {
      this.lat = location.latitude;
      this.long = location.longitude;
    }
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById('myMap'), {
      mapTypeId: 'terrain',
      streetViewControl: false,
    });
    let bounds = new google.maps.LatLngBounds();
    // bounds.extend({ lat: parseFloat(this.lat), lng: parseFloat(this.long) })
    let markers = [];
    for (let i = 0; i < this.coordinates.length; i++) {
      bounds.extend({ lat: this.coordinates[i].lat, lng: this.coordinates[i].long });
      var latLng = new google.maps.LatLng(this.coordinates[i].lat,
        this.coordinates[i].long);
      var marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
      markers.push(marker);
    }
    this.map.fitBounds(bounds);
  }

  private selectTopDriver() {
    this.totalRides = this.allDrivers.length;
    if (this.totalRides > 0) {
      this.selectDriver(this.allDrivers[0]);
    } else {
      this.selectedDriver = null;
      this.riderService.selectedDriver.next(null);
    }
  }

  private initForm() {
    this.schoolRideForm = this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]]
    })
  }

  private patchFormValue(data) {
    this.schoolRideForm.setValue({
      from: data.from,
      to: data.to
    })
  }


  selectDriver(driver) {
    this.selectedDriver = driver;
    this.appendImageUrl();
    this.riderService.selectedDriver.next(this.selectedDriver);
  }

  private appendImageUrl() {
    if (this.selectedDriver.driverVehicles
      && this.selectedDriver.driverVehicles.vehicleDetailPhoto &&
      this.selectedDriver.driverVehicles.vehicleDetailPhoto.length > 0) {
      this.selectedDriver.driverVehicles.vehicleDetailPhoto =
        this.selectedDriver.driverVehicles.vehicleDetailPhoto.map(elem => {
          if (elem && !elem.isUrlSet) {
            elem.document = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
            elem['isUrlSet'] = true;
          }
          return elem;
        });
    }

    if (this.selectedDriver.driverDetails &&
      this.selectedDriver.driverDetails.profileDocumentPhoto &&
      this.selectedDriver.driverDetails.profileDocumentPhoto.length > 0) {
      this.selectedDriver.driverDetails.profileDocumentPhoto =
        this.selectedDriver.driverDetails
          .profileDocumentPhoto.map(elem => {
            if (elem.document && !elem.isUrlSet) {
              elem.document = `${environment.host}${environment.imageBaseUrl}${elem.document}`;
              elem['isUrlSet'] = true;
            }
            return elem;
          });
    }
  }

  selectAddress(event, type: string) {
    this.zone.run(() => {
      if (type === 'from') {
        this.formatedSchoolAddress.fromAddress = event.formatted_address;
        this.coordinates[0].lat = event.lat;
        this.coordinates[0].long = event.long;
        this.initMap();
      }
      if (type === 'to') {
        this.formatedSchoolAddress.toAddress = event.formatted_address;
        this.coordinates[1].lat = event.lat;
        this.coordinates[1].long = event.long;
        this.initMap();
      }
    })
  }

  searchRide() {
    this.isSubmit = true;
    this.validateCoordinates();
    console.log(this.schoolRideForm)
    if (this.schoolRideForm.invalid) {
      return true;
    }
    const toSubmit = {
      from: [this.coordinates[0].long, this.coordinates[0].lat],
      to: [this.coordinates[1].long, this.coordinates[1].lat],
      requestType: 1,
      driverSchoolId: this.driverSchoolId
    }
    this.riderService.searchRide(toSubmit).subscribe(data => {
      if (data !== undefined || data !== null) {
        this.allDrivers = data;
        this.selectTopDriver();
        this.setDataInSeession(data);
      } else {
        this.allDrivers = [];
        this.selectedDriver = null;
        this.setDataInSeession(null);
      }
      this.riderService.isRidesChanged.next(true);
    }, (error) => {
      console.log(error);
    })
  }

  private validateCoordinates() {
    const from = this.coordinates[0];
    const to = this.coordinates[1];
    if (from.lat === null || from.lat === undefined || from.long === null || from.long === undefined) {
      this.schoolRideForm.get('from').setErrors({ invalid: true })
    }
    if (from.lat != null && from.lat != undefined && from.long != null && from.long != undefined) {
      this.schoolRideForm.get('from').updateValueAndValidity();
    }
    if (to.lat === null || to.lat === undefined || to.long === null || to.long === undefined) {
      this.schoolRideForm.get('to').setErrors({ invalid: true })
    }
    if (to.lat != null && to.lat != undefined && to.long != null && to.long != undefined) {
      this.schoolRideForm.get('to').updateValueAndValidity();
    }
  }

  private setDataInSeession(data) {
    const path = {
      from: this.formatedSchoolAddress.fromAddress,
      to: this.schoolRideForm.get('to').value,
      coordinates: this.coordinates,
    }
    this.riderService.setAvailableRide({ drivers: data, path, type: 'School', driverSchoolId: this.driverSchoolId }, 'allDrivers');
  }

  searchSchoolName() {
    let searchString = this.schoolRideForm.get('to').value;
    if (searchString == '') {
      this.showSchoolDropDown = false;
      return
    }
    this.riderService.getSchoolByName({ searchString }).subscribe(data => {
      if (data.length == 0) {
        this.showSearchedMessage = true;
        this.showSchoolDropDown = true;
        this.schoolNames = [];
      }
      if (data.length > 0) {
        this.schoolNames = data;
        this.showSearchedMessage = false;
        this.showSchoolDropDown = true;
      }
    })
  }

  selectSchool(item) {
    this.driverSchoolId = item._id;
    this.schoolRideForm.get("to").setValue(item.schoolName);
    this.coordinates[1].lat = item.schoolCoordinates.coordinates[0];
    this.coordinates[1].long = item.schoolCoordinates.coordinates[1];
    this.showSchoolDropDown = false;
    this.initMap();
  }


}
