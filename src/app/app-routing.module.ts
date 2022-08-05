import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { PreloadModulesStrategy } from './core/strategies/preload-modules.strategy';

const routes: Routes = [

  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(mod => mod.AuthModule)
  },
  // {
  //   path: 'admin',
  //   loadChildren: () => import('./modules/admin/admin.module').then(mod => mod.AdminModule)
  // },
  {
    path: '',
    loadChildren: () => import('./modules/users/users.module').then(mod => mod.UsersModule)
  },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules,     scrollPositionRestoration: 'top'
 })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
