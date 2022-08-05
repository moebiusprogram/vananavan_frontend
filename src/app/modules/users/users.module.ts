import { UserAuthGuard } from './../../core/guards/user-auth.guard';
import { LayoutsModule } from './../../core/layouts.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from '@agm/core';            // @agm/core
import { AgmDirectionModule } from 'agm-direction';   // agm-direction
import { MatDatepickerModule } from '@angular/material/datepicker';
import { A11yModule } from '@angular/cdk/a11y';
import { MatNativeDateModule } from '@angular/material';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RatingModule } from "ngx-rating";
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxImageCompressService } from 'ngx-image-compress';


import { UsersRoutingModule } from './users-routing.module';
import { RiderProfileComponent } from './rider/dashboard/rider-dashboard/rider-profile/rider-profile.component';
import { RiderMyBookingsComponent } from './rider/dashboard/rider-dashboard/rider-my-bookings/rider-my-bookings.component';
import { RiderMyRequestComponent } from './rider/dashboard/rider-dashboard/rider-my-request/rider-my-request.component';
import { RiderMessagesComponent } from './rider/dashboard/rider-dashboard/rider-messages/rider-messages.component';
import { RiderDashboardSidebarComponent } from './rider/dashboard/rider-dashboard/rider-dashboard-sidebar/rider-dashboard-sidebar.component';
import { DriverDashboardComponent } from './driver/driver-dashboard/driver-dashboard/driver-dashboard.component';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { EmojiModule } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { BookingsDetailComponent } from './rider/dashboard/rider-dashboard/rider-my-bookings/bookings-detail/bookings-detail.component';
import { RiderRequestDetailComponent } from './rider/dashboard/rider-dashboard/rider-my-request/rider-request-detail/rider-request-detail.component';
import { RiderSearchRideComponent } from './rider/find-ride/search-ride/rider-search-ride/rider-search-ride.component';
import { RideDetailComponent } from './rider/find-ride/available-ride/ride-detail/ride-detail.component';
import { AvailableDriverComponent } from './rider/find-ride/available-ride/ride-detail/available-driver/available-driver.component';
import { DriverDetailComponent } from './rider/find-ride/available-ride/ride-detail/driver-detail/driver-detail.component';
import { DriverReviewsComponent } from './rider/find-ride/available-ride/ride-detail/driver-reviews/driver-reviews.component';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { DriverProfileComponent } from './driver/driver-profile/driver-profile/driver-profile.component';
import { DriverVehiclesDetailComponent } from './driver/driver-vehicle-detail/driver-vehicles-detail/driver-vehicles-detail.component';
import { DriverRideRequestComponent } from './driver/ride-request-trip-history/driver-ride-request/driver-ride-request.component';
import { DriverRideDetailComponent } from './driver/ride-request-trip-history/driver-ride-request/driver-ride-detail/driver-ride-detail.component';
import { DriverRouteComponent } from './driver/driver-route/driver-route/driver-route.component';
import { DriverMessagesComponent } from './driver/driver-messages/driver-messages/driver-messages.component';
import { DriverMessageDetailComponent } from './driver/driver-messages/driver-messages/driver-message-detail/driver-message-detail.component';
import { DriverSidebarComponent } from './driver/driver-sidebar/driver-sidebar/driver-sidebar.component';
import { DriverRouteDetailComponent } from './driver/driver-route/driver-route/driver-route-detail/driver-route-detail.component';
import { RiderMessageDetailComponent } from './rider/dashboard/rider-dashboard/rider-messages/rider-message-detail/rider-message-detail.component';
import { TripHistoryComponent } from './driver/trip-history/trip-history/trip-history.component';
import { TripDetailComponent } from './driver/trip-history/trip-history/trip-detail/trip-detail.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';
import { ManageUserComponent } from './admin/manage-user/manage-user.component';
import { ManageDriverComponent } from './admin/manage-driver/manage-driver.component';
import { AddDriverRouteComponent } from './driver/driver-route/add-driver-route/add-driver-route.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ManageBookingsComponent } from './admin/manage-bookings/manage-bookings/manage-bookings.component';
import { AdminRiderDetailComponent } from './admin/manage-user/admin-rider-detail/admin-rider-detail.component';
import { AdminDriverDetailComponent } from './admin/manage-driver/admin-driver-detail/admin-driver-detail.component';
import { AddDriverSchoolRouteComponent } from './driver/driver-route/add-driver-school-route/add-driver-school-route.component';
import { ContactUsComponent } from './shared-modules/contact-us/contact-us.component';
import { GeneralInfoComponent } from './shared-modules/general-info/general-info.component';
import { DriverProfileDetailComponent } from './rider/dashboard/rider-dashboard/driver-profile-detail/driver-profile-detail.component';
import { GeneralInfoDumbComponent } from './dumb-component/general-info-dumb/general-info-dumb.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminBookingDetailComponent } from './admin/manage-bookings/manage-bookings/admin-booking-detail/admin-booking-detail.component';
import { ContactUsDetailComponent } from './shared-modules/contact-us/contact-us-detail/contact-us-detail.component';
import { DriverSchoolRouteComponent } from './driver/driver-route/driver-school-route/driver-school-route.component';
import { DriverPersonalInfoComponent } from './driver/driver-personal-info/driver-personal-info.component';

@NgModule({
  imports: [
    CommonModule,
    UsersRoutingModule,
    LayoutsModule,
    PickerModule,
    EmojiModule,
    AgmCoreModule.forRoot({ // @agm/core
      apiKey: 'AIzaSyAkq7DnUBTkddWXddoHAX02Srw6570ktx8',
    }),
    AgmDirectionModule,
    MatDatepickerModule,
    A11yModule,
    MatFormFieldModule,
    MatNativeDateModule,
    NgbModule,
    RatingModule,
    BsDatepickerModule,
    NgxDaterangepickerMd.forRoot(),
    NgCircleProgressModule.forRoot({
    }),
    ImageCropperModule,
    NgxPaginationModule,
  ],
  declarations: [
    UsersRoutingModule.component,
    RiderProfileComponent,
    RiderMyBookingsComponent,
    RiderMyRequestComponent,
    RiderMessagesComponent,
    RiderDashboardSidebarComponent,
    DriverDashboardComponent,
    BookingsDetailComponent,
    RiderRequestDetailComponent,
    RiderSearchRideComponent,
    RideDetailComponent,
    AvailableDriverComponent,
    DriverDetailComponent,
    DriverReviewsComponent,
    DriverProfileComponent,
    DriverVehiclesDetailComponent,
    DriverRideRequestComponent,
    DriverRideDetailComponent,
    DriverRouteComponent,
    DriverMessagesComponent,
    DriverMessageDetailComponent,
    DriverSidebarComponent,
    DriverRouteDetailComponent,
    RiderMessageDetailComponent,
    TripHistoryComponent,
    TripDetailComponent,
    AdminSidebarComponent,
    ManageUserComponent,
    ManageDriverComponent,
    AddDriverRouteComponent,
    ManageBookingsComponent,
    AdminRiderDetailComponent,
    AdminDriverDetailComponent,
    AddDriverSchoolRouteComponent,
    ContactUsComponent,
    GeneralInfoComponent,
    DriverProfileDetailComponent,
    GeneralInfoDumbComponent,
    AdminDashboardComponent,
    AdminBookingDetailComponent,
    ContactUsDetailComponent,
    DriverSchoolRouteComponent,
    DriverPersonalInfoComponent
  ],
  providers: [
    UserAuthGuard,
    NgxImageCompressService
  ]
})
export class UsersModule { }
