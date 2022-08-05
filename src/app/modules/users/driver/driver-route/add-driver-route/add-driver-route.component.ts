import { Component, OnInit, NgZone } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UsersService } from "src/app/core/services";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { SharedService } from "src/app/core/http/shared-service";
import { DriverService } from "src/app/core/http/driver-service";
import { settingConfig } from 'src/app/configs/settings.config';

@Component({
  selector: "app-add-driver-route",
  templateUrl: "./add-driver-route.component.html",
  styleUrls: ["./add-driver-route.component.css"],
})
export class AddDriverRouteComponent implements OnInit {
  public data: any;
  public addRouteForm: FormGroup;
  public isRoute = false;
  public toEditRoute = null;
  public polylines = [];
  public fromLatLong: any = {
    lat: 27.994402,
    lng: -81.760254,
  };
  public toLatLong = {
    lat: null,
    lng: null,
  };
  public addr;
  public from = {
    type: "Point",
    coordinates: [],
  };

  public to = {
    type: "Point",
    coordinates: [],
  };
  public fromAddress: string;
  public toAddress: string;
  public isEdit = false;
  public editRouteId = "";
  public showSavedSummary = false;
  public stops = [];
  public markers = [];
  public settingConfig = settingConfig;
  public routePoints = [];
  constructor(
    private fb: FormBuilder,
    private zone: NgZone,
    private userServise: UsersService,
    private TS: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getCurrentLocation();
    this.initMap();
    this.initForm();
    this.activatedRoute.queryParams.subscribe((selectedRoute) => {
      this.toEditRoute = null;
      this.editRouteId = "";
      if (selectedRoute.route) {
        this.isEdit = true;
        this.showSavedSummary = true;
        this.toEditRoute = JSON.parse(selectedRoute.route);
        this.editRouteId = this.toEditRoute._id;
        this.from = this.toEditRoute.from;
        this.to = this.toEditRoute.to;
        this.steps = this.toEditRoute.steps;
        this.fromAddress = this.toEditRoute.fromAddress;
        this.toAddress = this.toEditRoute.toAddress;
        this.setRoutes(this.toEditRoute.stops);
        this.addRouteForm.setValue({
          tripType: JSON.stringify(this.toEditRoute.tripType),
          locationName: this.toEditRoute.title,
          searchStops: ''
        });
      }
    });
    this.getResult();
  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem("CURRENT_LOCATION"));
    if (location) {
      this.fromLatLong["lat"] = location.latitude
      this.fromLatLong["lng"] = location.longitude
    }
  }

  private setRoutes(stops) {
    stops.forEach(elem => {
      this.stops.push({ city: elem.city, coordinates: elem.coordinates });
      this.routePoints.push({ lat: elem.coordinates[0], lng: elem.coordinates[1] });
    });
    this.initMap();
    this.drawMarkersAndLines();
  }

  addRouteControl() {
    this.addRouteForm = this.fb.group({
      tripType: ["1", Validators.required],
      locationName: ["", Validators.required],
      searchStops: [""]
    });
  }

  get addRouteCon() {
    return this.addRouteForm.controls;
  }

  private initForm() {
    this.addRouteControl();
  }

  public directionsService;
  public directionsRenderer;
  public map;
  initMap() {
    this.directionsRenderer = (<any>window).directionsRenderer;
    this.directionsService = (<any>window).directionsService;
    if (this.fromLatLong.lng && this.fromLatLong) {
      var centerPoint = new google.maps.LatLng(
        this.fromLatLong.lat,
        this.fromLatLong.lng
      );
    } else {
      var centerPoint = new google.maps.LatLng(this.fromLatLong["lat"], this.fromLatLong["lng"]);
    }
    var mapOptions = {
      zoom: 7,
      streetViewControl: false,
      center: centerPoint,
    };

    this.map = new google.maps.Map(
      document.getElementById("local"),
      mapOptions
    );
    this.directionsRenderer.setMap(this.map);
  }

  calcRoute(fromLatLong, toLatLong, index) {
    setTimeout(() => {
      var request = {
        origin: fromLatLong,
        destination: toLatLong,
        travelMode: "DRIVING",
        provideRouteAlternatives: true,
      };
      this.directionsService.route(request, (result, status) => {
        // for (var j in this.polylines) {
        //   this.polylines[j].setMap(null);
        // }
        this.polylines = [];
        if (status == "OK") {
          this.data = result;
          this.userServise.changeUsername(result);
          var polycolour = "";
          var bounds;
          result.routes.reverse().forEach((data, i) => {
            // if (i == index) {
            bounds = data.bounds;
            polycolour = "#0000ff";
            // } else {
            //   polycolour = "#999999";
            // }
            var line = this.drawPolyline(data.overview_path, polycolour);
            this.polylines.push(line);
            // this.map.fitBounds(bounds);
          });
        } else {
          window.alert("Directions request failed due to " + status);
        }
      });
    }, 100)
  }

  drawPolyline(path, color) {
    var line = new google.maps.Polyline({
      path: path,
      strokeColor: color,
      strokeOpacity: 0.7,
      strokeWeight: 3,
    });
    line.setMap(this.map);
    return line;
  }

  public points = [];
  public steps = [];
  public selected: number;

  getResult() {
    this.userServise.username.subscribe((result) => {
      this.data = result; // this set's the username to the default observable value
    });
  }

  saveLanLongAndSteps() {
    if (this.addRouteForm.invalid) {
      this.isRoute = true;
      return false;
    }
    let stops = this.setStopsFromTo();
    const data = {
      from: this.from,
      to: this.to,
      steps: this.steps,
      fromAddress: this.stops[0].city,
      toAddress: this.stops[this.stops.length - 1].city,
      tripType: this.addRouteForm.get('tripType').value,
      title: this.addRouteForm.value.locationName,
      isEdit: this.isEdit,
      routeId: this.editRouteId,
      stops,
      type: 1,
    };
    this.userServise.saveLantLongAndStep(data).subscribe((data) => {
      this.steps = [];
      this.addRouteForm.controls.locationName.setValue(null);
      this.userServise.changeUsername("");
      this.isRoute = false;
      this.TS.success(" Add route successful");
      this.navigateONRoute();
    });
  }

  private setStopsFromTo() {
    let stops = [];
    this.stops.forEach((elem, i) => {
      let stopObject = new Object();
      stopObject['city'] = elem.city;
      stopObject['coordinates'] = elem.coordinates;
      stopObject['subStopPoint'] = [];
      if (i < this.stops.length - 1) {
        this.stops.forEach((elem, j) => {
          if (i < j) {
            let subPoint = {};
            subPoint['city'] = elem.city;
            subPoint['coordinates'] = elem.coordinates;
            stopObject['subStopPoint'].push(subPoint);
          }
        });
      }
      stops.push(stopObject);
    });
    return stops;
  }

  setPoints(event) {
    let lat = parseFloat((event.lat).toFixed(3));
    let long = parseFloat((event.long).toFixed(3));
    let stop = { coordinates: [lat, long], city: event.formatted_address }
    let isRouteValid = this.checkStop(stop);
    if (!isRouteValid) {
      this.zone.run(() => {
        this.addRouteForm.get('searchStops').setErrors({ invalid: true });
        return false;
      })
    }
    if (isRouteValid) {
      this.zone.run(() => {
        this.stops.push(stop);
        this.routePoints.push({ lat, lng: long });
        this.initMap();
        this.drawMarkersAndLines();
        this.addRouteForm.get("searchStops").clearValidators();
        this.addRouteForm.get("searchStops").reset();
      });
    }
  }

  private drawMarkersAndLines() {
    for (let i = 0; i < this.polylines.length; i++) {
      this.polylines[i].setMap(null);
      this.polylines.splice(i, 1);
    }
    if (this.routePoints.length >= 2) {
      for (let i = 0; i < this.routePoints.length; i++) {
        if (i == 0) {
          this.calcRoute(this.routePoints[i], this.routePoints[i + 1], 0)
        }
        if (i > 0 && i < this.routePoints.length - 1) {
          this.calcRoute(this.routePoints[i], this.routePoints[i + 1], 0)
        }
      }
    }
    this.deleteAllMarker();
    for (let i = 0; i < this.routePoints.length; i++) {
      if (i == 0) {
        this.drawStopageMarker(this.routePoints[i]);
      }
      if (i == this.routePoints.length - 1) {
        this.drawStopageMarker(this.routePoints[i]);
      }
      if (i != 0 && i != this.routePoints.length - 1) {
        this.drawStopageMarker(this.routePoints[i], "green");
      }
    }
    this.setBounds();
  }

  private setBounds() {
    var bounds = new google.maps.LatLngBounds();
    this.routePoints.forEach((elem, i) => {
      if (i == 0) {
        bounds.extend(elem);
      }
      if (i == this.routePoints.length - 1) {
        bounds.extend(elem);
      }
    });
    this.map.fitBounds(bounds);
  }

  private drawStopageMarker(coordinates, color?: string) {
    setTimeout(() => {
      let iconUrl;
      if (color) {
        iconUrl = "http://maps.google.com/mapfiles/ms/icons/";
        iconUrl += color + "-dot.png";
      }
      var latLng = new google.maps.LatLng(
        parseFloat(coordinates.lat),
        parseFloat(coordinates.lng)
      );
      var marker;
      if (iconUrl) {
        marker = new google.maps.Marker({
          position: latLng,
          map: this.map,
          icon: {
            url: iconUrl,
          },
        });
        this.markers.push(marker);
      }
      if (!iconUrl) {
        marker = new google.maps.Marker({
          position: latLng,
          map: this.map,
        });
        this.markers.push(marker);
      }
    }, 100)
  }

  private checkStop(stop) {
    let isValid = true;
    this.stops.forEach(elem => {
      if (elem && elem.coordinates[0] == stop.coordinates[0] &&
        elem.coordinates[1] == stop.coordinates[1]) {
        isValid = false;
      }
    });
    return isValid;
  }

  deleteStop(index) {
    this.zone.run(() => {
      this.routePoints.splice(index, 1);
      this.stops.splice(index, 1);
      this.markers[index].setMap(null);
      this.markers.splice(index, 1);
      this.initMap();
      this.drawMarkersAndLines();
    })
  }

  private deleteAllMarker() {
    for (let i = 0; i < this.markers.length; i++) {
      if (this.markers[i]) {
        this.markers[i].setMap(null);
        this.markers.splice(i, 1);
      }
    }
  }

  navigateONRoute() {
    this.router.navigate(["/driver/booking-route"]);
  }
}
