import { Component, OnInit, NgZone } from "@angular/core";
import { UsersService } from "src/app/core/services";
import { DriverService } from "src/app/core/http/driver-service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { settingConfig } from 'src/app/configs/settings.config';

@Component({
  selector: "app-driver-route",
  templateUrl: "./driver-route.component.html",
  styleUrls: ["./driver-route.component.css"],
})
export class DriverRouteComponent implements OnInit {
  public allRoute = [];
  public steps = [];
  public stops = [];
  public fromAddress: string;
  public toAddress: string;
  public routeName: string;
  public fromLatLong = {
    lat: null,
    lng: null,
  };
  public toLatLong = {
    lat: null,
    lng: null,
  };
  public profileDetail;
  public showToaster = false;
  public routeType = 1; // 1- booking route, 2- school route
  public selectedId;
  public polygonPoints = [];
  public title = "";
  public directionsService;
  public map;
  public markers = [];
  public settingConfig = settingConfig;
  constructor(
    public userService: UsersService,
    private driverSerice: DriverService,
    private route: Router,
    private TS: ToastrService,
    private driverservice: DriverService,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      if (params && params.routeType) {
        this.routeType = parseInt(params.routeType);
      }
    })
    this.directionsService = (<any>window).directionsService;
    this.driverservice.getDriverDetail().subscribe((data) => {
      this.profileDetail = data;
    });
    this.getAllRoute();
  }

  getAllRoute() {
    this.userService.getRoute({ type: this.routeType }).subscribe((data) => {
      this.allRoute = data.response;
      if (this.allRoute.length > 0) {
        this.selectedId = this.allRoute[0]._id;
        this.fromAddress = this.allRoute[0].fromAddress;
        this.toAddress = this.allRoute[0].toAddress;
        this.title = this.allRoute[0].title;
        if (this.fromLatLong.lat == null && this.fromLatLong.lng == null && this.routeType == 1) {
          let stops = this.allRoute[0].stops;
          this.fromLatLong.lat = stops[0].coordinates[0];
          this.fromLatLong.lng = stops[0].coordinates[1];
        }
        if (this.allRoute[0].type == 2) {
          if (
            this.allRoute[0].polygonPoints &&
            this.allRoute[0].polygonPoints.coordinates
          ) {
            this.polygonPoints = this.getPolygonPoints(
              this.allRoute[0].polygonPoints.coordinates[0]
            );
            setTimeout(() => {
            this.drawPolygon();
            },100)
          }
        }
        if (this.allRoute[0].type == 1) {
          // this.steps = this.allRoute[0].steps;
          this.stops = this.getStops(this.allRoute[0].stops);
          setTimeout(() => {
            this.showMap(this.allRoute[0], 1);
          }, 0);
        }
      } else {
        this.fromLatLong.lat = 41.850033;
        this.fromLatLong.lng = -87.6500523;
      }
    });
  }

  private drawMarker() {
    this.stops.forEach((elem, i) => {
      if (i == 0 || i == this.stops.length - 1) {
        this.drawStopageMarker(elem.coordinates);
      }
      else {
        this.drawStopageMarker(elem.coordinates, "green");
      }
    });
  }

  private getStops(points) {
    let stops = [];
    points.forEach(elem => {
      stops.push({ city: elem.city, coordinates: elem.coordinates });
    });
    return stops;
  }

  private getPolygonPoints(points) {
    let pointsArray = [];
    points.forEach((elem) => {
      let latLng = {
        lat: elem[1],
        lng: elem[0],
      };
      pointsArray.push(latLng);
    });
    return pointsArray;
  }

  initMap() {
    this.createMap();
    for (let i = 0; i < this.stops.length; i++) {
      if (i == 0) {
        this.getPath(this.stops[i].coordinates, this.stops[i + 1].coordinates, 0)
      }
      if (i > 0 && i < this.stops.length - 1) {
        this.getPath(this.stops[i].coordinates, this.stops[i + 1].coordinates, 0)
      }
    }
    this.setBounds();
  }

  private createMap() {
    this.map = new google.maps.Map(document.getElementById("local"), {
      zoom: 7,
      streetViewControl: false,
      mapTypeId: "terrain",
    });
  }

  private setBounds() {
    var bounds = new google.maps.LatLngBounds();
    this.stops.forEach((elem, i) => {
      if (i == 0) {
        bounds.extend({ lat: elem.coordinates[0], lng: elem.coordinates[1] });
      }
      if (i == this.stops.length - 1) {
        bounds.extend({ lat: elem.coordinates[0], lng: elem.coordinates[1] });
      }
    });
    this.map.fitBounds(bounds);
  }


  private getPath(fromPoints, toPoints, index) {
    let startPoint = { lat: fromPoints[0], lng: fromPoints[1] };
    let endPoint = { lat: toPoints[0], lng: toPoints[1] };
    var request = {
      origin: startPoint,
      destination: endPoint,
      travelMode: "DRIVING",
      provideRouteAlternatives: true,
    };
    this.directionsService.route(request, (result, status) => {
      if (status == "OK") {
        var bounds;
        var polycolour = "";
        result.routes.reverse().forEach((data, i) => {
          // if (i == index) {
          bounds = data.bounds;
          polycolour = "#0000ff";
          // } else {
          //   polycolour = "#999999";
          // }
          bounds = data.bounds;
          this.drawPolyline(data.overview_path, polycolour);
          // this.map.fitBounds(bounds);
          this.drawMarker();
        });
      }
    });
  }

  private drawPolyline(path, polycolour) {
    var flightPath = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: polycolour,
      strokeOpacity: 0.7,
      strokeWeight: 3,
    });

    flightPath.setMap(this.map);
  }

  private drawPolygon() {
    if (this.polygonPoints.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      this.polygonPoints.forEach((elem) => {
        bounds.extend(elem);
      });
      let center = {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng(),
      };
      var map = new google.maps.Map(document.getElementById("local"), {
        zoom: 8,
        streetViewControl: false,
        center: center,
        mapTypeId: "terrain",
      });

      var polygon = new google.maps.Polygon({
        paths: this.polygonPoints,
        strokeColor: "#FF0000",
        strokeOpacity: 0.2,
        strokeWeight: 2,
        fillColor: "#ffff00",
        fillOpacity: 0.2,
        map: map,
        zIndex: 1,
      });
      polygon.setMap(map);
      map.fitBounds(bounds);

      // map.fitBounds(circle.getBounds());
    }
  }

  showMap(value, type) {
    this.selectedId = value._id;
    if (value && type == 1) {
      this.fromAddress = value.fromAddress;
      this.toAddress = value.toAddress;
      this.routeName = value.title;
      let stops = value.stops;
      if (stops.length > 0) {
        this.fromLatLong.lat = stops[0].coordinates[0];
        this.fromLatLong.lng = stops[0].coordinates[1];
      }
      if (stops.length > 0) {
        this.toLatLong.lat = stops[stops.length - 1].coordinates[0];
        this.toLatLong.lng = stops[stops.length - 1].coordinates[1];
      }
      // this.steps = value.steps;
      this.stops = this.getStops(value.stops);
      this.initMap();
    }
    if (value && type == 2) {
      this.title = value.title;
      this.polygonPoints = this.getPolygonPoints(
        value.polygonPoints.coordinates[0]
      );
      this.drawPolygon();
    }
  }

  deleteRoute(id) {
    this.driverSerice.deleteDriverRoute({ routeId: id }).subscribe((data) => {
      if (data) {
        this.allRoute = this.allRoute.filter(
          (elem) => elem._id != data.routeId
        );
      }
    });
  }

  editRoute(route, type) {
    if (type == 1) {
      this.route.navigate(["/driver/add-driver-route"], {
        queryParams: {
          route: JSON.stringify(route),
        },
      });
    }
    if (type == 2) {
      this.route.navigate(["/driver/add-school-route"], {
        queryParams: {
          route: JSON.stringify(route),
        },
      });
    }
  }

  goToRoute(type) {
    this.showToasterMessage();
    if (this.showToaster) {
      return false;
    }
    if (type == 1) {
      this.route.navigate(["/driver/add-driver-route"]);
    }
    if (type == 2) {
      this.route.navigate(["/driver/add-school-route"]);
    }
  }

  private showToasterMessage() {
    this.checkNullField();
    if (this.showToaster) {
      this.TS.error(
        "Required. Please complete all profile and vehicle details before accepting trips.",
        "",
        {
          timeOut: 5000, // Hide manually
        }
      );
    }
  }

  private checkNullField() {
    let documentDetail = this.profileDetail.driverDetail;
    let basicDetail = this.profileDetail.driver;
    let vehicleDetail = this.profileDetail.driverVehicle;
    if (
      !documentDetail ||
      !documentDetail.profileDocumentPhoto ||
      documentDetail.profileDocumentPhoto.length == 0 ||
      !documentDetail.chauffeurLicenseNumber ||
      !documentDetail.licenseNumber ||
      !documentDetail.drivingFromYear ||
      !documentDetail.languages ||
      documentDetail.languages.length == 0
    ) {
      this.showToaster = true;
    } else if (
      !basicDetail ||
      !basicDetail.firstName ||
      !basicDetail.lastName ||
      !basicDetail.email ||
      !basicDetail.mobile ||
      !basicDetail.day ||
      !basicDetail.month ||
      !basicDetail.year
    ) {
      this.showToaster = true;
    } else if (
      !vehicleDetail ||
      !vehicleDetail.model ||
      vehicleDetail.model == "" ||
      !vehicleDetail.registrationNumber ||
      vehicleDetail.registrationNumber == "" ||
      !vehicleDetail.vin ||
      vehicleDetail.vin == "" ||
      !vehicleDetail.cin ||
      vehicleDetail.cin == "" ||
      vehicleDetail.vehicleDetailPhoto.length == 0
    ) {
      this.showToaster = true;
    } else {
      this.showToaster = false;
    }
  }

  private drawStopageMarker(coordinates, color?: string) {
    let iconUrl;
    if (color) {
      iconUrl = "http://maps.google.com/mapfiles/ms/icons/";
      iconUrl += color + "-dot.png";
    }

    let bounds = new google.maps.LatLngBounds();
    bounds.extend({
      lat: parseFloat(coordinates[0]),
      lng: parseFloat(coordinates[1])
    });
    var latLng = new google.maps.LatLng(
      parseFloat(coordinates[0]),
      parseFloat(coordinates[1]));
    var marker;
    if (iconUrl) {
      marker = new google.maps.Marker({
        position: latLng,
        map: this.map,
        icon: {
          url: iconUrl
        },
      });
      this.markers.push(marker);
    }
    if (!iconUrl) {
      marker = new google.maps.Marker({
        position: latLng,
        map: this.map
      });
      this.markers.push(marker);
    }
  }

  updateRoutetype(type) {
    if (type == 2) {
      this.routeName = "";
    }
    this.routeType = type;
    this.getAllRoute();
    // this.initMap();
  }
}
