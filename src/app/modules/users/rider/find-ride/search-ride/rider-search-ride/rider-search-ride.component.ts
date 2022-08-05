import { Component, OnInit, NgZone } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RiderService } from 'src/app/core/http/rider-service';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { User } from 'src/app/shared/models/user';
import { SharedService } from 'src/app/core/http/shared-service';

@Component({
  selector: 'app-rider-search-ride',
  templateUrl: './rider-search-ride.component.html',
  styleUrls: ['./rider-search-ride.component.css']
})
export class RiderSearchRideComponent implements OnInit {

  public currentUser: User;
  public activeSchool = true;
  public bookEvent = false;
  public eventType = 1;
  public isSubmit = false;
  public schoolRideForm: FormGroup;
  public otherRideForm: FormGroup;
  public currentLat = 27.994402;
  public currentLong = -81.760254;
  public lat: any = 27.994402;
  public long: any = -81.760254;
  public coordinates = [{
    lat: null,
    long: null
  }, {
    lat: null,
    long: null
  }];
  public otherCoordintes = [{
    lat: null,
    long: null
  }, {
    lat: null,
    long: null
  }];
  public formatedSchoolAddress = {
    fromAddress: '',
    toAddress: ''
  };
  public formatedOtherAddress = {
    fromAddress: '',
    toAddress: ''
  };
  public maxDate = new Date();
  public minDate = new Date();
  public oneWay = true;
  public twoWay = false;
  public otherEventData;
  public toDate = [];
  public eventMap;
  public schoolMap;
  public showSchoolDropDown = false;
  public showSearchedMessage = false;
  public schoolNames = [];
  public selectedSchool = null;
  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private riderService: RiderService,
    private authService: AuthenticationService,
    private router: Router,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getCurrentLocation()
    this.initForm();
    this.riderService.getAvailableRideAndEvents('eventData').subscribe(data => {
      if (data) {
        this.otherEventData = data;
        this.patchEventFormValue();
        this.riderService.removeAllDriversAndEvents('eventData');
        this.riderService.removeAllDriversAndEvents('allDrivers');
      }
    })
    this.minDate.setDate(this.minDate.getDate());
    this.maxDate.setDate(this.maxDate.getDate() + 30);
  }

  ngAfterViewInit() {
    this.initSchoolMap();
    this.initEventMap();
  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem('CURRENT_LOCATION'));
    if (location) {
      this.currentLat = location.latitude;
      this.currentLong = location.longitude;
    }
  }


  private initForm() {
    this.schoolRideForm = this.fb.group({
      from: ['', [Validators.required]],
      to: ['', [Validators.required]]
    });
    this.otherRideForm = this.fb.group({
      source: ['', [Validators.required]],
      destination: ['', [Validators.required]],
      tripType: ['1', [Validators.required]],
      fromDate: ['', [Validators.required]],
      toDate: [''],
      numberOfPassengers: [1, [Validators.required]],
      isHavingLuggage: ['false', [Validators.required]],
      isSharing: ['false', [Validators.required]],
      instructions: ['']
    });
  }

  private patchEventFormValue() {
    let utcFromDate = moment.utc(this.otherEventData.fromDate);
    let localFromDate = utcFromDate.local();
    let utcToDate = moment.utc(this.otherEventData.toDate);
    let localToDate = utcToDate.local();

    this.toDate = [localFromDate, localToDate];
    this.activeSchool = false;
    this.bookEvent = true;
    this.otherRideForm.patchValue({
      source: this.otherEventData.fromAddress,
      destination: this.otherEventData.toAddress,
      tripType: this.otherEventData.tripType,
      fromDate: localFromDate,
      toDate: localToDate,
      numberOfPassengers: this.otherEventData.numberOfPassengers,
      isHavingLuggage: this.otherEventData.isHavingLuggage,
      isSharing: this.otherEventData.isSharing,
      instructions: this.otherEventData.instructions
    });
    this.otherCoordintes[0].lat = this.otherEventData.from[0];
    this.otherCoordintes[0].long = this.otherEventData.from[1];
    this.otherCoordintes[1].lat = this.otherEventData.to[0];
    this.otherCoordintes[1].long = this.otherEventData.to[1];
  }
  selectAddress(event, type: string) {
    this.zone.run(() => {
      if (type === 'from') {
        this.formatedSchoolAddress.fromAddress = event.formatted_address;
        this.coordinates[0].lat = event.lat;
        this.coordinates[0].long = event.long;
        this.initSchoolMap();
      }
      if (type === 'to') {
        this.formatedSchoolAddress.toAddress = event.formatted_address;
        this.coordinates[1].lat = event.lat;
        this.coordinates[1].long = event.long;
        this.initSchoolMap();
      }
    })
  }

  selectOtherAddress(event, type: string) {
    this.zone.run(() => {
      if (type === 'from') {
        this.formatedOtherAddress.fromAddress = event.formatted_address;
        this.otherCoordintes[0].lat = event.lat;
        this.otherCoordintes[0].long = event.long;
        this.initEventMap();
      }
      if (type === 'to') {
        this.formatedOtherAddress.toAddress = event.formatted_address;
        this.otherCoordintes[1].lat = event.lat;
        this.otherCoordintes[1].long = event.long;
        this.initEventMap();
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
      driverSchoolId: this.selectedSchool ? this.selectedSchool._id : null
    }
    this.riderService.searchRide(toSubmit).subscribe(data => {
      if (data !== undefined || data !== null) {
        this.setDataInSeession(data, '1');
        this.router.navigate(['/rider/available-ride']
        );
      }
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

  updateEventType(type) {
    this.eventType = type;
    if (type == 1) {
      this.activeSchool = true;
      this.bookEvent = false;
    }
    if (type == 2) {
      this.bookEvent = true;
      this.activeSchool = false;
    }
  }

  updatePassengerNo(action: string) {
    let currentValue = parseInt(this.otherRideForm.get('numberOfPassengers').value);
    if (action === 'dec') {
      if (currentValue <= 1) {
        return;
      }
      currentValue = currentValue - 1;
      this.otherRideForm.get('numberOfPassengers').setValue(currentValue);
    }
    if (action === 'inc') {
      if (currentValue >= 200) {
        return;
      }
      currentValue = currentValue + 1;
      this.otherRideForm.get('numberOfPassengers').setValue(currentValue);
    }
  }

  searchOtherRide() {
    this.isSubmit = true;
    this.validateOtherRideForm();
    if (this.otherRideForm.invalid) {
      return false;
    }
    let utcFromDate = moment.utc(this.otherRideForm.get('fromDate').value);
    let localFromDate = utcFromDate.local();
    let utcToDate = moment.utc(this.otherRideForm.get('toDate').value);
    let localToDate = utcToDate.local();

    this.otherRideForm.patchValue({
      fromDate: localFromDate,
      toDate: localToDate,
    })
    const toSend = {
      ...this.otherRideForm.value,
      requestType: 2,
      from: [this.otherCoordintes[0].lat, this.otherCoordintes[0].long],
      to: [this.otherCoordintes[1].lat, this.otherCoordintes[1].long],
      source: this.formatedOtherAddress.fromAddress ?
        this.formatedOtherAddress.fromAddress : this.otherEventData.fromAddress,
      destination: this.formatedOtherAddress.toAddress ?
        this.formatedOtherAddress.toAddress : this.otherEventData.toAddress
    }
    this.riderService.bookOtherEvent(toSend).subscribe(data => {
      if (data) {
        this.otherRideForm.reset();
        this.router.navigate(['/rider/my-request']);
      }
    })
  }

  validateOtherRideForm() {
    const from = this.otherCoordintes[0];
    const to = this.otherCoordintes[1];
    if (from.lat === null || from.lat === undefined || from.long === null || from.long === undefined) {
      this.otherRideForm.get('source').setErrors({ invalid: true })
    }
    if (from.lat != null && from.lat != undefined && from.long != null && from.long != undefined) {
      this.otherRideForm.get('source').updateValueAndValidity();
    }
    if (to.lat === null || to.lat === undefined || to.long === null || to.long === undefined) {
      this.otherRideForm.get('destination').setErrors({ invalid: true })
    }
    if (to.lat != null && to.lat != undefined && to.long != null && to.long != undefined) {
      this.otherRideForm.get('destination').updateValueAndValidity();
    }
  }

  private setDataInSeession(data, type) {
    if (type === '1') {
      const path = {
        from: this.formatedSchoolAddress.fromAddress,
        to: this.schoolRideForm.get('to').value,
        coordinates: this.coordinates
      }
      this.riderService.setAvailableRide({
        drivers: data,
        path,
        type: 'School',
        driverSchoolId: this.selectedSchool._id
      }, 'allDrivers');
    }
  }


  private initSchoolMap() {
    if (!this.coordinates[0].lat || !this.coordinates[0].long) {
      this.schoolMap = new google.maps.Map(document.getElementById('school-map2'), {
        zoom: 7,
        maxZoom: 7,
        mapTypeId: 'terrain',
        streetViewControl: false,
        center: { lat: this.currentLat, lng: this.currentLong },
      });
    }

    if (this.coordinates[0].lat && this.coordinates[0].long) {
      this.schoolMap = new google.maps.Map(document.getElementById('school-map2'), {
        mapTypeId: 'terrain',
        maxZoom: 7,
        streetViewControl: false,
      });
      let bounds = new google.maps.LatLngBounds();
      // bounds.extend({ lat: parseFloat(this.lat), lng: parseFloat(this.long) })
      let markers = [];
      for (let i = 0; i < this.coordinates.length; i++) {
        if (this.coordinates[i].lat && this.coordinates[i].long) {
          bounds.extend({
            lat: parseFloat(this.coordinates[i].lat),
            lng: parseFloat(this.coordinates[i].long)
          });
          var latLng = new google.maps.LatLng(
            parseFloat(this.coordinates[i].lat),
            parseFloat(this.coordinates[i].long));
          var marker = new google.maps.Marker({
            position: latLng,
            map: this.schoolMap,
          });
          markers.push(marker);
        }
      }
      this.schoolMap.fitBounds(bounds);
    }
  }

  private initEventMap() {
    if (!this.otherCoordintes[0].lat || !this.otherCoordintes[0].long) {
      this.eventMap = new google.maps.Map(document.getElementById('event-map2'), {
        zoom: 7,
        mapTypeId: 'terrain',
        streetViewControl: false,
        center: { lat: this.currentLat, lng: this.currentLong },
      });
    }

    if (this.otherCoordintes[0].lat && this.otherCoordintes[0].long) {
      this.eventMap = new google.maps.Map(document.getElementById('event-map2'), {
        zoom: 7,
        streetViewControl: false,
        mapTypeId: 'terrain',
      });
      let bounds = new google.maps.LatLngBounds();
      let markers = [];
      for (let i = 0; i < this.otherCoordintes.length; i++) {
        if (this.otherCoordintes[i].lat && this.otherCoordintes[i].long) {
          bounds.extend({
            lat: parseFloat(this.otherCoordintes[i].lat),
            lng: parseFloat(this.otherCoordintes[i].long)
          });
          var latLng = new google.maps.LatLng(
            parseFloat(this.otherCoordintes[i].lat),
            parseFloat(this.otherCoordintes[i].long));
          var marker = new google.maps.Marker({
            position: latLng,
            map: this.eventMap,
          });
          markers.push(marker);
        }
      }
      this.eventMap.fitBounds(bounds);
    }
  }


  handleRadioButton(value: string) {
    if (value === 'oneWay') {
      this.oneWay = true;
      this.twoWay = false;
      this.otherRideForm.patchValue({
        fromDate: '',
        toDate: ''
      });
    }
    if (value === 'twoWay') {
      this.twoWay = true;
      this.oneWay = false;
      this.otherRideForm.patchValue({
        fromDate: '',
        toDate: ''
      });
    }
  }
  handleDateRange(event) {
    this.otherRideForm.patchValue({
      fromDate: new Date(event[0]),
      toDate: new Date(event[1])
    });
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
    this.selectedSchool = item;
    this.schoolRideForm.get("to").setValue(item.schoolName);
    this.coordinates[1].lat = item.schoolCoordinates.coordinates[0];
    this.coordinates[1].long = item.schoolCoordinates.coordinates[1];
    this.showSchoolDropDown = false;
    this.initSchoolMap();
  }


}
