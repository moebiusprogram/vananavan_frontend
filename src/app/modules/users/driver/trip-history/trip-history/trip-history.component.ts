import { Component, OnInit } from '@angular/core';
import { DriverService } from 'src/app/core/http/driver-service';
import { Trip } from 'src/app/shared/models/trip.model';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-trip-history',
  templateUrl: './trip-history.component.html',
  styleUrls: ['./trip-history.component.css']
})

export class TripHistoryComponent implements OnInit {

  public tripHistory: Array<Trip> = [];
  public selectedId;
  constructor(
    private driverService: DriverService,
  ) { }

  ngOnInit() {
    this.getTripHistory();
  }

  private getTripHistory() {
    this.driverService.getDriverTripHistory().subscribe(data => {
      this.tripHistory = this.appendImageUrl(data);
      this.selectedId = this.tripHistory[0]._id;
      this.driverService.selectedTripHistory.next({ trip: this.tripHistory[0] });
    })
  }

  updateSelectedRequest(item) {
    this.selectedId = item._id;
    this.driverService.selectedTripHistory.next({ trip: item });
  }

  public appendImageUrl(data) {
    let appendedUrl = data.map(elem => {
      if (elem && elem.details && elem.details.avatar) {
        elem.details.avatar = `${environment.host}${environment.imageBaseUrl}${elem.details.avatar}`;
      }
      return elem;
    });
    return appendedUrl;
  }

}
