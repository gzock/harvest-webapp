import { Component, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material';
import { MatTableDataSource } from '@angular/material';

import { AuthService } from './../../shared/services/auth/auth.service';
import { CorporationService } from './../../shared/services/corporation/corporation.service';
import { AlertService } from './../../shared/services/alert/alert.service';

import { CreateUserComponent } from './../../shared/components/create-user/create-user.component';

import { UserData } from './../dashboard/user/user-data';
import { CorporationData } from './corporation-data';

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
  public corpData: CorporationData[];
  public dataSource: MatTableDataSource<UserData>;
  public displayedColumns: string[] = ['user_id', 'preferred_username', 'email', 'created_at'];
  public filterValue: string;

  constructor(
    public dialog: MatDialog,
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
          this.dataSource = new MatTableDataSource(corpData.users);
        }
      );
  }

  openCreateUserDialog() {
    const dialogRef = this.dialog.open(CreateUserComponent);

    dialogRef.afterClosed().subscribe(result => {
      //console.log("Dialog result: " + JSON.stringify(result));
      if(result) {
        this.getCorporationData();
      }
    });
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

  public onCreateUser(username: string, kana_username: string, email: string, password: string) {
    this.corp.createUser(username, kana_username, email, password)
      .subscribe(
        res => {
          console.log(res)
        }
      );
  }

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。内容をご確認の上、再度お試しください。");
  }

  public formatDate(date: string) {
    if(date) {
      let _date: Date = new Date(date);
      return _date.getFullYear() + "/" + (_date.getMonth() + 1) + "/" + _date.getDate();
    }
  }

  public onLogout() {
    this.auth.signOut();
  }

  public applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim();
  }

}
