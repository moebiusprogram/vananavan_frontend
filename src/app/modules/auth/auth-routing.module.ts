import { RegisterComponent } from './register/register.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './shared-forget-password/rider-forget-password/forget-password.component';
import { AdminLoginComponent } from './admin-login/admin-login/admin-login.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'forget-password',
    component: ForgetPasswordComponent
  },
  {
    path: 'admin',
    children: [
      {
        path: 'login',
        component: AdminLoginComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule {
  static component = [
    LoginComponent,
    RegisterComponent,
    ForgetPasswordComponent,
    AdminLoginComponent
  ];
}
