import { Component, OnInit } from '@angular/core';

import { AuthService } from './../../../shared/services/auth/auth.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  public oldPassword: string;
  public newPassword: string;
  public email: string;
  public username: string;
  public accountType: string;
  public billing: string;

  constructor(
    private auth: AuthService,
    private alert: AlertService
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
          if(loggedIn) {
            this.openSuccessAlert("パスワードの変更が完了しました。");
            console.log("password change success.")
          } else {
            this.openErrorAlert("パスワードの変更");
            console.log(loggedIn);
          }
        },
        error => {
          this.openErrorAlert("パスワードの変更");
          console.log(error);
        }
      );
  }

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。内容をご確認の上、再度お試しください。");
  }

}
