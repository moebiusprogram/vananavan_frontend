import { Component, OnInit, Input } from '@angular/core';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { User } from 'src/app/shared/models/user';
import { MessageModel } from 'src/app/shared/models/message.model';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-driver-messages',
  templateUrl: './driver-messages.component.html',
  styleUrls: ['./driver-messages.component.css']
})
export class DriverMessagesComponent implements OnInit {
  public environment = environment;
  public allRiders: Array<User> = [];
  public activeRider: User = null;
  public allTopMessages: Array<any> = [];
  public searchString: string;
  public to: string;
  public from: string;
  public isUserSelected = false;
  constructor(
    private sharedChatService: SharedChatService,
    private authService: AuthenticationService
  ) { }
  ngOnInit() {
    this.authService.getUserInfo().subscribe(data => {
      this.from = data._id;
    });
    this.getTopMessage();
    this.onMessageUnreadCount();
    this.userStatus();
    this.getUpdatedTopMessage();
  }
  private getTopMessage() {
    this.sharedChatService.getAllTopMessages().subscribe(data => {
      data = data.filter(elem => {
        if (elem.from && elem.to) {
          return elem;
        }
      });
      this.setActiveRider(data)
    })
  }

  private getUpdatedTopMessage() {
    this.sharedChatService.getUpdatedDriverTopMsg().subscribe(data => {
      if (data) {
        this.allTopMessages = this.allTopMessages.map(elem => {
          if (elem.from._id === this.from) {
            if (elem.to._id == data.to) {
              elem.recentMessage = data.message
            }
          }
          if (elem.to._id === this.from) {
            if (elem.from._id == data.to) {
              elem.recentMessage = data.message
            }
          }
          return elem;
        });
      }
    })
  }

  private setActiveRider(data) {
    this.allTopMessages = data;
    if (this.allTopMessages[0].from.type == 1) {
      this.activeRider = this.allTopMessages[0].from;
    }
    if (this.allTopMessages[0].to.type == 1) {
      this.activeRider = this.allTopMessages[0].to;
    }
  }

  updateActiveRider(activeRider: User) {
    this.activeRider = activeRider;
    this.isUserSelected = true;
    this.resetActiveUserCounts();
    this.sharedChatService.selectedRider.next({ activeRider });
  }
  private onMessageUnreadCount() {
    this.sharedChatService.onNewMessage().subscribe(data => {
      if (data.msg && data.msg.sortedTopMessage) {
        this.allTopMessages = data.msg.sortedTopMessage;
        this.allTopMessages = this.allTopMessages.filter(elem => {
          if (elem.from && elem.to) {
            return elem;
          }
        });
        this.resetActiveUserCounts();
      }
    });
  }

  private userStatus() {
    this.sharedChatService.onStatusChange().subscribe(data => {
      let user = data.status;
      if (this.activeRider) {
        this.allTopMessages = this.allTopMessages.map(elem => {
          if (elem.from._id === user._id) {
            elem.from.status = user.status;
          }
          if (elem.to._id === user._id) {
            elem.to.status = user.status;
          }
          return elem;
        });
        if (user._id == this.activeRider._id) {
          this.sharedChatService.riderStatusChanged.next(user);
        }
      }
    })
  }
  filterDriverByName() {
    if (this.allTopMessages.length == 0) {
      return false
    }
    this.sharedChatService.searchRiderDriver({ searchString: this.searchString, type: 1 }).subscribe(data => {
      if (data.length > 0) {
        this.setActiveRider(data);
        this.activeRider = null;
        this.sharedChatService.selectedRider.next({ activeRider: null });
      }
      if (data.length == 0) {
        this.allTopMessages = [];
        this.activeRider = null;
        this.sharedChatService.selectedRider.next({ activeRider: null });
      }
    })
  }

  private resetActiveUserCounts() {
    if (this.activeRider && this.isUserSelected) {
      this.sharedChatService.resetActiveUserCounts({ to: this.activeRider._id })
        .subscribe(data => {
          this.allTopMessages = this.allTopMessages.map(elem => {
            if (elem._id == data._id) {
              return data;
            } else {
              return elem;
            }
          })
        });
    }
  }


}