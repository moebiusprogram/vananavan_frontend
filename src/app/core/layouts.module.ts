
/** MODUELS */
import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
/** END MODUELS */

/** COMPONENTS */
import { LayoutComponent } from './layouts/users/layout/layout.component';
import { HeaderComponent } from './layouts/users/header/header.component';
import { FooterComponent } from './layouts/users/footer/footer.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthHeaderComponent } from './layouts/auth-layout/auth-header/auth-header.component';
import { AuthFooterComponent } from './layouts/auth-layout/auth-footer/auth-footer.component';
import { OnlyNumber } from './directives/only-number';
import { DriverHeaderComponent } from './layouts/drivers/driver-header/driver-header/driver-header.component';
import { WhiteSpace } from './directives/white-space';
import { GoogleAutoComplete } from './directives/google-autocomplete';
import { DriverLayoutComponent } from './layouts/drivers/driver-layout/driver-layout/driver-layout.component';
import { AdminAuthLayoutComponent } from './layouts/admin-auth-layout/admin-auth-layout/admin-auth-layout.component';
import { AdminAuthHeaderComponent } from './layouts/admin-auth-layout/admin-auth-layout/admin-auth-header/admin-auth-header.component';
import { AdminHeaderComponent } from './layouts/admin/admin-header/admin-header.component';
import { AdminLayoutComponent } from './layouts/admin/admin-layout/admin-layout.component';
import { GoogleCityAutoComplete } from './directives/google-city-autocomplete';
import { GoogleSchoolAutocomplete } from './directives/google-school-autocomplete';
/** End COMPONENTS */


const COMPONENTS = [
  AuthLayoutComponent,
  LayoutComponent,
  DriverLayoutComponent,
  HeaderComponent,
  FooterComponent,
  AdminAuthLayoutComponent,
  AdminAuthHeaderComponent,
  AdminHeaderComponent,
  AdminLayoutComponent
];

const BASE_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];

const DIRECTIVE = [
  OnlyNumber,
  WhiteSpace,
  GoogleAutoComplete,
  GoogleCityAutoComplete,
  GoogleSchoolAutocomplete
];

@NgModule({
  declarations: [
    ...COMPONENTS,
    AuthHeaderComponent,
    AuthFooterComponent,
  ...DIRECTIVE,
  DriverHeaderComponent
  ],
  imports: [
    ...BASE_MODULES,
  ],
  exports: [
    ...BASE_MODULES,
    ...COMPONENTS,
    ...DIRECTIVE,
  ],
  providers: [
    LayoutsModule
  ]
})
export class LayoutsModule {
  // static forRoot(): ModuleWithProviders {
  //   return <ModuleWithProviders>{
  //     ngModule: LayoutsModule,
  //   };
  // }
}
