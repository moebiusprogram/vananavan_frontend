import { Component, OnInit } from '@angular/core';
import { DriverService } from 'src/app/core/http/driver-service';
import { Trip } from 'src/app/shared/models/trip.model';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-ride-request',
  templateUrl: './driver-ride-request.component.html',
  styleUrls: ['./driver-ride-request.component.css']
})
export class DriverRideRequestComponent implements OnInit {

  public requestType = 1;
  public rideRequest: Array<Trip> = [];
  public tripHistory: Array<Trip> = [];
  public selectedId;
  constructor(
    private driverService: DriverService,
    private sharedChatService: SharedChatService
  ) { }

  ngOnInit() {
    this.getAllRide();
    this.getBiddingMessage();
  }

  private getAllRide() {
    this.driverService.getRideRequestTripHistory({ requestType: this.requestType }).subscribe(data => {
      this.selectedId = data[0]? data[0]._id: null;
      if (this.requestType === 1) {
        this.rideRequest = this.appendImageUrl(data);
        this.tripHistory = [];
        this.driverService.selectedRideAndTrip.next({
          rideRequest: this.rideRequest[0] ? this.rideRequest[0] : null,
          requestType: this.requestType
        })
      }
      if (this.requestType === 2) {
        this.tripHistory = this.appendImageUrl(data);
        this.rideRequest = [];
        this.driverService.selectedRideAndTrip.next({
          rideRequest: this.tripHistory[0] ? this.tripHistory[0] : null,
          requestType: this.requestType
        })
      }
    })
  }

  public appendImageUrl(data) { 
    let appendedUrl = data.map(elem => {
      if (elem && elem.details && elem.details.avatar) {
        elem.details.avatar = `${environment.host}${environment.imageBaseUrl}${elem.details.avatar}`;
      }
      return elem;
    });
    return appendedUrl;
  }
  
  updateRequestType(type: number) {
    this.requestType = type;
    this.getAllRide();
  }

  updateSelectedRequest(item, requestType) {
    this.selectedId = item._id;
    this.driverService.selectedRideAndTrip.next({ rideRequest: item, requestType: requestType });
  }

  private getBiddingMessage() {
    this.sharedChatService.onBiddingMessage().subscribe(message => {
      if (message) {
        this.rideRequest = this.rideRequest.map(elem => {
          if (elem._id == message.msg.tripId._id) {
            elem.isResponded = true;
            elem.quote = message.msg.message;
            return elem;
          } else {
            return elem;
          }
        })
      }
    })
  }
  
}
