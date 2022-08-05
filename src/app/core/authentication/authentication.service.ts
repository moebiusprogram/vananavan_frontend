import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap, debounce } from 'rxjs/operators';
import { of as observableOf, Observable, Subject } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Login } from '../../shared/models/login.model';
const credentialsKey = 'currentUser';

@Injectable()
export class AuthenticationService {
  public showForgetPasswordForm = new Subject<boolean>();
  public showLoginForm = new Subject<boolean>();

  constructor(private http: HttpClient) {
  }

  riderLogin(loginData: Login): Observable<any> {
    const href = `${environment['riderLogin']}`;
    console.log(href)
    return this.http.post<any>(href, loginData).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
            const storage = localStorage;
            storage.setItem(credentialsKey, JSON.stringify(data.response));
          }
          return data;
        }
      )
    );
  }

  adminLogin(loginData: Login): Observable<any> {
    const href = `${environment['adminLogin']}`;
    console.log(href)
    return this.http.post<any>(href, loginData).pipe(
      tap(
        (data) => {
          if (data.status === 'success') {
            const storage = localStorage;
            storage.setItem(credentialsKey, JSON.stringify(data.response));
          }
          return data;
        }
      )
    );
  }

  logout(): Observable<boolean> {
    sessionStorage.removeItem(credentialsKey);
    localStorage.removeItem(credentialsKey);
    return observableOf(true);
  }

  getUserInfo(): Observable<any> {
    const savedCredentials = this.getUser();
    return observableOf(savedCredentials);
  }

  isLogin() {
    if (localStorage.getItem(credentialsKey)) {
      return true;
    }
    return false;

  }

  getToken() {
    const savedCredentials = this.getUser();
    return savedCredentials && savedCredentials['tokens'];
  }

  getUserRole(): Observable<any> {
    const savedCredentials = this.getUser();
    return observableOf(savedCredentials['role']);
  }

  getUserType() {
    const savedCredentials = this.getUser();
    if (this.isLogin()) {
      return savedCredentials['role'];
    } else {
      return false;
    }


  }

  private getUser() {
    const savedCredentials = sessionStorage.getItem(credentialsKey) || localStorage.getItem(credentialsKey);
    return JSON.parse(savedCredentials);
  }

  setUser(user: any): void {
    localStorage.setItem(credentialsKey, JSON.stringify(user));
  }

  loginBySocial(user: object): Observable<any> {
    const href = `${environment['riderLogin']}`
    return this.http.post<any>(href, user).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.setUser(data.response);
        return data.response;
      }
    }));
  }

  registrationByEmail(formValue: object): Observable<any> {
    const href = `${environment['riderRegistration']}`;
    return this.http.post<any>(href, formValue).pipe(map((data: any) => {
      if (data.status === 'success') {
        this.setUser(data.response);
        return data.response;
      }
    }));
  }

  forgetPassword(formValue: object): Observable<any> {
    const href = `${environment['forgetPassword']}`;
    return this.http.post<any>(href, formValue).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }


}

