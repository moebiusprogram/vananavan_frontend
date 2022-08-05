import { Component, OnInit } from '@angular/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-reviews',
  templateUrl: './driver-reviews.component.html',
  styleUrls: ['./driver-reviews.component.css']
})
export class DriverReviewsComponent implements OnInit {

  public environment = environment;
  public totalReview: number;
  public userReview: Array<any>;
  constructor(
    private riderService: RiderService
  ) { }

  ngOnInit() {
    this.riderService.getSelectedDriver().subscribe(data => {
      if (data) {
        this.totalReview = data.totalReview;
        this.userReview = data.allUsersReview;
      } else {
        this.totalReview = 0;
      }

      console.log(data, 'REVIEW**')
    })
  }

}
