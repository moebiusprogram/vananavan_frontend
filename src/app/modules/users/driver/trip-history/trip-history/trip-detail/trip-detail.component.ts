import { Component, OnInit, NgZone } from '@angular/core';
import { DriverService } from 'src/app/core/http/driver-service';
import { Trip } from 'src/app/shared/models/trip.model';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';

@Component({
  selector: 'app-trip-detail',
  templateUrl: './trip-detail.component.html',
  styleUrls: ['./trip-detail.component.css']
})
export class TripDetailComponent implements OnInit {

  public lat = 24.799448;
  public long = 120.979021;
  public coordinates = [{
    lat: 24.799448,
    long: 120.979021
  }, {
    lat: 28.5355,
    long: 77.3910
  }];
  public map;
  public selectedRequest: Trip = null;
  constructor(
    private driverService: DriverService,
    private authService: AuthenticationService,
    private sharedChatService: SharedChatService,
    private zone: NgZone
  ) { }

  ngOnInit() {
    this.getSelectedRide();
  }

  private getSelectedRide() {
    this.driverService.getSelectedTripHistroy().subscribe(data => {
      if (data) {
        this.selectedRequest = data.trip;
        if (this.selectedRequest) {
          this.coordinates[0].lat = this.selectedRequest.from.coordinates[0];
          this.coordinates[0].long = this.selectedRequest.from.coordinates[1];
          this.coordinates[1].lat = this.selectedRequest.to.coordinates[0];
          this.coordinates[1].long = this.selectedRequest.to.coordinates[1];
          this.lat = this.coordinates[0].lat;
          this.long = this.coordinates[0].long;
          setTimeout(() => {
            this.initMap();
          }, 0)
        }
      }
    });
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById('myMap'), {
      mapTypeId: 'terrain',
      streetViewControl: false,
    });
    let bounds = new google.maps.LatLngBounds();
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

}
