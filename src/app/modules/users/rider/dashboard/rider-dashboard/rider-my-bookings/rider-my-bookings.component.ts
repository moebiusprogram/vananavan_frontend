import { Component, OnInit } from '@angular/core';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { RiderService } from 'src/app/core/http/rider-service';
import { RiderBookings } from 'src/app/shared/models/rider.bookings';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rider-my-bookings',
  templateUrl: './rider-my-bookings.component.html',
  styleUrls: ['./rider-my-bookings.component.css']
})
export class RiderMyBookingsComponent implements OnInit {

  public type = 1;  // 1- current 2- past
  public currentBookings: Array<RiderBookings> = [];
  public pastBookings: Array<RiderBookings> = [];
  public selectedBooking: RiderBookings;
  public showDetail = true;
  public selectedId;
  constructor(
    private riderService: RiderService
  ) { }

  ngOnInit() {
    this.getAllBookings();
    this.getAfterReview();
  }


  private getAllBookings() {
    if (this.type === 1) {
      this.riderService.getAllBookings({ type: this.type }).subscribe(data => {
        if (data.length > 0) {
          this.currentBookings = this.appendImageUrl(data);
          this.selectedId = this.currentBookings[0]._id;
          this.showDetail = true;
          this.riderService.selectedBooking.next({ booking: this.currentBookings[0], type: 1 });
        } else {
          this.showDetail = false;
        }
      })
    }
    if (this.type === 2) {
      this.riderService.getAllBookings({ type: this.type }).subscribe(data => {
        if (data.length > 0) {
          this.pastBookings = this.appendImageUrl(data);
          this.selectedId = this.pastBookings[0]._id;
          this.showDetail = true;
          this.riderService.selectedBooking.next({ booking: this.pastBookings[0], type: 2 });
        } else {
          this.showDetail = false;
        }
      })
    }

  }

  getBookings(type: number) {
    this.type = type;
    this.getAllBookings();
  }

  updateSelectedBooking(item) {
    this.selectedId = item._id;
    this.riderService.selectedBooking.next({ booking: item, type: this.type });
  }

  private getAfterReview() {
    this.riderService.getReviewedBooking().subscribe(data => {
      if (data != null) {
        this.pastBookings = this.pastBookings.map(elem => {
          if (elem._id == data._id) {
            elem.isRating = data.isRating;
          }
          return elem;
        })
      }
    })
  }

  appendImageUrl(bookings) {
    let appendedImage = bookings.map(elem => {
      if (elem && elem.avatar) {
        elem.avatar = `${environment.host}${environment.imageBaseUrl}${elem.avatar}`;
      }
      return elem;
    });
    return appendedImage;
  }

}
