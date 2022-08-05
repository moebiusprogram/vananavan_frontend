import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-admin-auth-header',
  templateUrl: './admin-auth-header.component.html',
  styleUrls: ['./admin-auth-header.component.css']
})
export class AdminAuthHeaderComponent implements OnInit {

  public currentAddress = '';
  constructor() { }

  ngOnInit() {
    this.getCurrentLocation();
  }


  private getCurrentLocation() {
    navigator.geolocation.getCurrentPosition(data => {
      if (data) {
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
    })
  }
  
}