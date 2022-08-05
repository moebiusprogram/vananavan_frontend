import { Component, OnInit } from '@angular/core';
import { UsersService } from 'src/app/core/services';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.css']
})
export class DriverDashboardComponent implements OnInit {
  public environment = environment;
  public dashBoardData = {
    trips: null,
    rating: null
  };
  public reviewCount;
  constructor(
    private userService: UsersService
  ) { }

  ngOnInit() {
    this.dashBoard()
  }

  public upComigTrips = []
  public priviousTrips = []
  public reviewAndRating = []
  
  dashBoard() {
    this.userService.getDashBoardData().subscribe(data => {
      this.dashBoardData = data.response;
      this.upComigTrips  = this.dashBoardData.trips.upcomingTrips;
      this.priviousTrips = this.dashBoardData.trips.previousTrips;
      this.reviewCount = this.dashBoardData.rating.reviewCount;
    })
  }
}
