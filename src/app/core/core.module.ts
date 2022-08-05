import { FormsModule } from '@angular/forms';
import { AuthenticationService } from './authentication/authentication.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ApiPrefixInterceptor, ErrorHandlerInterceptor, HttpTokenInterceptor, LoaderInterceptor } from './interceptors';
import { UsersService, LoaderService } from './services';

const PROVIDERS = [
  AuthenticationService,
  UsersService,
  LoaderService,
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ApiPrefixInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ErrorHandlerInterceptor,
    multi: true
  },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: HttpTokenInterceptor,
    multi: true
  },
  // {
  //   provide: HTTP_INTERCEPTORS,
  //   useClass: LoaderInterceptor,
  //   multi: true
  // }
];


const BASE_MODULES = [
  CommonModule,
  HttpClientModule,
  FormsModule
]

@NgModule({
  declarations: [],
  imports: [
    ...BASE_MODULES
  ],
  providers: [
    ...PROVIDERS
  ]
})
export class CoreModule { }
