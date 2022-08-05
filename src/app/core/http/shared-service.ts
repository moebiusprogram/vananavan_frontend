import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { AuthenticationService } from '../authentication/authentication.service';


@Injectable({
  providedIn: 'root'
})
export class SharedService {

  public currentLocationLatLong = new BehaviorSubject(null);
  constructor(
    private http: HttpClient,
  ) { }

  setCurrentLocation(data) {
    this.currentLocationLatLong.next(data);
    if (data) {
      sessionStorage.setItem('CURRENT_LOCATION',
        JSON.stringify({
          latitude: data.latitude, longitude: data.longitude
        }));
    }
  }

  getCurrentLocation(): Observable<any> {
    return this.currentLocationLatLong.asObservable();
  }

  getUserProfile(): Observable<any> {
    const href = `${environment['riderProfile']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  updateDeclineRequest(toSend): Observable<any> {
    const href = `${environment['updateDeclineRequest']}`;
    return this.http.post<any>(href, toSend).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  saveContactDetail(detail): Observable<any> {
    const href = `${environment['saveContactDetail']}`;
    return this.http.post<any>(href, detail).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

}