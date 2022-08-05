import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { appToaster } from 'src/app/configs';


@Injectable({
  providedIn: 'root'
})
export class DriverService {

  public selectedRideAndTrip = new BehaviorSubject(null);
  public selectedTripHistory = new BehaviorSubject(null);
  public updateProfilePicture = new BehaviorSubject(null);
  public driverProfile = new BehaviorSubject(null);
  public driverVehicleDetail = new BehaviorSubject(null);
  constructor(
    private http: HttpClient,
    private toaster: ToastrService
  ) {
  }

  getUpdatedVehicleDetail(): Observable<any> {
    return this.driverVehicleDetail.asObservable();
  }
  getUpdatedProfile(): Observable<any> {
    return this.driverProfile.asObservable();
  }

  getSelectedRide(): Observable<any> {
    return this.selectedRideAndTrip.asObservable();
  }

  getSelectedTripHistroy(): Observable<any> {
    return this.selectedTripHistory.asObservable();
  }

  getDriverProfilePicture(): Observable<any> {
    return this.updateProfilePicture.asObservable();
  }

  getDriverDetail(): Observable<any> {
    const href = `${environment['getDriverDetail']}`;
    return this.http.get<any>(href, { params: { section: '1' } }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }


  getAvailableLanguages(): Observable<any> {
    const href = `${environment['getAvailableLanguage']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  // postDriverdetail(formValue: object): Observable<any> {
  //   const href = `${environment['getDriverDetail']}`;
  //   return this.http.get<any>(href, {params: { section: '1'}}).pipe(map((data: any) => {
  //     if (data.status === 'success') {
  //       return data.response;
  //     }
  //   }));
  // }

  // postDriverdetail(formValue: object): Observable<any> {
  //   const href = `${environment['getDriverDetail']}`;
  //   return this.http.get<any>(href, {params: { section: '1'}}).pipe(map((data: any) => {
  //     if (data.status === 'success') {
  //       return data.response;
  //     }
  //   }));
  // }

  postDriverdetail(formValue: object): Observable<any> {
    const href = `${environment['postDriverProfile']}`;
    return this.http.post<any>(href, formValue).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.toaster.success('Profile successfully updated.')
        return data.response;
      }
    }));
  }

  postDriverImage(formData): Observable<any> {
    const href = `${environment['postDriverImage']}`;
    return this.http.post<any>(href, formData).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  postDriverDocument(document): Observable<any> {
    const href = `${environment['postDriverProfile']}`;
    return this.http.post<any>(href, document).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getVehicleDetail(section): Observable<any> {
    const href = `${environment['getDriverDetail']}`;
    return this.http.get<any>(href, { params: section }).pipe(map((data: any) => {
      if (data.status === 'success') {
        // this.toaster.success(appToaster.successHead, 'Details saved successfully."')
        return data.response;
      }
    }))
  }

  updateVehicleDetail(toUpdate): Observable<any> {
    const href = `${environment['postDriverProfile']}`;
    return this.http.post<any>(href, toUpdate).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.toaster.success('Vehicle details successfully updated.')
        return data.response;
      }
    }))
  }

  getRideRequestTripHistory(toSend): Observable<any> {
    const href = `${environment['requestAndTripHistory']}`;
    return this.http.get<any>(href, { params: toSend }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  getDriverTripHistory(): Observable<any> {
    const href = `${environment['getDriverTripHistory']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status == 'success') {
        return data.response;
      }
    }))
  }

  deleteDriverRoute(routeId): Observable<any> {
    const href = `${environment['deleteRoute']}`;
    return this.http.post<any>(href, routeId).pipe(map((data: any) => {
      if (data.status == 'success') {
        this.toaster.success(appToaster.successHead, 'Route removed successfully.')
        return data.response;
      }
    }))
  }

  clearNotificationStatus(toSend): Observable<any> {
    const href = `${environment['clearNotification']}`;
    return this.http.post<any>(href, toSend).pipe(map((data: any) => {
      if (data.status == 'success') {
        return data.response;
      }
    }))
  }

  postDriverInfo(formData): Observable<any> {
    const href = `${environment['driverInfo']}`;
    return this.http.post<any>(href, formData).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  driverDeleteImage(image): Observable<any> {
    const href = `${environment['driverDeleteImage']}`;
    return this.http.post<any>(href, image).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

}