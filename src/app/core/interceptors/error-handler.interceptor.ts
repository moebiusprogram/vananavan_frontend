import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { UNAUTHORIZED, BAD_REQUEST, FORBIDDEN, UNPROCESSABLE_ENTITY } from 'http-status-codes';

// import { LoggerService } from '../services/logger.service';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { appToaster } from './../../configs/toaster.config';


/**
 * Adds a default error handler to all requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  constructor(
    // private logger: LoggerService,
    private toasterService: ToastrService,
    private router: Router
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(error => this.errorHandler(error)));
  }

  // Customize the default error handler here if needed
  private errorHandler(response: HttpEvent<any>): Observable<HttpEvent<any>> {
    if (!environment.production) {
      // Do something with the error
      // this.logger.logError('Request error ' + JSON.stringify(response));
    }

    // console.error(error);
    const httpErrorCode = response['status'];
    const error = response['error']
    switch (httpErrorCode) {
      case 401:
        this.toasterService.error( appToaster.errorHead, 'Token expired please re-login');
        this.router.navigateByUrl('/auth/login');
        break;
      case FORBIDDEN:
        this.router.navigateByUrl('/auth/403');
        break;
      case 422:
        this.showError(error);
        break;
      // case BAD_REQUEST:
      //    this.showError(error.message);
      //     break;
      default:
        this.toasterService.error(response['response']);
    }


    throw response;
  }

  private showError(message: any): boolean {
    const parseMsg = message;
    if (parseMsg.response && typeof parseMsg.response == 'string') {
      this.toasterService.error(parseMsg.response);
      return true;
    }

    if (parseMsg.errors && typeof parseMsg.errors == 'object') {
      let popMsg = '';
      parseMsg.errors.forEach(msg => {
        if(msg)
        popMsg = popMsg.concat( `${msg.msg}\n`);
      });
      console.log(popMsg)
      this.toasterService.error(popMsg);

      return true;
    }

    return false;
  }

}

