import { Component, OnInit, Input, HostListener } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { MessageModel } from 'src/app/shared/models/message.model';
import { SharedService } from 'src/app/core/http/shared-service';
import { DriverService } from 'src/app/core/http/driver-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
@Component({
  selector: "app-rider-message-detail",
  templateUrl: "./rider-message-detail.component.html",
  styleUrls: ["./rider-message-detail.component.css"],
})
export class RiderMessageDetailComponent implements OnInit {
  public environment = environment;
  public chat: MessageModel;
  public isMessageFromSchool = true;
  public activeDriver: User;
  public to: string;
  public from: string;
  public message: string;
  public lastBooking: any;
  public hideModal = false;
  public quote = '';
  public profileDetail;
  public showToaster = false;
  constructor(
    private sharedChatService: SharedChatService,
    private authService: AuthenticationService,
    private sharedService: SharedService,
    private driverservice: DriverService,
    private TS: ToastrService,
    private router: Router
  ) { }
  ngOnInit() {
    this.getDriverProfile();
    this.getUpdatedActiveRider();
    this.getAcceptDeclineQuoteEvent();
    this.getNewMessage();
    this.getRiderStatus();
  }
  private getDriverProfile() {
    this.driverservice.getDriverDetail().subscribe(data => {
      this.profileDetail = data;
    })
    this.authService.getUserInfo().subscribe(data => {
      this.from = data._id;
    });
  }
  private getUpdatedActiveRider() {
    this.sharedChatService.getUpdatedActiveRider().subscribe((data) => {
      if (data && data.activeDriver) {
        this.to = data.activeDriver._id;
        this.activeDriver = data.activeDriver;
        if (this.activeDriver) {
          this.getAllChat(this.to, data.resetUnread);
        }
      }
      if (!data || !data.activeDriver) {
        this.activeDriver = null;
        this.chat = null;
      }
    });
  }
  private getAllChat(to: string, resetUnread) {
    this.sharedChatService.getAllMessage({ to, resetUnreadCount: resetUnread }).subscribe(data => {
      this.chat = data;
      this.getLastTripId();
      if (resetUnread) {
        this.sharedChatService.onEventUnreadCount.next(data);
      }
    })
  }
  private getNewMessage() {
    this.sharedChatService.onNewMessage().subscribe(data => {
      this.updateBookingStatus(data.msg);
      if (!this.chat || !this.chat.messages) {
        this.chat = { messages: [data.msg] }
      } else {
        this.chat.messages.push(data.msg);
      }
      this.getLastTripId();
      this.sharedChatService.updateDriverUnreadCount.next(data);
    });
  }
  @HostListener('event', ['$event'])
  scrollHandler(event) {
    // if (this.activeRider.unreadMsgCount > 0) {
    //   this.to = this.activeRider._id;
    //   this.activeRider = this.activeRider;
    //   this.getAllChat(this.to, true);
    // }
  }
  sendMessage() {
    this.message = this.message.trim();
    if (this.message === null || this.message === undefined || this.message === '') {
      return false;
    }
    if (this.activeDriver.permission == 1) {
      this.TS.error("this rider is deactivated");
      return false;
    }
    const message = {
      message: this.message,
      to: this.to,
      from: this.from,
      createdAt: new Date(),
      tripId: null,
      messageType: 1
    }
    if (!this.chat.messages) {
      this.chat = { messages: [message] };
    } else {
      this.chat.messages.push(message);
    }
    this.sharedChatService.sendMessage(message);
    this.sharedChatService.updateRiderTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
    this.message = '';
  }
  submitQuote() {
    this.hideModal = false;
    if (this.quote === '') {
      return false;
    }
    if (this.activeDriver.permission == 1) {
      this.TS.error("this rider is deactivated");
      return false;
    }
    if (!this.lastBooking || !this.lastBooking.tripId || !this.lastBooking.tripId._id || !this.lastBooking.bookingId || this.lastBooking.status == 2 || this.lastBooking.status == 2 || this.lastBooking.status == 5) {
      this.TS.error("You don't have event for making offer.");
      return false;
    }
    const message = {
      message: this.quote,
      to: this.to,
      from: this.from,
      createdAt: new Date(),
      tripId: this.lastBooking.tripId,
      bookingId: this.lastBooking.bookingId,
      messageType: 2,
    }
    this.sharedChatService.sendQuote(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
    this.hideModal = true;
    this.quote = '';
  }
  sendStaticMessage(msg) {
    if (this.activeDriver.permission == 1) {
      this.TS.error("this rider is deactivated");
      return false;
    }
    const message = {
      message: msg,
      to: this.to,
      from: this.from,
      createdAt: new Date(),
      tripId: null,
      messageType: 1
    }
    if (!this.chat.messages) {
      this.chat = { messages: [message] };
    } else {
      this.chat.messages.push(message);
    }
    this.sharedChatService.sendMessage(message);
    this.sharedChatService.updateRiderTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
  }
  public getRiderStatus() {
    this.sharedChatService.getRiderChangedStatus().subscribe(data => {
      if (data && this.activeDriver) {
        if (data._id === this.activeDriver._id) {
          this.activeDriver.status = data.status;
        }
      }
    })
  }
  updateDeclineRequest(status, bookingId, fare) {
    if (this.activeDriver.permission == 1) {
      this.TS.error("this rider is deactivated");
      return false;
    }
    const message = {
      message: status == 2 ? 'Quote has been declined' : 'Quote has been accepted',
      userId: this.from,
      driverId: this.to,
      to: this.to,
      from: this.from,
      createdAt: new Date(),
      messageType: 1,
      bookingId,
      fare,
      status,
      messageFor: 2
    }
    // if (!this.chat.messages) {
    //   this.chat = { messages: [message] };
    // } else {
    //   this.chat.messages.push(message);
    // }
    this.sharedChatService.acceptDeclineQuote(message);
    this.sharedChatService.updateRiderTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
  }

  private getLastTripId() {
    if (this.chat && this.chat.messages) {
      this.chat.messages.forEach(elem => {
        if (elem.messageType == 2) {
          this.lastBooking = elem;
        }
      });
      this.isMessageFromSchool = this.chat.messages[this.chat.messages.length - 1] ? this.chat.messages[this.chat.messages.length - 1].isMessageFromSchool : true;
    }
  }

  private getAcceptDeclineQuoteEvent() {
    this.sharedChatService.onAcceptDecline().subscribe(data => {
      this.updateBookingStatus(data.msg.updateTripModel);
      if (!this.chat.messages) {
        this.chat = { messages: [data.msg] }
      } else {
        this.chat.messages.push(data.msg);
      }
      this.getLastTripId()
    })
  }
  private updateBookingStatus(message) {
    if (this.chat && this.chat.messages) {
      this.chat.messages.forEach(elem => {
        if ((elem.bookingId == message.bookingId) && elem.tripId) {
          elem.tripId['isBookingClosed'] = true;
          elem.tripId['isRideClosed'] = true;
        }
      });
    }
  }


  checkDriverProfile(driverId) {
    this.router.navigate(["/rider/driver-profile"], {
      queryParams: { driverId },
    });
  }



}
