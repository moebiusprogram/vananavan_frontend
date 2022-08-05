import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/core/http/admin-service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-booking-detail',
  templateUrl: './admin-booking-detail.component.html',
  styleUrls: ['./admin-booking-detail.component.css']
})
export class AdminBookingDetailComponent implements OnInit {

  public bookingDetail;
  constructor(
    private driverService: AdminService,
    private activeRoute: ActivatedRoute,
    private route: Router,
        private toasterService: ToastrService,
  ) { }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(params => {
      if (params.tripId && params.tripId != '') {
        this.driverService.getAdminBookingDetail({ tripId: params.tripId }).subscribe(data => {
          this.bookingDetail = data;
        });
      }
    })
  }

  goToUserDetail(type, id) {
    if (!id || id == '') {
      this.toasterService.error("This user has been deleted.");
      return false;
    }
    if (type == 'Driver') {
      this.route.navigate(["/admin/driver-detail"], { queryParams: { driverId: id } });
    }
    if (type == 'Rider') {
      this.route.navigate(["/admin/rider-detail"], { queryParams: { riderId: id } });
    }
  }

}
