import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { google } from "google-maps";
import { SharedService } from 'src/app/core/http/shared-service';
declare var google: google;
  
@Component({
  selector: 'app-auth-header',
  templateUrl: './auth-header.component.html',
  styleUrls: ['./auth-header.component.css']
})
export class AuthHeaderComponent implements OnInit {

  public currentAddress = '';
  public currentUser;
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.currentUser = this.authenticationService.getUserInfo();
    if (this.currentUser.value) {
      // if (this.currentUser.value.type === 1) {
      //   this.router.navigate(['/rider/profile']);
      // }
      // if (this.currentUser.value.type === 2) {
      //   this.router.navigate(['/driver/profile']);
      // }
    }
    this.getCurrentLocation();
  }

  navigateUrl(url: string, type: string) {
    if (type === '' || type === null) {
      this.router.navigateByUrl(url);
    }
    if (type != '') {
      this.router.navigate([url], {queryParams:{type: type} })
    }
  }

  private getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(data => {
      if (data) {
        this.sharedService.setCurrentLocation(data.coords);
        let latLang = { lat: data.coords.latitude, lng: data.coords.longitude };
        let geocoder = new google.maps.Geocoder;
        geocoder.geocode({ 'location': latLang }, (result, status) => {
          let address = result[0].formatted_address;
          let splitArray = address.split(',');
          let country = splitArray[splitArray.length - 1];
          let state = splitArray[splitArray.length - 2];
          let city = splitArray[splitArray.length - 3];
          this.currentAddress = city + ', ' + state + ', ' + country;
        });
      }
    }, error => {
        this.sharedService.setCurrentLocation(null);
      })
  }

}
