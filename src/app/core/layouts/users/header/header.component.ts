import { UsersService } from 'src/app/core/services';
import { AuthenticationService } from './../../../authentication/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { Route } from '@angular/compiler/src/core';
import { User } from 'src/app/shared/models/user';
import { CookieService } from 'ngx-cookie-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { AuthService } from 'angularx-social-login';
import { RiderService } from 'src/app/core/http/rider-service';
import { environment } from 'src/environments/environment';
import { DriverService } from 'src/app/core/http/driver-service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {
  public currentUser: User;
  public isApplicationEditable = false;
  public isNewMessage = false;
  public activeLink = '';
  constructor(
    private router: Router,
    private authService: AuthService,
    public authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private riderService: RiderService,
    private cookiesService: CookieService,
    private sharedChatService: SharedChatService,
    private driverService: DriverService
  ) { }

  ngOnInit() {
    this.authenticationService.getUserInfo().subscribe(data => {
      this.currentUser = data;
      if (this.currentUser) {
        this.getNotification();
      }
      if (this.currentUser && this.currentUser.avatar) {
        this.currentUser.avatar = this.currentUser.avatar == 1 ? this.currentUser.photoUrl :
          this.currentUser.avatar ?
            `${environment.host}${environment.imageBaseUrl}${this.currentUser.avatar}` : null;
      }
    });
    this.activeLink = this.route.snapshot.routeConfig.path;
    this.getUpdatedUser();
  }

  getNotification() {
    this.sharedChatService.getNotificationStatus().subscribe(data => {
      if (this.activeLink == 'messages') {
        this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
          this.isNewMessage = data.isNewMessage;
          this.sharedChatService.clearRiderMsgNotification.next(true)
        });
      }
      if (this.activeLink != 'messages') {
        this.isNewMessage = data.isNewMessage;
      }
    })
    this.sharedChatService.onNewMessage().subscribe(data => {
      if (data.notification) {
        if (this.activeLink == 'messages') {
          this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
            this.isNewMessage = data.isNewMessage;
            this.sharedChatService.clearRiderMsgNotification.next(true)
          });
        }
        if (this.activeLink != 'messages') {
          this.isNewMessage = data.notification ? data.notification.isNewMessage : false;
        }
      }
    })
    this.sharedChatService.riderUpdatedMsgNotification().subscribe(data => {
      if (data) {
        this.isNewMessage = false;
      }
    })
  }

  logout() {
    this.sharedChatService.disconnectUser(0);
    this.authService.signOut(true);
    this.authenticationService.logout().subscribe(value => {
      if (value) {
        this.cookiesService.deleteAll();
        this.router.navigate(['']);
      }
    });
  }

  goToGivenRoute(path) {
    if (path == '/rider/messages') {
      this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
        this.isNewMessage = data.isNewMessage;
        this.sharedChatService.clearRiderMsgNotification.next(true)
      });
    }
    if (this.currentUser) {
      this.router.navigate([path], { queryParams: { type: 'logged-in' } })
    }
    if (!this.currentUser) {
      this.router.navigate(['']);
    }
  }

  private getUpdatedUser() {
    this.riderService.getUpdatedUserProfile().subscribe(data => {
      if (data) {
        this.currentUser.avatar = data.avatar ? `${environment.host}${environment.imageBaseUrl}${data.avatar}` :
          `${environment.host}${environment.imageBaseUrl}${data}`;
      } else {
        if (this.currentUser) {
          this.currentUser.avatar = this.currentUser.loginType == 1 ? this.currentUser.photoUrl : null
        }
      }
    });
  }

}
