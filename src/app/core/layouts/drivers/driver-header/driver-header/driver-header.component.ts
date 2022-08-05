import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/authentication/authentication.service';
import { User } from 'src/app/shared/models/user';
import { SharedChatService } from 'src/app/core/http/shared-chat-service';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { AuthService } from 'angularx-social-login';
import { environment } from 'src/environments/environment';
import { DriverService } from 'src/app/core/http/driver-service';

@Component({
  selector: 'app-driver-header',
  templateUrl: './driver-header.component.html',
  styleUrls: ['./driver-header.component.css']
})
export class DriverHeaderComponent implements OnInit {

  public currentUser: User = {
    avatar: 'assets/images/nav_Driver.svg'
  };
  public showProfileIcon = true;
  public showVehicleIcon = true;
  public profileDetail = null;
  public vehicleDetail = null;
  public isNewRequest = false;
  public isNewMessage = false;
  constructor(
    private authenticationService: AuthenticationService,
    private authService: AuthService,
    private driverService: DriverService,
    private sharedChatService: SharedChatService,
    private cookiesService: CookieService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authenticationService.getUserInfo().subscribe(data => {
      if (data) {
        if (!data.isCompleteRegistered) {
          this.router.navigate(['']);
        }
        this.currentUser.firstName = data.firstName;
        this.currentUser.lastName = data.lastName;
        this.currentUser.loginType = data.loginType;
        this.currentUser.photoUrl = data.photoUrl;
        this.getNotification();
      }
    });
    this.driverService.getDriverProfilePicture().subscribe(data => {
      if (data) {
        this.currentUser.avatar = `${environment.host}${environment.imageBaseUrl}${data}`;
      } else {
        this.currentUser.avatar = null
      }
    });
    this.driverService.getDriverDetail().subscribe(data => {
      this.driverService.driverProfile.next(data);
      this.driverService.driverVehicleDetail.next(data.driverVehicle);
      this.profileDetail = data;
      this.vehicleDetail = data.driverVehicle;
      this.checkProfileDetail();
    })
  }

  getNotification() {
    this.sharedChatService.getNotificationStatus().subscribe(data => {
      this.isNewMessage = data.isNewMessage;
      this.isNewRequest = data.isNewRequest;
    })
    this.sharedChatService.requestNotification().subscribe(data => {
      if (data) {
        this.isNewRequest = data.isNewRequest;
      }
    })
    this.sharedChatService.onNewMessage().subscribe(data => {
      if (data.notification && data.msg.from != this.currentUser._id) {
        this.isNewRequest = data.notification ? data.notification.isNewRequest : false;
        this.isNewMessage = data.notification ? data.notification.isNewMessage : false;
      }
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
    this.authService.signOut(true);
    this.authenticationService.logout().subscribe(value => {
      if (value) {
        this.cookiesService.deleteAll();
        this.router.navigate(['/rider/find-ride']);
      }
    });
  }

  goToGivenRoute(path) {
    if (path == '/driver/messages') {
      this.driverService.clearNotificationStatus({ type: 'message' }).subscribe(data => {
        this.isNewMessage = data.isNewRequest;
        this.isNewRequest = data.isNewRequest;
        this.sharedChatService.clearDriverMsgNotification.next(true);
      });
    }
    if (path == '/driver/ride-request') {
      this.driverService.clearNotificationStatus({ type: 'request' }).subscribe(data => {
        this.isNewMessage = data.isNewMessage;
        this.isNewRequest = data.isNewRequest;
        this.sharedChatService.clearDriverReqNotification.next(true);
      });
    }
    this.router.navigate([path])
  }

  goToProfile(path) {
    this.router.navigate([path])
  }

  private checkProfileDetail() {
    this.driverService.getUpdatedProfile().subscribe(data => {
      if (data) {
        this.profileDetail = data
        this.vehicleDetail = data.driverDetail;
        this.showRedIcon();
      }
      this.driverService.getUpdatedVehicleDetail().subscribe(data => {
        if (data) {
          this.vehicleDetail = data;
          this.showRedIcon();
        }
      })
    });
  }

  private showRedIcon() {
    let documentDetail = this.profileDetail.driverDetail;
    let basicDetail = this.profileDetail.driver;
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
  }

}
