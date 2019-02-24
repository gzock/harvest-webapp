import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject, from } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import Amplify, { Auth } from 'aws-amplify';

import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public loggedIn: BehaviorSubject<boolean>;

  constructor(
    private router: Router
  ) {
    Amplify.configure(environment.amplify);
    this.loggedIn = new BehaviorSubject<boolean>(false);
  }

  /** サインアップ */
  public signUp(email, password): Observable<any> {
    return from(Auth.signUp(email, password));
  }

  /** 検証 */
  public confirmSignUp(email, code): Observable<any> {
    return from(Auth.confirmSignUp(email, code));
  }

  /** ログイン */
  public signIn(email, password): Observable<any> {
    return from(Auth.signIn(email, password))
      .pipe(
        tap(user => {
          console.log(user);
          if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
            let requiredAttrs = {"preferred_username": "Guest"}; //TODO: signupで入れておく必要がある
            from(Auth.completeNewPassword(user, password, requiredAttrs))
              .pipe(tap(() => this.loggedIn.next(true)));

          } else {
            this.loggedIn.next(true);
          }
        })
      );
  }

  /** ログイン状態の取得 */
  public isAuthenticated(): Observable<boolean> {
    return from(Auth.currentAuthenticatedUser())
      .pipe(
        map(result => {
          this.loggedIn.next(true);
          return true;
        }),
        catchError(error => {
          this.loggedIn.next(false);
          return of(false);
        })
      );
  }

  /** ログアウト */
  public signOut() {
    from(Auth.signOut())
      .subscribe(
        result => {
          this.loggedIn.next(false);
          this.router.navigate(['/login']);
        },
        error => console.log(error)
      );
  }

}
