import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap, debounce } from 'rxjs/operators';
import { of as observableOf, Observable, Subject, BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client';

import { environment } from '../../../environments/environment';

import { Login } from '../../shared/models/login.model';
import { AuthenticationService } from '../authentication/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { appToaster } from 'src/app/configs';

const credentialsKey = 'currentUser';


@Injectable({
  providedIn: 'root'
})
export class RiderService {

  public updatedUserProfile = new BehaviorSubject(null);
  public selectedBooking = new BehaviorSubject(null);
  public selectedRequest = new BehaviorSubject(null);
  public cancelRequest = new BehaviorSubject(null);

  public selectedDriver = new BehaviorSubject(null);
  public afterReviewBooking = new BehaviorSubject(null);
  public isRidesChanged = new BehaviorSubject(false);

  private socket: SocketIOClient.Socket;
  private userId: string;
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private toasterService: ToastrService,
  ) {
  }
  getUpdatedUserProfile(): Observable<any> {
    return this.updatedUserProfile.asObservable();
  }
  getReviewedBooking(): Observable<any> {
    return this.afterReviewBooking.asObservable();
  }
  getSelectedRequest(): Observable<any> {
    return this.selectedRequest.asObservable();
  }

  getCancelledRequest(): Observable<any> {
    return this.cancelRequest.asObservable();
  }

  getAvailableRideAndEvents(credential): Observable<any> {
    let allDrivers = JSON.parse(sessionStorage.getItem(credential)) || null;
    return observableOf(allDrivers);
  }

  setAvailableRide(data, credential) {
    sessionStorage.setItem(credential, JSON.stringify(data));
  }

  removeAllDriversAndEvents(credential) {
    sessionStorage.removeItem(credential);
    return observableOf(true);
  }

  getSelectedDriver(): Observable<any> {
    return this.selectedDriver.asObservable();
  }

  checkIsRidesChanged(): Observable<any> {
    return this.isRidesChanged.asObservable();
  }

  postRiderProfile(formValue): Observable<any> {
    const href = `${environment['riderProfile']}`;
    return this.http.post<any>(href, formValue).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.toasterService.success('Profile successfully updated.');
        this.authService.setUser(data.response);
        this.updatedUserProfile.next(data.response);
        return data.response;
      }
    }));
  }

  getAllBookings(toSend): Observable<any> {
    const href = `${environment['getRiderBookings']}${toSend.type}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  postDriverRating(toSend: object): Observable<any> {
    const href = `${environment['postDriverRating']}`;
    return this.http.post<any>(href, toSend).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  getRiderRequest(toSend): Observable<any> {
    const href = `${environment['getRiderRequest']}${toSend.requestType}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  cancelRiderRequest(toSend): Observable<any> {
    const href = `${environment['cancelRiderRequest']}${toSend.id}`;
    return this.http.post<any>(href, toSend).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  searchRide(toSend): Observable<any> {
    const href = `${environment['searchRide']}`;
    return this.http.get<any>(href, { params: toSend }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  bookOtherEvent(toSend): Observable<any> {
    const href = `${environment['bookEvent']}`;
    return this.http.post<any>(href, toSend).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.toasterService.success(
          'We have successfully placed a booking request to all nearby drivers, they will be contacting you shortly!');
        return data.response;
      }
    }))
  }

  getDriverResponse(paramsToSend): Observable<any> {
    const href = `${environment['geDriverResonse']}`;
    return this.http.get<any>(href, { params: paramsToSend }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  getDriverDetail(driverId): Observable<any> {
    const href = `${environment['getRiderDriverDetail']}`;
    return this.http.get<any>(href, { params: driverId }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getSchoolByName(searchString): Observable<any> {
    const href = `${environment['getSchoolByName']}`;
    return this.http.get<any>(href, { params: searchString }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

}