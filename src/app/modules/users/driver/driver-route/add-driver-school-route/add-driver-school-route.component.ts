import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { UsersService } from "src/app/core/services";
import { Subject } from "rxjs";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from "@angular/router";
import { SharedService } from "src/app/core/http/shared-service";

@Component({
  selector: 'app-add-driver-school-route',
  templateUrl: './add-driver-school-route.component.html',
  styleUrls: ['./add-driver-school-route.component.css']
})
export class AddDriverSchoolRouteComponent implements OnInit {

  public currentLatLng: any = {
    lat: 27.994402,
    lng: -81.760254
  };
  public routeForm: FormGroup;
  public directionsService;
  public directionsRenderer;
  public map;
  public centerPoints: any = {
    lat: 27.994402,
    lng: -81.760254
  };
  public polygonPoints = [];
  public editPolygonPoints = [];
  public isSubmit = false;
  public isEdit = false;
  public isPolygon = false;
  public routeId = '';
  constructor(
    private activatedRoute: ActivatedRoute,
    private userServise: UsersService,
    private TS: ToastrService,
    private router: Router,
    private zone: NgZone,
  ) {
  }

  ngOnInit() {
    this.initForms();
    this.getCurrentLocation();
    this.initMap();
    this.activatedRoute.queryParams.subscribe(selectedRoute => {
      if (selectedRoute && selectedRoute.route) {
        this.isEdit = true;
        let route = JSON.parse(selectedRoute.route);
        this.routeId = route._id;
        this.routeForm.patchValue({
          title: route.title,
          schoolName: route.driverSchoolId ? route.driverSchoolId.schoolName : ''
        });
        this.polygonPoints = route.polygonPoints.coordinates;
        this.centerPoints.lat = route.driverSchoolId ? route.driverSchoolId.schoolCoordinates.coordinates[0] : null;
        this.centerPoints.lng = route.driverSchoolId ? route.driverSchoolId.schoolCoordinates.coordinates[1] : null;
        this.isPolygon = true;
        this.editPolygonPoints = this.getPolygonPoints(route.polygonPoints.coordinates[0])
        this.drawEditPolygon();
        this.initMarker();
      }
    })
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

  private initForms() {
    this.routeForm = new FormGroup({
      schoolName: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required)
    });
  }

  private getCurrentLocation() {
    let location = JSON.parse(sessionStorage.getItem("CURRENT_LOCATION"));
    if (location) {
      this.currentLatLng["lat"] = location.latitude;
      this.currentLatLng["lng"] = location.longitude;
    }
  }

  initMap(zoom?: number) {
    this.directionsRenderer = (<any>window).directionsRenderer;
    this.directionsService = (<any>window).directionsService;

    let currentPoints;
    if (this.currentLatLng.lng && this.currentLatLng) {
      currentPoints = new google.maps.LatLng(
        this.currentLatLng.lat,
        this.currentLatLng.lng
      );
    } else {
      currentPoints = new google.maps.LatLng(this.currentLatLng.lat, this.currentLatLng.lng);
    }

    var mapOptions = {
      zoom: 10,
      // maxZoom: 10,
      streetViewControl: false,
      center: currentPoints,
    };

    if (zoom) {
      mapOptions['maxZoom'] = zoom;
    }

    this.map = new google.maps.Map(
      document.getElementById("local"),
      mapOptions
    );
    this.directionsRenderer.setMap(this.map);
    this.setPolygonProperty();
  }

  selectAddress(event) {
    if (!event || !event.lat || !event.long) {
      return false;
    }
    this.zone.run(() => {
      this.routeForm.get('schoolName').setValue(event.formatted_address)
      this.centerPoints.lat = event.lat;
      this.centerPoints.lng = event.long;
      this.initMap(15);
      this.initMarker();
    });
  }

  private initMarker() {
    let bounds = new google.maps.LatLngBounds();
    let markers = [];
    bounds.extend({
      lat: parseFloat(this.centerPoints.lat),
      lng: parseFloat(this.centerPoints.lng)
    });
    var latLng = new google.maps.LatLng(
      parseFloat(this.centerPoints.lat),
      parseFloat(this.centerPoints.lng));
    var marker = new google.maps.Marker({
      position: latLng,
      map: this.map,
    });
    markers.push(marker);
    // this.map.setZoom(10);
    this.map.fitBounds(bounds);
  }

