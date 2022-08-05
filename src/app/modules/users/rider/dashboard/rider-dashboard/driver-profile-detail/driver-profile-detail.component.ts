import { Component, OnInit, NgZone } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { SharedService } from 'src/app/core/http/shared-service';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-driver-profile-detail',
  templateUrl: './driver-profile-detail.component.html',
  styleUrls: ['./driver-profile-detail.component.css']
})
export class DriverProfileDetailComponent implements OnInit {

  public driver = null;
  public driverDetails;
  public vehicleDetail = null;
  public languages = [];
  public driverRoutes = [];
  public allRating = [];
  public reviewCount = 0;
  public averageRating = 0;
  public environment = environment;
  public displayCallText = 'Call Now';
  public liscencePhoto = [];
  public vehiclePhoto = [];
  public cinPhoto = [];
  public schoolRoutes = [];
  public eventRoutes = [];
  public isDriverSelected = false;
  public directionsService;
  public polygonPoints = [];
  public yearOfexp = null;
  constructor(
    private riderService: RiderService,
    public activeRoute: ActivatedRoute,
    public zone: NgZone
  ) { }

  ngOnInit() {
    this.directionsService = (<any>window).directionsService;
    this.activeRoute.queryParams.subscribe(route => {
      if (route && route.driverId) {
        let driverId = route.driverId;
        this.riderService.getDriverDetail({ driverId }).subscribe(data => {
          this.driver = data.driver;
          this.isDriverSelected = true;
          this.driverDetails = data.driver.driverDetails.length > 0 ? data.driver.driverDetails[0] : null;
          this.vehicleDetail = data.driver.vehicleDetail.length > 0 ? data.driver.vehicleDetail[0] : null;
          this.languages = data.driver.languages;
          this.allRating = data.driver.allUsersReview;
          this.reviewCount = data.reviewCount;
          this.driverRoutes = data.driver.driverRoutes;

          if (this.driver.driverDetails[0] && this.driver.driverDetails[0].drivingFromYear) {
            this.yearOfexp = isNaN(this.driver.driverDetails[0].drivingFromYear) ? this.driver.driverDetails[0].drivingFromYear : this.driver.driverDetails[0].drivingFromYear > 1 ? this.driver.driverDetails[0].drivingFromYear + ' Years' : this.driver.driverDetails[0].drivingFromYear + ' Year';
          } else {
            this.yearOfexp = null;
          }

          this.averageRating = data.avgRating ? data.avgRating.average : 0;
          this.extractPhoto(this.driverDetails.driverLiscense,
            this.driverDetails.profileDocumentPhoto);
          this.extractDriverRoutes(this.driverRoutes);
          this.initMap();
        });
      } else {
        this.isDriverSelected = false;
      }
    })
  }

  private extractPhoto(driverLiscence, chaufeurLiscence) {
    let images = []
    chaufeurLiscence.forEach(elem => {
      if (elem && elem.document) {
        images.push(elem.document);
      }
    });
    this.liscencePhoto = _.chunk(images, 3);
    let vehiclePhoto = this.vehicleDetail.vehicleDetailPhoto ?
      this.vehicleDetail.vehicleDetailPhoto.map(elem => {
        if (elem) {
          return elem.document
        }
      }) : [];
    vehiclePhoto = vehiclePhoto.filter(elem => elem != null);
    this.vehiclePhoto = _.chunk(vehiclePhoto, 3);
    let cinPhoto = this.vehicleDetail.cinPhoto ?
      this.vehicleDetail.cinPhoto.map(elem => {
        if (elem) {
          return elem.document;
        }
      }) : [];
    cinPhoto = cinPhoto.filter(elem => elem != null);
    this.cinPhoto = _.chunk(cinPhoto, 3);
  }

  private initMap() {
    this.initSchoolMap();
    this.initEventMap();
  }



  private initSchoolMap() {
    this.schoolRoutes.forEach((elem, index) => {

      setTimeout(() => {
        this.polygonPoints = this.getPolygonPoints(elem.polygonPoints.coordinates[0])
        if (this.polygonPoints.length > 0) {
          var bounds = new google.maps.LatLngBounds();
          this.polygonPoints.forEach(elem => {
            bounds.extend(elem);
          });
          let center = {
            lat: bounds.getCenter().lat(),
            lng: bounds.getCenter().lng()
          }
          let element = document.getElementById('schoolRoutes' + index);
          var map = new google.maps.Map(element, {
            zoom: 5,
            streetViewControl: false,
            center: center,
            mapTypeId: 'terrain'
          });
          this.drawPolygon(map);
        }
      }, 1000)
    });
  }

