import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatDialog } from '@angular/material';
import { MatTableDataSource } from '@angular/material';

import { AuthService } from './../../shared/services/auth/auth.service';
import { CorporationService } from './../../shared/services/corporation/corporation.service';
import { AlertService } from './../../shared/services/alert/alert.service';

import { CreateUserComponent } from './../../shared/components/create-user/create-user.component';
import { DeleteUserComponent } from './../../shared/components/delete-user/delete-user.component';

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
  public bill_type: string = "請求書払い";
  public corpData: CorporationData;
  public dataSource: MatTableDataSource<UserData>;
  public displayedColumns: string[] = ['user_id', 'preferred_username', 'email', 'created_at'];
  public filterValue: string;
  public isLoading: boolean = false;
  public selectedUser: UserData;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  constructor(
    private breakpointObserver: BreakpointObserver,
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
    this.isLoading = true;
    this.corp.show()
      .subscribe(
        corpData => {
          this.corpData = corpData;
          this.dataSource = new MatTableDataSource(corpData.users);
          this.isLoading = false;
        },
        err => {
          this.isLoading = false;
          this.openErrorAlert("法人アカウント情報の取得に失敗しました。");
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

  openDeleteUserDialog() {
    const dialogRef = this.dialog.open(DeleteUserComponent, { data: { targetUser: this.selectedUser } });

    dialogRef.afterClosed().subscribe(result => {
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

  public onSelectUser(userData: UserData) {
    this.selectedUser = userData;
  }

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg);
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