  private setPolygonProperty() {
    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
      polygonOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1,
      }
    });
    drawingManager.setMap(this.map);

    var that = this;
    google.maps.event.addListener(drawingManager, 'polygoncomplete', (polygon) => {
      if (polygon) {
        this.isPolygon = true;
        let pointsArray = polygon.getPath().getArray();
        that.setPolygonPoints(pointsArray);

        drawingManager.setOptions({
          drawingControl: true,
          drawingMode: null
        });
        polygon.getPaths().forEach(function (path, index) {
          google.maps.event.addListener(path, 'insert_at', function () {
            let pointsArray = path.getArray();
            that.polygonPoints = [];
            that.setPolygonPoints(pointsArray);
          });
        });


        google.maps.event.addListener(polygon, 'dragend', function () {
          let length = that.polygonPoints.length;
          let pointsArray = polygon.getPath().getArray();
          that.setPolygonPoints(pointsArray);
          that.polygonPoints = that.polygonPoints.splice(0, length);
        });

        polygon.getPaths().forEach(function (path, index) {
          google.maps.event.addListener(polygon, 'set_at', function () {
            let pointsArray = polygon.getPath().getArray()
            that.polygonPoints = [];
            that.setPolygonPoints(pointsArray);
          });
        })

      }
    });
  }

  setPolygonPoints(pointsArray) {
    pointsArray.forEach(points => {
      let latLng = {
        lat: points.lat(),
        lng: points.lng()
      };
      this.polygonPoints.push(latLng);
    });
  }

  saveRoute() {
    this.isSubmit = true;
    if (!this.isPolygon || this.routeForm.invalid) {
      return false
    }
    let points = [];
    this.polygonPoints.forEach(point => {
      points.push([parseFloat(point.lng), parseFloat(point.lat)]);
    });
    points.push([
      parseFloat(this.polygonPoints[0].lng),
      parseFloat(this.polygonPoints[0].lat)])
    // let isValidSchool = this.checkSchoolWithinPolygon(points);
    // if (!isValidSchool) {
    //   return false;
    // }
    let route = {
      polygonPoints: JSON.stringify(points),
      type: 2,
      title: this.routeForm.get('title').value,
      isEdit: this.isEdit,
      routeId: this.routeId,
      schoolName: this.routeForm.get('schoolName').value,
      schoolCoordinates: JSON.stringify([
        parseFloat(this.centerPoints.lat).toFixed(3),
        parseFloat(this.centerPoints.lng).toFixed(3)])
    }
    this.userServise.saveSchoolRoute(route).subscribe((data) => {
      this.TS.success("Add route successful");
      this.navigateONRoute();
    });
  }

  checkSchoolWithinPolygon(polygonPoints) {
    let formatedPoints = polygonPoints.map(elem => {
      return { lat: elem[0], lng: elem[1] }
    })
    let coordinates = new google.maps.LatLng(
      this.centerPoints.lng,
      this.centerPoints.lat
    );
    let polyPoints = new google.maps.Polygon({ paths: formatedPoints });
    let isValidSchoolPoints = google.maps.geometry.poly.containsLocation(coordinates, polyPoints);
    if (!isValidSchoolPoints) {
      this.TS.error("Please select school within polygon");
    }
    return isValidSchoolPoints;
  }

  private validatePolygonPoints(points) {
    let isValid = true;
    for (let i = 0; i < points.length; i++) {
      for (let j = 0; j < points.length; j++) {
        if (i != j) {
          if (points[i].lat == points[j].lat) {
            isValid = false;
          }
          if (points[i].lng == points[j].lng) {
            isValid = false;
          }
        }
      }
    }
    if (points.length <= 2) {
      isValid = false;
    }
    return isValid;
  }


  private drawEditPolygon() {
    var bounds = new google.maps.LatLngBounds();
    this.editPolygonPoints.forEach(elem => {
      bounds.extend(elem);
    });
    let center = {
      lat: bounds.getCenter().lat(),
      lng: bounds.getCenter().lng()
    }
    this.map = new google.maps.Map(document.getElementById('local'), {

      zoom: 8,
      maxZoom: 15,
      streetViewControl: false,

      center: center,

      mapTypeId: 'terrain'
    });

    var polygon = new google.maps.Polygon({
      paths: this.editPolygonPoints,
      strokeColor: "#FF0000",
      strokeOpacity: 0.2,
      strokeWeight: 2,
      fillColor: "#ffff00",
      fillOpacity: 0.2,
      map: this.map,
      editable: true,
      draggable: true,
      zIndex: 1
    });

    polygon.setMap(this.map);
    this.map.fitBounds(bounds);

    this.getEditPolygon(polygon);
  }

  getEditPolygon(polygon) {
    let that = this;
    google.maps.event.addListener(polygon.getPath(), 'insert_at', function (index, obj) {
      let pointsArray = polygon.getPath().getArray();
      that.polygonPoints = [];
      that.setPolygonPoints(pointsArray);
    });
    google.maps.event.addListener(polygon.getPath(), 'set_at', function (index, obj) {
      let pointsArray = polygon.getPath().getArray();
      that.polygonPoints = [];
      that.setPolygonPoints(pointsArray);
    });
  }

  navigateONRoute() {
    this.router.navigate(["/driver/school-route"], { queryParams: { routeType: 2 } });
  }

  cancelRoute() {
    this.routeForm.reset()
    let drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [google.maps.drawing.OverlayType.POLYGON]
      },
      markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
      polygonOptions: {
        fillColor: '#ffff00',
        fillOpacity: 0.2,
        strokeWeight: 2,
        clickable: true,
        editable: true,
        draggable: true,
        zIndex: 1
      }
    });
    drawingManager.setMap(this.map);
    this.polygonPoints = [];
    this.isPolygon = false;
    this.initMap()
  }

}
