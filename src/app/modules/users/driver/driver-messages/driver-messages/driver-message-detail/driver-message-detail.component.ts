import { Component, OnInit, Input, HostListener } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { MessageModel } from 'src/app/shared/models/message.model';
import { SharedService } from 'src/app/core/http/shared-service';
import { DriverService } from 'src/app/core/http/driver-service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-message-detail',
  templateUrl: './driver-message-detail.component.html',
  styleUrls: ['./driver-message-detail.component.css']
})
export class DriverMessageDetailComponent implements OnInit {

  public environment = environment;
  public allRider: Array<User> = [];
  public chat: MessageModel;
  public isMessageFromSchool = true;
  public activeRider: User;
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
    private TS: ToastrService
  ) { }

  ngOnInit() {
    this.driverservice.getDriverDetail().subscribe(data => {
      this.profileDetail = data;
    })
    this.authService.getUserInfo().subscribe(data => {
      this.from = data._id;
    });
    this.getAcceptDeclineQuoteEvent();
    this.getNewMessage();
    this.getUpdatedActiveRider();
    this.getRiderStatus();
  }

  private getUpdatedActiveRider() {
    this.sharedChatService.getUpdatedActiveRider().subscribe((data) => {
      if (data) {
        this.to = data.activeRider._id;
        this.activeRider = data.activeRider;
        if (this.activeRider) {
          this.getAllChat(this.to, data.resetUnread);
        }
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
      if (this.activeRider) {
        this.updateBookingStatus(data.msg);
        if (!this.chat || !this.chat.messages) {
          this.chat = { messages: [data.msg] }
        } else {
          this.chat.messages.push(data.msg);
        }
        this.getLastTripId();
        this.sharedChatService.updateDriverUnreadCount.next(data);
      }
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
    if (this.activeRider.permission == 1) {
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
    this.sharedChatService.updateDriverTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
    this.message = '';
  }

  submitQuote() {
    this.hideModal = false;
    if (this.quote === '') {
      return false;
    }
    if (this.activeRider.permission == 1) {
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
    this.sharedChatService.updateDriverTopMsg.next(message);
    this.hideModal = true;
    this.quote = '';
  }

  sendStaticMessage(msg) {
    if (this.activeRider.permission == 1) {
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
    this.sharedChatService.updateDriverTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
  }

  public getRiderStatus() {
    this.sharedChatService.getRiderChangedStatus().subscribe(data => {
      if (data && this.activeRider) {
        if (data._id === this.activeRider._id) {
          this.activeRider.status = data.status;
        }
      }
    })
  }

  updateDeclineRequest(status, bookingId, fare) {
    this.showToasterMessage();
    if (this.showToaster) {
      return false;
    }

    if (this.activeRider.permission == 1) {
      this.TS.error("this rider is deactivated");
      return false;
    }

    const message = {
      message: status == 2 ? 'Quote has been declined' : 'Quote has been accepted',
      userId: this.to,
      driverId: this.from,
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
    this.sharedChatService.updateDriverTopMsg.next(message);
    this.sharedChatService.clearDriverMsgNotification.next(true);
  }

  private showToasterMessage() {
    this.checkNullField();
    if (this.showToaster) {
      this.TS.error('Required. Please complete all profile and vehicle details before accepting trips.',
        '', {
        timeOut: 5000 // Hide manually
      });
    }
  }

  private getLastTripId() {
    this.chat.messages.forEach(elem => {
      if (elem.messageType == 2) {
        this.lastBooking = elem;
      }
    });
    this.isMessageFromSchool = this.chat.messages[this.chat.messages.length - 1] ? this.chat.messages[this.chat.messages.length - 1].isMessageFromSchool : true
  }

  private checkNullField() {
    let documentDetail = this.profileDetail.driverDetail;
    let basicDetail = this.profileDetail.driver;
    let vehicleDetail = this.profileDetail.driverVehicle;
    if (!documentDetail.profileDocumentPhoto || documentDetail.profileDocumentPhoto.length == 0 || !documentDetail.chauffeurLicenseNumber || !documentDetail.licenseNumber || !documentDetail.drivingFromYear ||
      !documentDetail.languages || documentDetail.languages.length == 0
    ) {
      this.showToaster = true;
    } else if (!basicDetail || !basicDetail.firstName || !basicDetail.lastName || !basicDetail.email
      || !basicDetail.mobile || !basicDetail.day || !basicDetail.month || !basicDetail.year) {
      this.showToaster = true;
    } else if (!vehicleDetail.model || vehicleDetail.model == '' ||
      !vehicleDetail.registrationNumber || vehicleDetail.registrationNumber == '' ||
      !vehicleDetail.vin || vehicleDetail.vin == '' || !vehicleDetail.cin || vehicleDetail.cin == '' ||
      vehicleDetail.vehicleDetailPhoto.length == 0
    ) {
      this.showToaster = true;
    } else {
      this.showToaster = false;
    }
  }

  private getAcceptDeclineQuoteEvent() {
    this.sharedChatService.onAcceptDecline().subscribe(data => {
      if (this.activeRider) {
        this.updateBookingStatus(data.msg);
        if (!this.chat.messages) {
          this.chat = { messages: [data.msg] }
        } else {
          this.chat.messages.push(data.msg);
        }
        this.getLastTripId()
        this.sharedChatService.updateRiderUnreadCount.next(data);
      }
    })
  }

  private updateBookingStatus(message) {
    this.chat.messages.forEach(elem => {
      if ((elem.bookingId == message.bookingId) && elem.tripId) {
        elem.tripId['isBookingClosed'] = true;
        elem.tripId['isRideClosed'] = true;
      }
    });
  }

}