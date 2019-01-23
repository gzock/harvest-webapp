import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { routerTransition } from '../router.animations';
//import { LoginService } from './login.service';
import { LoginUser } from './login';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    user: LoginUser;
    errormsg: string;
    username: string;
    password: string;
//
//    constructor(
//      public router: Router,
//      private loginService: LoginService
//    ) { }
//
    ngOnInit() {
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
