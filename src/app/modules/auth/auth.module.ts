import { LayoutsModule } from './../../core/layouts.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';

import { AuthRoutingModule } from './auth-routing.module';
import { environment } from 'src/environments/environment';

import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import { GoogleLoginProvider, FacebookLoginProvider } from 'angularx-social-login';
import { RiderDumbComponent } from './shared-dumb-component/rider-dumb/rider-dumb/rider-dumb.component';
import { DriverDumbComponent } from './shared-dumb-component/driver-dumb/driver-dumb/driver-dumb.component';
import { ForgetPasswordComponent } from './shared-forget-password/rider-forget-password/forget-password.component';
import { AdminLoginComponent } from './admin-login/admin-login/admin-login.component';

const config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider(environment.googleClientId)
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider(environment.facebookAppId)
  }
]);
//  auth_type: 'reauthenticate',
export function provideConfig() {
  return config;
}

@NgModule({
  declarations: [
    AuthRoutingModule.component,
    ForgetPasswordComponent,
    RiderDumbComponent,
    DriverDumbComponent,
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    LayoutsModule,
    SocialLoginModule,
    ImageCropperModule
  ],
  providers: [
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ]
})
export class AuthModule { }
