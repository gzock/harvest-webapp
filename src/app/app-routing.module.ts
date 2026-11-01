import { NgModule } from '@angular/core';
import { RouterModule,Routes } from '@angular/router';

import { AuthGuard } from './shared/guards/auth/auth.guard';
import { CorporationAuthGuard } from './shared/guards/auth/corporation-auth.guard';

const routes: Routes = [
  {
      path: 'dashboard',
      loadChildren: () => import('./private/dashboard/dashboard.module').then(m => m.DashboardModule),
      canActivate: [AuthGuard]
  },
  {
      path: 'corporation',
      loadChildren: () => import('./private/corporation/corporation.module').then(m => m.CorporationModule),
      canActivate: [CorporationAuthGuard]
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', loadChildren: () => import('./public/login/login.module').then(m => m.LoginModule) },
  { path: 'signup', loadChildren: () => import('./public/signup/signup.module').then(m => m.SignupModule) },
  { path: '**', redirectTo: 'login' }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
