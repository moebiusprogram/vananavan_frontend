/**
 * API URLS
 */
class UrlHelper {
  private authPrefix = '/auth/front';
  private riderPrefix = '/front/rider';
  private driverPrefix = '/front/driver';
  private adminPrefix = '/front/admin';
  private sharedPrefix = '/front';

  getAuthUrl(urls: object) {
    const updatedUrl = {};
    for (const url in urls) {
      if (url) {
        updatedUrl[url] = this.authPrefix + urls[url];
      }
    }
    return updatedUrl;
  }

  getDriverUrl(urls: object) {
    const updatedUrl = {};
    for (let url in urls) {
      if (url) {
        updatedUrl[url] = this.driverPrefix + urls[url];
      }
    }
    return updatedUrl;
  }

  getRiderUrl(urls: object) {
    const updatedUrl = {};
    for (const url in urls) {
      if (url) {
        updatedUrl[url] = this.riderPrefix + urls[url];
      }
    }
    return updatedUrl;
  }

  getSharedUrl(urls: object) {
    const updatedUrl = {};
    for (const url in urls) {
      if (url) {
        updatedUrl[url] = this.sharedPrefix + urls[url];
      }
    }
    return updatedUrl;
  }

  getAdminUrl(urls: object) {
    const updatedUrl = {};
    for (const url in urls) {
      if (url) {
        updatedUrl[url] = this.adminPrefix + urls[url];
      }
    }
    return updatedUrl;
  }
}



const authUrl = {
  riderLogin: `/login`,
  driverLogin: `/login`,
  adminLogin: `/admin-login`,
  riderRegistration: `/register`,
  forgetPassword: `/forget-password`,
};

const riderUrl = {
  riderProfile: '/profile/update',
  testRider: '/test-socket',
  getAllMessage: '/profile/messages',
  getTopMessages: '/top/messages',
  updateUnreadMessage: '/update/unread-message',
  getRiderBookings: '/profile/bookings/',
  postDriverRating: '/profile/review-rating',
  getRiderRequest: '/profile/my-request/',
  cancelRiderRequest: '/profile/my-request/cancel/',
  bookEvent: '/send-event-request',
  geDriverResonse: '/get-driver-response',
  getRiderDriverDetail: '/driver-detail',
  getSchoolByName: '/school-by-name'
}

const driverUrl = {
  searchRide: '',
  getAvailableLanguage: '/available-languages',
  getDriverDetail: '/profile',
  postDriverProfile: '/update-profile',
  requestAndTripHistory: '/my-request',
  getDriverTripHistory: '/trip-history',
  saveLatLongAndStep: `/route`,
  saveSchoolRoute: '/school-route',
  getRoute: `/route`,
  dashBoard: `/get-driver-dashboard`,
  postDriverImage: '/profile-image',
  deleteRoute: '/delete-route',
  clearNotification: '/clear-notification-status',
  driverInfo: '/personal-info',
  driverDeleteImage: '/delete-image'
}

const adminUrl = {
  getUserList: '/get-user-list',
  getDriverList: '/get-driver-list',
  getAdminBooking: '/bookings',
  getAdminDriverDetail: '/driver-detail',
  riderDetail: '/rider-detail',
  filterBookings: '/filter-bookings',
  manageUserPermissions: "/manage-users",
  getDashboardCounts: "/dashboard",
  adminBookingDetail: "/get-booking-detail"
}

const sharedUrl = {
  searchChatUser: '/search-chat-user',
  updateDeclineRequest: '/accept-decline-ride',
  notificationStatus: '/notification-status',
  saveContactDetail: '/save-contact-detail',
  resetActiveCounts: '/reset-unread-counts'
}

const urlHelperClass = new UrlHelper();
export const urls = {
  ...urlHelperClass.getAuthUrl(authUrl),
  ...urlHelperClass.getRiderUrl(riderUrl),
  ...urlHelperClass.getDriverUrl(driverUrl),
  ...urlHelperClass.getAdminUrl(adminUrl),
  ...urlHelperClass.getSharedUrl(sharedUrl)
};

export const assetsUrl = {
  imageBaseUrl: "/images/"
}