  private getPath(fromLatLong, toLatLong, map) {
    if (fromLatLong[0] && fromLatLong[1] && toLatLong[0] && toLatLong[1]) {
      let startPoint = { lat: fromLatLong[0], lng: fromLatLong[1] };
      let endPoint = { lat: toLatLong[0], lng: toLatLong[1] };
      var request = {
        origin: startPoint,
        destination: endPoint,
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
      };
      this.directionsService.route(request, (result, status) => {
        if (status == "OK") {
          var bounds;
          result.routes.reverse().forEach((data, i) => {
            bounds = data.bounds;

            var flightPath = new google.maps.Polyline({
              path: data.overview_path,
              geodesic: true,
              strokeColor: "Blue",
              strokeOpacity: 0.7,
              strokeWeight: 3,
            });

            flightPath.setMap(map);
            map.fitBounds(bounds);
          });
        }
      });
    }
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

  private drawPolygon(map) {
    var bounds = new google.maps.LatLngBounds();
    this.polygonPoints.forEach(elem => {
      bounds.extend(elem);
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

  private initEventMap() {
    this.eventRoutes.forEach((route, index) => {
      let stops = this.getPointsFromRoute(route.stops);
      setTimeout(() => {
        let eventMap = this.createMap(index);
        for (let i = 0; i < stops.length; i++) {
          if (i == 0) {
            this.getPath(stops[i].coordinates, stops[i + 1].coordinates, eventMap);
          }
          if (i > 0 && i < stops.length - 1) {
            this.getPath(stops[i].coordinates, stops[i + 1].coordinates, eventMap);
          }
        }

        for (let i = 0; i < stops.length; i++) {
          if (i == 0) {
            this.drawStopageMarker({ lat: stops[i].coordinates[0], lng: stops[i].coordinates[1] }, eventMap);
          }
          if (i == stops.length - 1) {
            this.drawStopageMarker({ lat: stops[i].coordinates[0], lng: stops[i].coordinates[1] }, eventMap);
          }
          if (i != 0 && i != stops.length - 1) {
            this.drawStopageMarker({ lat: stops[i].coordinates[0], lng: stops[i].coordinates[1] }, eventMap, "green");
          }
        }

        this.setBounds(stops, eventMap);
      }, 1000)

    });
  }

  private drawStopageMarker(coordinates, map, color?: string) {
    let iconUrl;
    if (color) {
      iconUrl = "http://maps.google.com/mapfiles/ms/icons/";
      iconUrl += color + "-dot.png";
    }
    var latLng = new google.maps.LatLng(
      parseFloat(coordinates.lat),
      parseFloat(coordinates.lng));
    var marker;
    let markers = [];
    if (iconUrl) {
      marker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: {
          url: iconUrl
        },
      });
      markers.push(marker);
    }
    if (!iconUrl) {
      marker = new google.maps.Marker({
        position: latLng,
        map: map
      });
      markers.push(marker);
    }
  }

  private createMap(index) {
    var map = new google.maps.Map(document.getElementById("eventMap" + index), {
      zoom: 7,
      streetViewControl: false,
      mapTypeId: "terrain",
    });
    return map;
  }

  private setBounds(stops, map) {
    var bounds = new google.maps.LatLngBounds();
    stops.forEach((elem, i) => {
      if (i == 0) {
        bounds.extend({ lat: elem.coordinates[0], lng: elem.coordinates[1] });
      }
      if (i == stops.length - 1) {
        bounds.extend({ lat: elem.coordinates[0], lng: elem.coordinates[1] });
      }
    });
    map.fitBounds(bounds);
  }
  private getPointsFromRoute(points) {
    let stops = [];
    points.forEach(elem => {
      stops.push({ city: elem.city, coordinates: elem.coordinates });
    });
    return stops;
  }
  private extractDriverRoutes(driverRoutes) {
    driverRoutes.forEach(elem => {
      if (elem && elem.type == 1) {
        this.eventRoutes.push(elem);
      }
      if (elem && elem.type == 2) {
        this.schoolRoutes.push(elem);
      }
    });
  }

  displayNumber() {
    this.displayCallText = this.driver.mobile ? this.driver.mobile : 'Call Now'
  }

}
