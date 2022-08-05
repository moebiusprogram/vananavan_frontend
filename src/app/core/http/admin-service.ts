import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(
    private http: HttpClient
  ) {
  }

  getUserList(pagination): Observable<any> {
    const href = `${environment['getUserList']}`;
    return this.http.get<any>(href, { params: pagination }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getDriverList(pagination): Observable<any> {
    const href = `${environment['getDriverList']}`;
    return this.http.get<any>(href, { params: pagination }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getAdminBookings(pagination): Observable<any> {
    const href = `${environment['getAdminBooking']}`;
    return this.http.get<any>(href, { params: pagination }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getDriverDetail(driverId): Observable<any> {
    const href = `${environment['getAdminDriverDetail']}`;
    return this.http.get<any>(href, { params: driverId }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getRiderDetail(riderDetail): Observable<any> {
    const href = `${environment['riderDetail']}`;
    return this.http.get<any>(href, { params: riderDetail }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  filterBookings(filterBy): Observable<any> {
    const href = `${environment['filterBookings']}`;
    return this.http.get<any>(href, { params: filterBy }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  manageUserPermission(permissions): Observable<any> {
    const href = `${environment['manageUserPermissions']}`;
    return this.http.post<any>(href, permissions).pipe(map((data: any) => {
      if (data.status == 'success') {
        return data.response;
      }
    }))
  }

  getDashBoardCounts(): Observable<any> {
    const href = `${environment['getDashboardCounts']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getAdminBookingDetail(tripId): Observable<any> {
    const href = `${environment['adminBookingDetail']}`;
    return this.http.get<any>(href, {params: tripId}).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

}