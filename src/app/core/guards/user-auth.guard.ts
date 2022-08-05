import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';

// import { LoggerService } from '../services/logger.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { ToastrService } from 'ngx-toastr';

import { appToaster } from 'src/app/configs';


@Injectable()
export class UserAuthGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    // private logger: LoggerService,
    private toasterService: ToastrService,
    private authenticationService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.chekUser(route, state);

  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    return this.chekUser(route, state);
  }

  private chekUser(route, state): boolean {
    const userType = this.authenticationService.getUserType();
    const isLogin = this.authenticationService.isLogin();
    // userType === 'client' &&
    if (isLogin) {
      return true;
    } else if (isLogin) {
      this.toasterService.error(appToaster.errorHead, 'Unauthorized: Access is denied');
      this.router.navigate(['/client/dashboard']);

      this.router.navigateByUrl('/auth/403');
      return false;
    } else {

      // this.logger.log('Not authenticated, redirecting...');
      this.router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
      return false;
    }
  }
}

