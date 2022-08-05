import { Component, OnInit } from '@angular/core';
import { UsersService } from "src/app/core/services";
import { DriverService } from "src/app/core/http/driver-service";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { settingConfig } from 'src/app/configs/settings.config';

@Component({
  selector: 'app-driver-school-route',
  templateUrl: './driver-school-route.component.html',
  styleUrls: ['./driver-school-route.component.css']
})
export class DriverSchoolRouteComponent implements OnInit {
  public allRoute = [];
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
  public routeType = 2; // 1- booking route, 2- school route
  public selectedId;
  public polygonPoints = [];
  public title = "";
  public schoolName = "";
  public directionsService;
  public map;
  public settingConfig = settingConfig;
  public schoolPoints = {};
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
        this.schoolName = this.allRoute[0].driverSchoolId ?
          this.allRoute[0].driverSchoolId.schoolName : '';
        if (this.allRoute[0].type == 2) {
          if (
            this.allRoute[0].polygonPoints &&
            this.allRoute[0].polygonPoints.coordinates
          ) {
            this.polygonPoints = this.getPolygonPoints(
              this.allRoute[0].polygonPoints.coordinates[0]
            );
            setTimeout(() => {
              if (this.allRoute[0].driverSchoolId && this.allRoute[0].driverSchoolId.schoolCoordinates && this.allRoute[0].driverSchoolId.schoolCoordinates.coordinates) {
                this.schoolPoints = this.allRoute[0].driverSchoolId.schoolCoordinates.coordinates;
                this.drawPolygon();
                this.initMarker(this.allRoute[0].driverSchoolId.schoolCoordinates.coordinates);
              }
            }, 100)
          }
        }
      } else {
        this.fromLatLong.lat = 41.850033;
        this.fromLatLong.lng = -87.6500523;
      }
    });
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


  private drawPolygon() {
    if (this.polygonPoints.length > 0) {
      var bounds = new google.maps.LatLngBounds();
      this.polygonPoints.forEach((elem) => {
        bounds.extend(elem);
      });
      bounds.extend({
        lat: parseFloat(this.schoolPoints[0]),
        lng: parseFloat(this.schoolPoints[1])
      })
      let center = {
        lat: bounds.getCenter().lat(),
        lng: bounds.getCenter().lng(),
      };
      this.map = new google.maps.Map(document.getElementById("local"), {
        zoom: 8,
        streetViewControl: false,
        center: center,
        mapTypeId: "terrain",
        maxZoom: 15
      });

      var polygon = new google.maps.Polygon({
        paths: this.polygonPoints,
        strokeColor: "#FF0000",
        strokeOpacity: 0.2,
        strokeWeight: 2,
        fillColor: "#ffff00",
        fillOpacity: 0.2,
        map: this.map,
        zIndex: 1,
      });
      polygon.setMap(this.map);
      this.map.fitBounds(bounds);

      // map.fitBounds(circle.getBounds());
    }
  }

  showMap(value, type) {
    this.selectedId = value._id;
    if (value && type == 2) {
      this.title = value.title;
      this.schoolName = value.driverSchoolId ?
        value.driverSchoolId.schoolName : '';
      this.polygonPoints = this.getPolygonPoints(
        value.polygonPoints.coordinates[0]
      );
      if (value.driverSchoolId && value.driverSchoolId.schoolCoordinates && value.driverSchoolId.schoolCoordinates.coordinates) {
        this.schoolPoints = this.allRoute[0].driverSchoolId.schoolCoordinates.coordinates;
        this.drawPolygon();
        this.initMarker(value.driverSchoolId.schoolCoordinates.coordinates);
      }
    }
  }

  private initMarker(coordinates) {
    let bounds = new google.maps.LatLngBounds();
    let markers = [];
    bounds.extend({
      lat: parseFloat(coordinates[0]),
      lng: parseFloat(coordinates[1])
    });
    var latLng = new google.maps.LatLng(
      parseFloat(coordinates[0]),
      parseFloat(coordinates[1]));
    var marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
    });
    markers.push(marker);
    // this.map.setZoom(8);
    // this.map.fitBounds(bounds);
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

  updateRoutetype(type) {
    if (type == 2) {
      this.routeName = "";
    }
    this.routeType = type;
    this.getAllRoute();
  }
}
