import { Component, OnInit } from '@angular/core';
import { DriverService } from 'src/app/core/http/driver-service';
import { Trip } from 'src/app/shared/models/trip.model';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';

@Component({
  selector: "app-driver-ride-detail",
  templateUrl: "./driver-ride-detail.component.html",
  styleUrls: ["./driver-ride-detail.component.css"],
})
export class DriverRideDetailComponent implements OnInit {
  public lat = 24.799448;
  public long = 120.979021;
  public coordinates = [
    {
      lat: 24.799448,
      long: 120.979021,
    },
    {
      lat: 28.5355,
      long: 77.391,
    },
  ];
  public selectedRequest: Trip = null;
  public requestType = 1;
  public quote = "";
  public from: string;
  public map;
  constructor(
    private driverService: DriverService,
    private authService: AuthenticationService,
    private sharedChatService: SharedChatService
  ) { }

  ngOnInit() {
    this.getCurrentLocation();
    this.getSelectedRide();
    this.authService.getUserInfo().subscribe((data) => {
      this.from = data._id;
    });
    this.getBiddingMessage();
  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem("CURRENT_LOCATION"));
    if (location) {
      this.lat = location.latitude;
      this.long = location.longitude;
    }
  }

  private getSelectedRide() {
    this.driverService.getSelectedRide().subscribe((data) => {
      if (data) {
        this.selectedRequest = data.rideRequest;
        this.requestType = data.requestType;
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
        if (
          this.selectedRequest &&
          this.selectedRequest.isResponded &&
          this.selectedRequest.quote
        ) {
          this.quote = "$" + this.selectedRequest.quote;
        }
        if (!this.selectedRequest || !this.selectedRequest.isResponded) {
          this.quote = "";
        }
      }
    });
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById("ride-map"), {
      mapTypeId: "terrain",
      streetViewControl: false,
    });
    let bounds = new google.maps.LatLngBounds();
    let markers = [];
    for (let i = 0; i < this.coordinates.length; i++) {
      bounds.extend({
        lat: this.coordinates[i].lat,
        lng: this.coordinates[i].long,
      });
      var latLng = new google.maps.LatLng(
        this.coordinates[i].lat,
        this.coordinates[i].long
      );
      var marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
      });
      markers.push(marker);
    }
    this.map.fitBounds(bounds);
  }

  submitQuote() {
    let quote = this.quote.substr(1);
    if (quote === "") {
      return false;
    }
    const message = {
      message: quote,
      to: this.selectedRequest.details._id,
      from: this.from,
      createdAt: new Date(),
      tripId: this.selectedRequest,
      bookingId: this.selectedRequest.bookingId,
      messageType: 2,
    };
    this.sharedChatService.sendQuote(message);
    this.quote = "";
  }

  private getBiddingMessage() {
    this.sharedChatService.onBiddingMessage().subscribe((message) => {
      if (
        message &&
        message.msg.tripId &&
        message.msg.tripId._id == this.selectedRequest._id
      ) {
        this.selectedRequest.isResponded = true;
        this.quote = "$" + message.msg.message;
      }
    });
  }
}
