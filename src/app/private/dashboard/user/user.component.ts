import { Component, OnInit } from '@angular/core';

import { AuthService } from './../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public oldPassword: string;
  public newPassword: string;
  public email: string;
  public username: string;
  public accountType: string;

  constructor(
    private auth: AuthService
  ) { }

  ngOnInit() {
    this.getUserData();
  }

  public getUserData() {
    this.auth.getToken()
      .subscribe(
        user => {
          this.email = user.idToken.payload.email;
          this.username = user.idToken.payload.preferred_username;
          this.accountType = "Standard";
        }
      );
  }

  public onChangePassword(oldPassword: string, newPassword: string) {
    this.auth.changePassword(oldPassword, newPassword)
      .subscribe(
        loggedIn => {
          console.log("password change success.")
        },
        //() => {},
        error => {
          console.log(error);
        }
      );
  }

}
