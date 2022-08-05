import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/http/admin-service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  public dashboardCount;
  constructor(
    private adminService: AdminService
  ) { }

  ngOnInit() {
    this.adminService.getDashBoardCounts().subscribe(data => {
      this.dashboardCount = data;
    })
  }

}
