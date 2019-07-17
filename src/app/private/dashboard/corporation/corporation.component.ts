import { Component, OnInit } from '@angular/core';

import { AuthService } from './../../../shared/services/auth/auth.service';
import { CorporationService } from './../../../shared/services/corporation/corporation.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-user',
  templateUrl: './corporation.component.html',
  styleUrls: ['./corporation.component.scss']
})
export class CorporationComponent implements OnInit {
  public oldPassword: string;
  public newPassword: string;
  public email: string;
  public username: string;
  public accountType: string;
  public billing: string;
  public corpData: any;

  constructor(
    private auth: AuthService,
    private corp: CorporationService,
    private alert: AlertService
  ) { }

  ngOnInit() {
    this.getUserData();
    this.getCorporationData();
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

  public getCorporationData() {
    this.corp.show()
      .subscribe(
        corpData => {
          this.corpData = corpData;
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
