import { Component, OnInit } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rider-request-detail',
  templateUrl: './rider-request-detail.component.html',
  styleUrls: ['./rider-request-detail.component.css']
})
export class RiderRequestDetailComponent implements OnInit {

  public environment = environment;
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
  public response: any[] = [];
  public selectedRequest = null;
  public requestType: number; // 1-Active request, 2-Cancelled request
  constructor(
    private riderService: RiderService,
    private sharedChatService: SharedChatService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getCurrentLocation()
    this.getRequest();
    this.getBiddingMessage();
  }


  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem('CURRENT_LOCATION'));
    if (location) {
      this.lat = location.latitude;
      this.long = location.longitude;
    }
  }


  private getRequest() {
    this.riderService.getSelectedRequest().subscribe((data: any) => {
      if (data.request != undefined || data.request != null) {
        this.selectedRequest = data.request;
        this.requestType = data.requestType;
        this.getResponseFromDriver({ bookingId: this.selectedRequest.bookingId });

        this.coordinates[0].lat = this.selectedRequest.from.coordinates[0];
        this.coordinates[0].long = this.selectedRequest.from.coordinates[1];
        this.coordinates[1].lat = this.selectedRequest.to.coordinates[0];
        this.coordinates[1].long = this.selectedRequest.to.coordinates[1];
        this.lat = this.coordinates[0].lat;
        this.long = this.coordinates[0].long;
        this.initMap();
      }
      if (data.request == undefined || data.request == null) {
        this.selectedRequest = null;
        this.requestType = data.requestType;
      }
    });
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById("request-map1"), {
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

  cancelRequest() {
    this.riderService.cancelRiderRequest({ id: this.selectedRequest._id, bookingId: this.selectedRequest.bookingId }).subscribe(data => {
      if (data) {
        this.riderService.cancelRequest.next({ id: this.selectedRequest._id, bookingId: this.selectedRequest.bookingId });
      }
    });
  }

  private filterUniqueResponse(originalArray) {
    var newArray = [];
    var lookupObject = {};
    for (var i in originalArray) {
      lookupObject[originalArray[i]['driverId']['_id']] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  getResponseFromDriver(obj) {
    this.riderService.getDriverResponse(obj).subscribe(data => {
      this.response = data;
    })
  }

  private getBiddingMessage() {
    this.sharedChatService.onBiddingMessage().subscribe(msg => {
      if (msg.msg) {
        let response = {
          bookingId: msg.msg.bookingId,
          quote: msg.msg.message,
          driverId: msg.msg.sortedTopMessage[0]['from'],
          createdAt: msg.msg.createdAt,
          isResponsed: true
        }
        let currentResponse = this.response;
        let isResponsed = false;
        currentResponse.forEach(elem => {
          if (elem.driverId._id == response.driverId._id) {
            isResponsed = true;
          }
        })
        if (!isResponsed) {
          currentResponse.push(response);
        }
        this.response = this.filterUniqueResponse(currentResponse);
      }
    })
  }



  goToMessage() {
    this.router.navigate(['/rider/messages']);
  }
}
