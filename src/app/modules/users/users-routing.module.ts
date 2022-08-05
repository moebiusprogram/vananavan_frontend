import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserAuthGuard } from 'src/app/core/guards/user-auth.guard';

import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './profile/settings/settings.component';
import { MessagesComponent } from './profile/messages/messages.component';
import { BookingsComponent } from './profile/bookings/bookings.component';
import { RiderDashboardSidebarComponent } from './rider/dashboard/rider-dashboard/rider-dashboard-sidebar/rider-dashboard-sidebar.component';
import { RiderProfileComponent } from './rider/dashboard/rider-dashboard/rider-profile/rider-profile.component';
import { RiderMessagesComponent } from './rider/dashboard/rider-dashboard/rider-messages/rider-messages.component';
import { RiderMyRequestComponent } from './rider/dashboard/rider-dashboard/rider-my-request/rider-my-request.component';
import { RiderMyBookingsComponent } from './rider/dashboard/rider-dashboard/rider-my-bookings/rider-my-bookings.component';
import { DriverDashboardComponent } from './driver/driver-dashboard/driver-dashboard/driver-dashboard.component';
import { RiderSearchRideComponent } from './rider/find-ride/search-ride/rider-search-ride/rider-search-ride.component';
import { RideDetailComponent } from './rider/find-ride/available-ride/ride-detail/ride-detail.component';
import { DriverMessagesComponent } from './driver/driver-messages/driver-messages/driver-messages.component';
import { DriverProfileComponent } from './driver/driver-profile/driver-profile/driver-profile.component';
import { DriverRouteComponent } from './driver/driver-route/driver-route/driver-route.component';
import { DriverRideRequestComponent } from './driver/ride-request-trip-history/driver-ride-request/driver-ride-request.component';
import { DriverVehiclesDetailComponent } from './driver/driver-vehicle-detail/driver-vehicles-detail/driver-vehicles-detail.component';
import { TripHistoryComponent } from './driver/trip-history/trip-history/trip-history.component';
import { ManageUserComponent } from './admin/manage-user/manage-user.component';
import { ManageDriverComponent } from './admin/manage-driver/manage-driver.component';
import { AdminSidebarComponent } from './admin/admin-sidebar/admin-sidebar.component';
import { AddDriverRouteComponent } from './driver/driver-route/add-driver-route/add-driver-route.component';
import { ManageBookingsComponent } from './admin/manage-bookings/manage-bookings/manage-bookings.component';
import { DriverDetailComponent } from './rider/find-ride/available-ride/ride-detail/driver-detail/driver-detail.component';
import { AdminDriverDetailComponent } from './admin/manage-driver/admin-driver-detail/admin-driver-detail.component';
import { AdminRiderDetailComponent } from './admin/manage-user/admin-rider-detail/admin-rider-detail.component';
import { AddDriverSchoolRouteComponent } from './driver/driver-route/add-driver-school-route/add-driver-school-route.component';
import { ContactUsComponent } from './shared-modules/contact-us/contact-us.component';
import { GeneralInfoComponent } from './shared-modules/general-info/general-info.component';
import { DriverProfileDetailComponent } from './rider/dashboard/rider-dashboard/driver-profile-detail/driver-profile-detail.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { AdminBookingDetailComponent } from './admin/manage-bookings/manage-bookings/admin-booking-detail/admin-booking-detail.component';
import { DriverSchoolRouteComponent } from './driver/driver-route/driver-school-route/driver-school-route.component';
import { DriverPersonalInfoComponent } from './driver/driver-personal-info/driver-personal-info.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
      },
    ]
  },
  {
    path: 'rider',
    children: [
      {
        path: 'profile',
        component: RiderProfileComponent,
      },
      {
        path: 'messages',
        component: RiderMessagesComponent,
      },
      {
        path: 'my-request',
        component: RiderMyRequestComponent,
      },
      {
        path: 'my-bookings',
        component: RiderMyBookingsComponent,
      },
      {
        path: 'available-ride',
        component: RideDetailComponent
      },
      {
        path: 'search-ride',
        component: RiderSearchRideComponent
      },
      {
        path: 'driver-profile',
        component: DriverProfileDetailComponent
      }
    ]
  },
  {
    path: 'driver',
    children: [
      {
        path: 'dashboard',
        component: DriverDashboardComponent
      },
      {
        path: 'messages',
        component: DriverMessagesComponent
      },
      {
        path: 'profile',
        component: DriverProfileComponent
      },
      {
        path: 'my-route',
        component: DriverRouteComponent
      },
      {
        path: 'booking-route',
        component: DriverRouteComponent
      },
      {
        path: 'school-route',
        component: DriverSchoolRouteComponent
      },
      {
        path: 'ride-request',
        component: DriverRideRequestComponent
      },
      {
        path: 'trip-history',
        component: TripHistoryComponent
      },
      {
        path: 'vehicles-detail',
        component: DriverVehiclesDetailComponent
      },
      {
        path: 'add-driver-route',
        component: AddDriverRouteComponent
      },
      {
        path: 'add-school-route',
        component: AddDriverSchoolRouteComponent
      },
      {
        path: "personal-info",
        component: DriverPersonalInfoComponent
      },
    ]
  },
  {
    path: 'admin',
    children: [
      {
        path: 'user',
        component: ManageUserComponent
      },
      {
        path: 'driver',
        component: ManageDriverComponent
      },
      {
        path: 'bookings',
        component: ManageBookingsComponent
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'rider-detail',
        component: AdminRiderDetailComponent
      },
      {
        path: 'driver-detail',
        component: AdminDriverDetailComponent
      },
      {
        path: 'booking-detail',
        component: AdminBookingDetailComponent
      }
    ]
  },
  {
    path: '',
    children: [
      {
        path: 'contact',
        component: ContactUsComponent
      },
      {
        path: 'general-info',
        component: GeneralInfoComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
  static component = [
    HomeComponent,
    ProfileComponent,
    SettingsComponent,
    MessagesComponent,
    BookingsComponent,
    RiderProfileComponent,
    RiderMyBookingsComponent,
    RiderMyRequestComponent,
    RiderMessagesComponent,
    DriverVehiclesDetailComponent,
    ManageUserComponent,
    ManageDriverComponent,
    AdminSidebarComponent
  ]
}
