import { ChangeDetectionStrategy,Component,OnInit } from '@angular/core';

import { AlertService } from './../../../shared/services/alert/alert.service';
import { AuthService } from './../../../shared/services/auth/auth.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  public oldPassword: string = '';
  public newPassword: string = '';
  public email: string = '';
  public username: string = '';
  public accountType: string = '';
  public billing: string = '';

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

          } else {
            this.openErrorAlert("パスワードの変更");

          }
        },
        _error => {
          this.openErrorAlert("パスワードの変更");

        }
      );
  }

  private openSuccessAlert(msg: string) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg: string) {
    this.alert.openErrorAlert(msg + "に失敗しました。内容をご確認の上、再度お試しください。");
  }

}
