import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthGuard } from './shared/guards/auth/auth.guard';

const routes: Routes = [
  {
      path: 'dashboard',
      loadChildren: './private/dashboard/dashboard.module#DashboardModule',
      canActivate: [AuthGuard]
  },
  { path: '', loadChildren: './public/login/login.module#LoginModule' },
  { path: 'login', loadChildren: './public/login/login.module#LoginModule' },
  { path: 'signup', loadChildren: './public/signup/signup.module#SignupModule' }

  //{ path: 'signup', loadChildren: './public/signup/signup.module#SignupModule' },
  //{ path: 'not-found', loadChildren: './not-found/not-found.module#NotFoundModule' },
  //{ path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
