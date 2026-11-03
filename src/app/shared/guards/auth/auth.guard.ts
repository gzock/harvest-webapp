import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot,CanActivate,Router,RouterStateSnapshot } from '@angular/router';

import { Observable } from "rxjs";
import { map } from "rxjs/operators";

import { AuthService } from './../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }
 
  canActivate(
    _next: ActivatedRouteSnapshot,
    _state: RouterStateSnapshot): Observable<boolean | import('@angular/router').UrlTree> {
      return this.auth.isAuthenticated()
        .pipe(
          map(loggedIn => loggedIn || this.router.createUrlTree(['/login']))
        );
    }
}
