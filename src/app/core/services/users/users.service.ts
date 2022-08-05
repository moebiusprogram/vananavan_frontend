import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable,BehaviorSubject } from 'rxjs';

import { AuthenticationService } from 'src/app/core/authentication/authentication.service';

import { environment } from 'src/environments/environment';
import { Register } from 'src/app/shared';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usernameSource = new BehaviorSubject('Onejohi Tony');
  username = this.usernameSource.asObservable()
  constructor(
    private http: HttpClient,
    private authenticationService: AuthenticationService
  ) { }

  // registerUser(data: Register): Observable<any> {
  //   const href = `${environment.register}`;
  //   return this.http.post<any>(href, data).pipe(
  //     tap(
  //       (data) => {
  //         if (data.status === 'success') {
  //           this.authenticationService.setUser(data.response);
  //         }
  //         return data;
  //       }
  //     )
  //   );
  // }

  // postOccupancyApplication(data: OccupancyApplication): Observable<any> {
  //   const href = `${environment.application}`;
  //   return this.http.post<any>(href, data).pipe(
  //     tap(
  //       (data) => {
  //         if (data.status === 'success') {
  //         }
  //         return data;
  //       }
  //     )
  //   );
  // }

  saveLantLongAndStep(data): Observable<any> {
    const href = `${environment['saveLatLongAndStep']}`;
    return this.http.post<any>(href, data).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
          }
          return data;
        }
      )
    );
  }

   saveSchoolRoute(data): Observable<any> {
    const href = `${environment['saveSchoolRoute']}`;
    return this.http.post<any>(href, data).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
          }
          return data;
        }
      )
    );
  }



  getRoute(type): Observable<any> {
    const href = `${environment['getRoute']}`;
    return this.http.get<any>(href, {params: type}).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
          }
          return data;
        }
      )
    );
  }


  getDashBoardData(): Observable<any> {
    const href = `${environment['dashBoard']}`;
    return this.http.get<any>(href).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
          }
          return data;
        }
      )
    );
  }


  isApplicationEditable(): boolean {
    return false;
  }

  changeUsername(username: string) {
    this.usernameSource.next(username);
  }
}
