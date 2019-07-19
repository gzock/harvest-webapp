import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject, from } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";
import { concatMap, flatMap, takeLast } from 'rxjs/operators';

import { LoginUser } from './login';

import { AuthService } from './../../shared/services/auth/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    public user: LoginUser;
    public errorMsg: string;
    public email: string;
    public password: string;
    public isSaveEmail: boolean = true;
    public isDisplayPassword: boolean = false;
    public formType: string = "password";

    constructor(
      public router: Router,
      private authService: AuthService
    ) { }

    ngOnInit() {
      this.authService.isAuthenticated()
        .subscribe(
          loggedIn => {
            if (loggedIn) {
              this.router.navigate(['/dashboard/projects']);
            }
            this.authService.isCorporationUser()
              .subscribe(
                result => {
                  if(result) { 
                    this.router.navigate(['/corporation']);
                  } else {
                    this.router.navigate(['/dashboard/projects']);
                  }
                }
              ) 
          }
        );
      this.email = localStorage.getItem('email');
    }

    onLoggedIn(email: string, password: string) {
      if(this.isSaveEmail) {
        localStorage.setItem('email', email);
      }
      this.authService.signIn(email, password)
        .pipe(
          tap(
            result => {
              this.authService.isCorporationUser()
                .subscribe(
                  result => {
                    if(result) this.router.navigate(['/corporation']);
                  }
                ) 
            }
          )
        )
        .subscribe(
          result => {
            this.router.navigate(['/dashboard/projects']);
          },
          error => {
            console.log(error);
            this.errorMsg = "ログインに失敗しました。メールアドレスあるいはパスワードをご確認ください。";
          });
    }

    public onSwitchDisplayPassword() {
      this.formType = this.isDisplayPassword ? "password" : "text";
    }
}
