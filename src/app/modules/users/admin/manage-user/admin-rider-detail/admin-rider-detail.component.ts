import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from 'src/app/core/http/admin-service';
import { User } from 'src/app/shared/models/user';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-admin-rider-detail',
  templateUrl: './admin-rider-detail.component.html',
  styleUrls: ['./admin-rider-detail.component.css']
})
export class AdminRiderDetailComponent implements OnInit {

  public environment = environment;
  public rider: User;
  public previousTrips = [];
  public upcomingTrips = [];
  constructor(
    private activeRoute: ActivatedRoute,
    private adminService: AdminService
  ) { }

  ngOnInit() {
        this.activeRoute.queryParams.subscribe(params => {
      if (params.riderId && params.riderId != '') {
        this.adminService.getRiderDetail({ riderId: params.riderId }).subscribe(data => {
          this.rider = data.rider;
          if (this.rider.avatar) {
            this.rider.avatar = `${environment.host}${environment.imageBaseUrl}${this.rider.avatar}`;
          }
          if (!this.rider.avatar) {
            this.rider.avatar = null
          }
          this.previousTrips = data.trips.previousTrips;
          this.upcomingTrips = data.trips.upcomingTrips;
        });
      }
    })
  }

}
