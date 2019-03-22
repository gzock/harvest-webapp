import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { routerTransition } from '../router.animations';
//import { LoginService } from './login.service';
import { LoginUser } from './login';

import { AuthService } from './../../shared/services/auth/auth.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    user: LoginUser;
    errorMsg: string;
    email: string;
    password: string;

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
          }
        );
    }

    onLoggedIn(email: string, password: string) {
      this.authService.signIn(email, password)
        .subscribe(
          result => {
            this.router.navigate(['/dashboard/projects']);
          },
          error => {
            console.log(error);
            this.errorMsg = "ログインに失敗しました。メールアドレスあるいはパスワードが正しいかご確認ください。";
          });
    }

//
//    loginCheck(user) {
//      if(user.login) {
//        localStorage.setItem('isLoggedin', 'true');
//        localStorage.setItem('username', user.username);
//        this.router.navigate(['/dashboard']);
//      } else {
//        this.errormsg = "ログインに失敗しました。";
//      }
//
//    }
//
    onLoggedin() {
//        this.loginService.onLoggedin(this.username, this.password)
//        .then(user => this.user = user)
//        .then(() => this.loginCheck(this.user));
    }

}
