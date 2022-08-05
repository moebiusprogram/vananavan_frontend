import { Component, OnInit, Input } from '@angular/core';
import { RiderBookings } from 'src/app/shared/models/rider.bookings';
import { RiderService } from 'src/app/core/http/rider-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bookings-detail',
  templateUrl: './bookings-detail.component.html',
  styleUrls: ['./bookings-detail.component.css']
})
export class BookingsDetailComponent implements OnInit {
  public environment = environment;
  public starsCount= 0.0;
  public lat = 24.799448;
  public long = 120.979021;
  // public origin = { lat: 24.799448, lng: 120.979021 };
  // public destination = { lat: 24.799524, lng: 120.975017 };
  public coordinates = [{
    lat: 24.799448,
    long: 120.979021
  }, {
    lat: 28.5355,
    long: 77.3910
    }];
  public steps = [];
  public booking: RiderBookings;
  public type = 1;  // 1-current, 2-past
  public review: string;
  public rating: number;
  public map;
  constructor(
    private riderService: RiderService
  ) { }

  ngOnInit() {
    this.initBooking();
    // this.getCurrentLocation();
  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem('CURRENT_LOCATION'));
    if (location) {
      this.lat = location.latitude;
      this.long = location.longitude;
    }
  }

  private initBooking() {
    this.riderService.selectedBooking.subscribe((data: any) => {
      if (data) {
        if (data.booking != undefined || data.booking != null) {
          this.booking = data.booking;
          this.type = data.type;
          this.coordinates[0].lat = this.booking.from.coordinates[0];
          this.coordinates[0].long = this.booking.from.coordinates[1];
          this.coordinates[1].lat = this.booking.to.coordinates[0];
          this.coordinates[1].long = this.booking.to.coordinates[1];
          this.lat = this.coordinates[0].lat;
    this.long = this.coordinates[0].long;
          this.steps = this.booking.driverRoutes.length > 0 ? this.booking.driverRoutes[0].steps : []
          this.initMap();
        }
        if (data.booking == undefined || data.booking == null) {
          this.booking = null;
          this.type = data.type;
        }
      }
      // this.initMap(); // for later use to showing route 
    });
  }

  private initMap() {
    this.map = new google.maps.Map(document.getElementById("booking-map1"), {
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

  // private initMap() {
  //   let map = new google.maps.Map(document.getElementById('local'), {
  //     zoom: 7,
  //     center: { lat: this.coordinates[0].lat, lng: this.coordinates[0].long },
  //     mapTypeId: 'terrain'
  //   });
  //   let flightPath = new google.maps.Polyline({
  //     path: this.steps,
  //     geodesic: true,
  //     strokeColor: 'Blue',
  //     strokeOpacity: 0.7,
  //     strokeWeight: 3
  //   });
  //   flightPath.setMap(map);
  // }

  postRating() {
    this.riderService.postDriverRating({ rating: this.starsCount, review: this.review, bookingId: this.booking._id }).subscribe(data => {
      if (data.isRating) {
        this.booking.isRating = data.isRating;
        this.starsCount = 0;
        this.review = '';
        this.riderService.afterReviewBooking.next(data);
      }
    })
  }

}
