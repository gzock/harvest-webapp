import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject, from } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { AuthService } from './../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CorporationAuthGuard implements CanActivate {

  constructor(
    private router: Router,
    private auth: AuthService
  ) { }
 
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
      return this.auth.isCorporationUser()
        .pipe(
          tap(loggedIn => {
            if (!loggedIn) {
              this.router.navigate(['/login']);
            }
          })
        );
    }
}
