import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Route } from '@angular/compiler/src/core';
import { RiderService } from 'src/app/core/http/rider-service';
import { CookieService } from 'ngx-cookie-service';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { SharedService } from 'src/app/core/http/shared-service';
import { AuthService } from 'angularx-social-login';
import { environment } from 'src/environments/environment';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { DriverService } from 'src/app/core/http/driver-service';

@Component({
  selector: 'app-rider-dashboard-sidebar',
  templateUrl: './rider-dashboard-sidebar.component.html',
  styleUrls: ['./rider-dashboard-sidebar.component.css']
})
export class RiderDashboardSidebarComponent implements OnInit {

  public user: User;
  public activeLink: string;
  public isFileSlected = false;
  public selectedFile: any;
  public selectedFileUrl: string;
  public hideModal = false;
  public imageChangedEvent: any = '';
  public croppedImage: any = '';
  public isNewMessage = false;
  constructor(
    private authService: AuthService,
    private riderService: RiderService,
    private driverService: DriverService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private route: ActivatedRoute,
    private cookiesService: CookieService,
    private sharedChatService: SharedChatService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.getNotification();
    this.sharedService.getUserProfile().subscribe(data => {
      if (data) {
        this.user = data;
        if (data.avatar) {
          this.selectedFileUrl = `${environment.host}${environment.imageBaseUrl}${data.avatar}`;
          this.riderService.updatedUserProfile.next(data.avatar);
        } else {
          this.selectedFileUrl = '';
          this.riderService.updatedUserProfile.next(data.avatar);
        }
      }
    });
    this.activeLink = this.route.snapshot.routeConfig.path;
  }

  getNotification() {
    this.sharedChatService.onNewMessage().subscribe(data => {
      this.isNewMessage = data.isNewMessage;
      if (this.activeLink == 'messages') {
        this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
          this.isNewMessage = data.isNewMessage;
          this.sharedChatService.clearRiderMsgNotification.next(true)
        });
      }
      if (data.notification) {
        this.isNewMessage = data.notification ? data.notification.isNewMessage : false;
      }
    })
    this.sharedChatService.riderUpdatedMsgNotification().subscribe(data => {
      if (data) {
        this.isNewMessage = false;
      }
    })
  }

  logout() {
    this.authService.signOut();
    this.sharedChatService.disconnectUser(0);
    this.cookiesService.deleteAll();
    this.authenticationService.logout().subscribe(data => {
      if (data) {
        this.router.navigate(['/rider/find-ride']);
      }
    })
  }

  goToGivenRoute(path, link) {
    this.activeLink = link;
    if (link == 'messages' && this.isNewMessage) {
      this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
        this.isNewMessage = data.isNewMessage;
        this.sharedChatService.clearRiderMsgNotification.next(true)
      });
    }
    this.router.navigate([path])
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  selectFile(e) {
    this.selectedFileUrl = ''
    this.imageChangedEvent = e;
    this.isFileSlected = true;
  }

  changePhoto() {
    this.isFileSlected = !this.isFileSlected;
    this.selectedFile = null;
    this.selectedFileUrl = '';
  }

  deletePhoto() {
    this.hideModal = true;
    this.riderService.postRiderProfile({ avatar: '' }).subscribe(data => {
      if (data) {
        this.isFileSlected = false;
        this.imageChangedEvent = '';
        this.selectedFileUrl = '';
      }
      this.riderService.updatedUserProfile.next(data.avatar);
      this.hideModal = false;
    })
  }

  submitProfileImage() {
    this.hideModal = true;
    if (!this.croppedImage) {
      return false;
    }
    this.riderService.postRiderProfile({ avatar: this.croppedImage }).subscribe(data => {
      if (data) {
        this.selectedFileUrl = '';
        this.selectedFileUrl = `${environment.host}${environment.imageBaseUrl}${data.avatar}`
        this.riderService.updatedUserProfile.next(data.avatar);
      }
      this.hideModal = false;
    })
  }

}
