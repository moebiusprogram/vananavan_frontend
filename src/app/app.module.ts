import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


import { LayoutsModule } from './core/layouts.module';
import { UsersRoutingModule } from './modules/users/users-routing.module';
import { CoreModule } from './core/core.module';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ToastrModule } from 'ngx-toastr';
import { NgxUiLoaderModule, NgxUiLoaderRouterModule, NgxUiLoaderHttpModule } from 'ngx-ui-loader';
import { CookieService } from 'ngx-cookie-service';
import { PickerModule } from '@ctrl/ngx-emoji-mart';
import { SocialLoginModule, AuthServiceConfig } from 'angularx-social-login';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { provideConfig } from './modules/auth/auth.module';

const TOASTR_OPTIONS = {
  timeOut: 10000,
  positionClass: 'toast-top-right',
  preventDuplicates: true,
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule,
    LayoutsModule,
    ToastrModule.forRoot(TOASTR_OPTIONS),
    NgxUiLoaderModule,
    NgxUiLoaderRouterModule,
    NgxUiLoaderHttpModule,
    ReactiveFormsModule,
    PickerModule,
    SocialLoginModule,
    TooltipModule,
    BsDatepickerModule.forRoot()
  ],
    providers: [
    CookieService,
    {
      provide: AuthServiceConfig,
      useFactory: provideConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
