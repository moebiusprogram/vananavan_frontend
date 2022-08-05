import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { RiderService } from 'src/app/core/http/rider-service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-rider-my-request',
  templateUrl: './rider-my-request.component.html',
  styleUrls: ['./rider-my-request.component.css']
})
export class RiderMyRequestComponent implements OnInit {

  public requestType = 1; // 1-Active request, 2-Cancelled request
  public currentUrl;
  public activeRequest: Array<any> = [];
  public cancelledRequest: Array<any> = [];
  public selectedId: string;
  constructor(
    private route: ActivatedRoute,
    private riderService: RiderService,
    private sharedChatService: SharedChatService,
  ) { }

  ngOnInit() {
    this.getAllRequest();
    this.getCancelledRequestStatus();
  }

  private getAllRequest() {
    if (this.requestType === 1) {
      this.riderService.getRiderRequest({ requestType: this.requestType }).subscribe(data => {
        this.activeRequest = data;
        if (this.activeRequest && this.activeRequest.length > 0) {
          this.selectedId = this.activeRequest[0]._id;
          this.riderService.selectedRequest.next({ request: this.activeRequest[0], requestType: 1 })
        }
      });
    }
    if (this.requestType === 2) {
      this.riderService.getRiderRequest({ requestType: this.requestType }).subscribe(data => {
        this.cancelledRequest = this.appendImageUrl(data);
        if (this.cancelledRequest && this.cancelledRequest.length > 0) {
          this.selectedId = this.cancelledRequest[0]._id;
          this.cancelledRequest = this.cancelledRequest.filter(elem => {
            if (elem && elem.quote && elem.quote != '') {
              return elem;
            }
          })
          this.riderService.selectedRequest.next({ request: this.cancelledRequest[0], requestType: 2 })
        }
      });
    }
  }

  public appendImageUrl(data) {
    let appendedImage = data.map(elem => {
      if (elem && elem.avatar) {
        elem.avatar = `${environment.host}${environment.imageBaseUrl}${elem.avatar}`;
      }
      return elem;
    })
    return appendedImage;
  }

  updateRequestByType(type: number) {
    this.requestType = type;
    this.getAllRequest();
  }

  updateSelectedRequest(item, requestType) {
    this.selectedId = item._id;
    this.riderService.selectedRequest.next({ request: item, requestType: requestType });
  }

  getCancelledRequestStatus() {
    this.riderService.getCancelledRequest().subscribe(data => {
      if (data != null) {
        this.activeRequest = this.activeRequest.filter(elem => {
          if (elem._id != data.id && elem.bookingId == data.bookingId) {
            return elem;
          }
        });
        this.riderService.selectedRequest.next({ request: this.activeRequest[0], requestType: 1 })
      }
    });
  }

}
