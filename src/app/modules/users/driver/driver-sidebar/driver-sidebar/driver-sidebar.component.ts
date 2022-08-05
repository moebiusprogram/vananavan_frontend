import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { CookieService } from 'ngx-cookie-service';
import { SharedService } from 'src/app/core/http/shared-service';
import { User } from 'src/app/shared/models/user';
import { environment } from 'src/environments/environment';
import { DriverService } from 'src/app/core/http/driver-service';
import { ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-driver-sidebar',
  templateUrl: './driver-sidebar.component.html',
  styleUrls: ['./driver-sidebar.component.css']
})
export class DriverSidebarComponent implements OnInit {

  public user: User;
  public activeLink: string;
  public isFileSlected = false;
  public selectedFile: any;
  public selectedFileUrl: string;
  public hideModal = false;
  public imageChangedEvent: any = '';
  public croppedImage: any = '';
  public showProfileIcon = true;
  public showVehicleIcon = true;
  public profileDetail = null;
  public vehicleDetail = null;
  public isNewRequest = false;
  public isNewMessage = false;
  constructor(
    private authenticationService: AuthenticationService,
    private driverService: DriverService,
    private router: Router,
    private route: ActivatedRoute,
    private cookiesService: CookieService,
    private sharedChatService: SharedChatService,
    private sharedService: SharedService
  ) { }

  ngOnInit() {
    this.sharedService.getUserProfile().subscribe(data => {
      this.user = data;
      if (data.avatar) {
        this.selectedFileUrl = `${environment.host}${environment.imageBaseUrl}${data.avatar}`;
        this.driverService.updateProfilePicture.next(data.avatar);
      } else {
        this.selectedFileUrl = '';
        this.driverService.updateProfilePicture.next(null);
      }
    });
    this.getNotification()

    this.activeLink = this.route.snapshot.routeConfig.path;
    this.checkProfileDetail();
  }

  getNotification() {
    this.sharedChatService.getNotificationStatus().subscribe(data => {
      this.isNewMessage = data.isNewMessage;
      this.isNewRequest = data.isNewRequest;
    });
    this.sharedChatService.requestNotification().subscribe(data => {
      if (data) {
        if (this.activeLink == 'ride-request') {
          this.driverService.clearNotificationStatus({ type: 'request' }).subscribe(data => {
            this.isNewMessage = data.isNewMessage;
            this.isNewRequest = data.isNewRequest;
            this.sharedChatService.clearDriverReqNotification.next(true);
          });
        }
        this.isNewRequest = data.isNewRequest;
      }
    })
    this.sharedChatService.onNewMessage().subscribe(data => {
      // if (data.notification && data.msg.to != this.user._id) {
        this.isNewRequest = data.notification ? data.notification.isNewRequest : false;
        this.isNewMessage = data.notification ? data.notification.isNewMessage : false;
        if (this.activeLink == 'messages') {
          this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
            this.isNewMessage = data.isNewRequest;
            this.isNewRequest = data.isNewMessage;
            this.sharedChatService.clearDriverMsgNotification.next(true);
          });
        }
      // }
    })
    this.sharedChatService.driverUpdatedMsgNotification().subscribe(data => {
      if (data) {
        this.isNewMessage = false;
      }
    })
    this.sharedChatService.driverUpdatedReqNotification().subscribe(data => {
      if (data) {
        this.isNewRequest = false;
      }
    })
  }

  logout() {
    this.sharedChatService.disconnectUser(0);
    this.cookiesService.deleteAll();
    this.authenticationService.logout().subscribe(data => {
      if (data) {
        this.router.navigate(['/rider/find-ride']);
      }
    })
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
  }

  goToGivenRoute(path, link) {
    if (link == 'ride-request' && this.isNewRequest) {
      this.driverService.clearNotificationStatus({ type: 'request' }).subscribe(data => {
        this.isNewMessage = data.isNewMessage;
        this.isNewRequest = data.isNewRequest;
        this.sharedChatService.clearDriverReqNotification.next(true);
      });
    }
    if (link == 'messages' && this.isNewMessage) {
      this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
        this.isNewMessage = data.isNewRequest;
        this.isNewRequest = data.isNewRequest;
        this.sharedChatService.clearDriverMsgNotification.next(true);
      });
    }
    this.sharedChatService.driverUpdatedMsgNotification().subscribe(data => {
      if (data) {
        this.isNewMessage = false;
      }
    })
    this.sharedChatService.driverUpdatedReqNotification().subscribe(data => {
      if (data) {
        this.isNewRequest = false;
      }
    })
    this.activeLink = link;
    this.router.navigate([path])
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
    this.driverService.postDriverImage({ avatar: '' }).subscribe(data => {
      if (data) {
        this.isFileSlected = false;
        this.imageChangedEvent = '';
        this.selectedFileUrl = '';
      }
      this.driverService.updateProfilePicture.next(null);
      this.hideModal = false;
    })
  }

  submitProfileImage() {
    this.hideModal = true;
    if (!this.croppedImage) {
      return false;
    }
    this.driverService.postDriverImage({ avatar: this.croppedImage }).subscribe(data => {
      if (data) {
        this.selectedFileUrl = `${environment.host}${environment.imageBaseUrl}${data.avatar}`;
        this.driverService.updateProfilePicture.next(data.avatar);
      }
      this.hideModal = false;
    })
  }

  private checkProfileDetail() {
    this.driverService.getUpdatedProfile().subscribe(data => {
      // if (!data) {
      //   this.showProfileIcon = true;
      // }
      if (data) {
        this.profileDetail = data
        this.vehicleDetail = data.driverDetail;
        this.showRedIcon();
      }
      this.driverService.getUpdatedVehicleDetail().subscribe(data => {
        // if (!data) {
        //   this.showVehicleIcon = true;
        // }
        if (data) {
          this.vehicleDetail = data;
          this.showRedIcon();
        }
      })
    });
  }

  private showRedIcon() {
    let documentDetail = this.profileDetail ? this.profileDetail.driverDetail : null;
    let basicDetail = this.profileDetail ? this.profileDetail.driver : null;
    let vehicleDetail = this.vehicleDetail;
    if (documentDetail) {
      if (!documentDetail.profileDocumentPhoto || documentDetail.profileDocumentPhoto.length == 0 || !documentDetail.chauffeurLicenseNumber || !documentDetail.licenseNumber || !documentDetail.drivingFromYear ||
        !documentDetail.languages || documentDetail.languages.length == 0
      ) {
        this.showProfileIcon = true;
      } else if (!basicDetail || !basicDetail.firstName || !basicDetail.lastName || !basicDetail.email
        || !basicDetail.mobile || !basicDetail.day || !basicDetail.month || !basicDetail.year) {
        this.showProfileIcon = true;
      } else {
        this.showProfileIcon = false;
      }
    }
    if (!documentDetail) {
      this.showProfileIcon = true;
    }

    if (this.vehicleDetail) {
      if (!vehicleDetail.model || vehicleDetail.model == '' ||
        !vehicleDetail.registrationNumber || vehicleDetail.registrationNumber == '' ||
        !vehicleDetail.vin || vehicleDetail.vin == '' || !vehicleDetail.cin || vehicleDetail.cin == '' ||
        vehicleDetail.vehicleDetailPhoto.length == 0
      ) {
        this.showVehicleIcon = true;
      } else {
        this.showVehicleIcon = false;
      }
    }
    if (!this.vehicleDetail) {
      this.showVehicleIcon = true;
    }
  }



}
