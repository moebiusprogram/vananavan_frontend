import { Component, OnInit, Input } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import * as moment from 'moment';

@Component({
  selector: 'app-driver-detail',
  templateUrl: './driver-detail.component.html',
  styleUrls: ['./driver-detail.component.css']
})
export class DriverDetailComponent implements OnInit {

  public environment = environment;
  public selectedDriver;
  public averageRating: number;
  public lat = 25.77427;
  public long = -80.19366;
  public coordinates = [{
    lat: 25.77427,
    long: -80.19366
  }, {
    lat: 20.77427,
    long: -72.19366
  }];
  public isSubmit = false;
  public message: string;
  public from: string;
  public displayCallText = 'Call Now';
  public yearOfexp = null;
  public polygonPoints = [];
  public routeTitle = '';
  constructor(
    private riderService: RiderService,
    private sharedChatService: SharedChatService,
    private authService: AuthenticationService,
    private router: Router
  ) { }

  ngOnInit() {
    this.riderService.getSelectedDriver().subscribe(data => {
      if (data) {
        this.selectedDriver = { ...data };
        this.displayCallText = 'Call Now';
        this.selectedDriver['avatar'] = this.selectedDriver.avatar ? environment.host + environment.imageBaseUrl + this.selectedDriver.avatar :
          this.selectedDriver.loginType == 1 ? this.selectedDriver.photoUrl : 'assets/images/Driver.svg'
        if (this.selectedDriver.driverDetails && this.selectedDriver.driverDetails.drivingFromYear) {

          this.yearOfexp = isNaN(this.selectedDriver.driverDetails.drivingFromYear) ? this.selectedDriver.driverDetails.drivingFromYear : this.selectedDriver.driverDetails.drivingFromYear > 1 ? this.selectedDriver.driverDetails.drivingFromYear + ' Years' : this.selectedDriver.driverDetails.drivingFromYear + ' Year';
        } else {
          this.yearOfexp = null;
        }
        if (this.selectedDriver.driverVehicles && this.selectedDriver.driverVehicles.cinPhoto) {
          this.selectedDriver.driverVehicles.cinPhoto = this.selectedDriver.driverVehicles.cinPhoto.filter(elem => {
            if (elem) {
              return elem;
            }
          });
        }
        this.averageRating = this.selectedDriver.averageRating;
        if (this.selectedDriver.driverRoutes.length > 0) {
          let coordinates = this.getRoutesCoordinates(this.selectedDriver.driverRoutes, this.selectedDriver.matchedRoute)
          this.polygonPoints = this.getPolygonPoints(coordinates)
          this.drawPolygon();
        }
      } else {
        this.selectedDriver = null
      }

    });
    this.authService.getUserInfo().subscribe(data => {
      if (data) {
        this.from = data._id;
      }
    });
  }

  private getRoutesCoordinates(routes, routesId) {
    let coordinates = [];
    routes.forEach(elem => {
      if (elem._id == routesId) {
        coordinates = elem.polygonPoints.coordinates[0];
        this.routeTitle = elem.title;
      }
    });
    return coordinates;
  }
  private getPolygonPoints(points) {
    let pointsArray = [];
    points.forEach(elem => {
      let latLng = {
        lat: elem[1],
        lng: elem[0]
      };
      pointsArray.push(latLng);
    });
    return pointsArray;
  }

  sendMessage() {
    this.isSubmit = true;
    this.message = this.message.trim();
    if (this.message === '' || !this.selectedDriver.driverDetails || this.selectedDriver.driverDetails.driverId == '') {
      return false;
    }
    const message = {
      from: this.from,
      to: this.selectedDriver.driverDetails.driverId,
      message: this.message,
      isMessageFromSchool: true
    }
    this.sharedChatService.sendMessage(message);
    this.message = ''
  }

  displayNumber() {
    const isMobileDevice = /Mobi/i.test(window.navigator.userAgent)
    if (isMobileDevice) {
      document.location.href = `tel:+${'+1'+ this.selectedDriver.mobile}`;
    } else {
      this.displayCallText = this.selectedDriver.mobile ? '+1 '+ this.selectedDriver.mobile : 'Call Now'
    }
  }
  isLogin() {
    if (!this.from) {
      this.goToLogin();
    }
  }

  private goToLogin() {
    this.router.navigate(['/auth/login'], { queryParams: { toNavigate: 'searched-ride' } });
  }

  private drawPolygon() {
    if (this.polygonPoints.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      this.polygonPoints.forEach(elem => {
        bounds.extend(elem);
      });
      let center = {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng()
      }
      var map = new google.maps.Map(document.getElementById('local'), {
        zoom: 5,
        streetViewControl: false,
        center: center,
        mapTypeId: 'terrain'
      });

      var polygon = new google.maps.Polygon({
        paths: this.polygonPoints,
        strokeColor: "#FF0000",
        strokeOpacity: 0.2,
        strokeWeight: 2,
        fillColor: "#ffff00",
        fillOpacity: 0.2,
        map: map,
        zIndex: 1
      });
      polygon.setMap(map)
      map.fitBounds(bounds);
    }
  }

}
