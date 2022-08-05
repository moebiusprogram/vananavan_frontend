import { Injectable } from '@angular/core';
import { AuthenticationService } from '../authentication/authentication.service';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { catchError, map, tap, debounce } from 'rxjs/operators';
import { of as observableOf, Observable, Subject, BehaviorSubject } from 'rxjs';
import * as io from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { appToaster } from 'src/app/configs';

@Injectable({
  providedIn: 'root'
})
export class SharedChatService {

  // Rider Behaviour Subject
  public updateDriverUnreadCount = new BehaviorSubject(null);
  public updateDriverTopMsg = new BehaviorSubject(null);
  public selectedRider = new BehaviorSubject(null);
  public onEventUnreadCount = new BehaviorSubject(null);
  public riderStatusChanged = new BehaviorSubject(null);
  public clearRiderMsgNotification = new BehaviorSubject(false);

  // Driver Behavior Subject
  public updateRiderUnreadCount = new BehaviorSubject(null);
  public updateRiderTopMsg = new BehaviorSubject(null);
  public selectedDriver = new BehaviorSubject(null);
  public onDriverEventUnreadCount = new BehaviorSubject(null);
  public driverStatusChanged = new BehaviorSubject(null);
  public clearDriverMsgNotification = new BehaviorSubject(false);
  public clearDriverReqNotification = new BehaviorSubject(false);

  private socket: SocketIOClient.Socket;
  private userId: string;
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService,
    private toasterService: ToastrService,
  ) { }

  /**
   * Driver Observable Functions
   */
  getDriverUnreadCount(): Observable<any> {
    return this.updateDriverUnreadCount.asObservable();
  }
  getUpdatedDriverTopMsg(): Observable<any> {
    return this.updateDriverTopMsg.asObservable();
  }

  getUpdatedActiveRider(): Observable<any> {
    return this.selectedRider.asObservable();
  }
  getOnEventUnreadCount(): Observable<any> {
    return this.onEventUnreadCount.asObservable();
  }
  driverOnEventUnreadCount(): Observable<any> {
    return this.onDriverEventUnreadCount.asObservable();
  }
  getDriverChangedStatus(): Observable<any> {
    return this.driverStatusChanged.asObservable();
  }
  driverUpdatedMsgNotification(): Observable<any> {
    return this.clearDriverMsgNotification.asObservable();
  }
  driverUpdatedReqNotification(): Observable<any> {
    return this.clearDriverReqNotification.asObservable();
  }
  /**
   * Driver Observable Function Ends
   */

  /**
   * Rider Observable Function Ends
   */
  getRiderUnreadCount(): Observable<any> {
    return this.updateRiderUnreadCount.asObservable();
  }
  getUpdatedRiderTopMsg(): Observable<any> {
    return this.updateRiderTopMsg.asObservable();
  }

  getUpdatedActiveDriver(): Observable<any> {
    return this.selectedDriver.asObservable();
  }
  getRiderChangedStatus(): Observable<any> {
    return this.riderStatusChanged.asObservable();
  }
  riderUpdatedMsgNotification(): Observable<any> {
    return this.clearRiderMsgNotification.asObservable();
  }
  /**
 * Rider Observable Function Ends
 */

  connectUser() {
    this.authService.getUserInfo().subscribe(data => {
      if (data) {
        this.userId = data._id;
      }
    });
    if (this.userId) {
      this.socket = io(environment.host, { query: { userId: this.userId } });
    }
  }

  joinRoom(data) {
    this.socket.emit('join', data);
  }

  onNewUserJoin() {
    return Observable.create(observer => {
      this.socket.on('new user joined', msg => {
        observer.next(msg);
      })
    })
  }

  disconnectUser(status: number) {
    let userId;
    this.authService.getUserInfo().subscribe(data => {
      userId = data._id;
    });
    if (this.socket === undefined || this.socket === null) {
      this.socket = io(environment.host, { query: { userId: this.userId } });
    }
    this.socket.emit('disconnecting', { userId, status });
  }

  onStatusChange() {
    return Observable.create(observer => {
      this.socket.on('userStatus', msg => {
        observer.next(msg);
      })
    })
  }

  sendMessage(msg: object) {
    console.log(msg, 'TO SEND')
    this.socket.emit('sendMessage', msg);
  }

  sendQuote(msg: object) {
    this.socket.emit('sendCard', msg);
  }

  acceptDeclineQuote(msg: object) {
    this.socket.emit('accpetDeclineQuote', msg);
  }

  onAcceptDecline() {
    return Observable.create(observer => {
      this.socket.on('accpetDeclineQuoteEvent', msg => {
        console.log(msg, '**********')
        observer.next(msg);
      })
    })
  }

  onNewMessage() {
    return Observable.create(observer => {
      this.socket.on('newMessage', msg => {
        console.log(msg, 'NEW MSG')
        observer.next(msg);
      })
    })
  }

  onBiddingMessage() {
    return Observable.create(observer => {
      this.socket.on('biddingMessage', msg => {
        if (msg.error) {
          this.toasterService.error(appToaster.errorHead, msg.error)
          return false;
        }
        observer.next(msg);
      })
    })
  }

  getAllMessage(toId): Observable<any> {
    const href = `${environment['getAllMessage']}`;
    return this.http.get<any>(href, { params: toId }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }));
  }

  getAllTopMessages(): Observable<any> {
    const href = `${environment['getTopMessages']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  searchRiderDriver(toSend): Observable<any> {
    const href = `${environment['searchChatUser']}`;
    return this.http.get<any>(href, { params: toSend }).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  requestNotification() {
    return Observable.create(observer => {
      this.socket.on('newRequest', data => {
        observer.next(data);
      })
    })
  }

  getNotificationStatus(): Observable<any> {
    const href = `${environment['notificationStatus']}`;
    return this.http.get<any>(href).pipe(map((data: any) => {
      if (data.status === 'success') {
        return data.response;
      }
    }))
  }

  resetActiveUserCounts(id): Observable<any> {
    const href = `${environment['resetActiveCounts']}`;
    return this.http.post<any>(href, id).pipe(map((data: any) => {
      if (data.status == 'success') {
        return data.response;
      }
    }));
  }
}
