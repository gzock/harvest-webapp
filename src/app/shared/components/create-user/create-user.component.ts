import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { CreateUserData } from './create-user-data';
import { AlertService } from './../../services/alert/alert.service';
import { CorporationService } from './../../services/corporation/corporation.service';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss']
})
export class CreateUserComponent implements OnInit {
  public retypePassword: string;
  public userData: CreateUserData = {
    "email": "",
    "firstName": "",
    "lastName": "",
    "kanaFirstName": "",
    "kanaLastName": "",
    "password": ""
  }
  public errMsg: string;

  constructor(
    private alertService: AlertService,
    private corp: CorporationService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CreateUserComponent>
  ) { }

  ngOnInit() {
  }

  public onCreateUser(userData: CreateUserData) {
    this.errMsg = "";
    const userName: string = userData.lastName + " " + userData.firstName;
    const kanaUserName: string = userData.kanaLastName + " " + userData.kanaFirstName;

    this.corp.createUser(userName, kanaUserName, userData.email, userData.password)
      .subscribe(
        result => {
          this.openSuccessAlert("ユーザーの作成に成功しました。");
          this.dialogRef.close(true);
        },
        error => {
          console.log(error);
          this.errMsg = error.message;
          this.openErrorAlert("ユーザーの作成に失敗しました。");
        });
  }

  private openSuccessAlert(msg) {
    this.alertService.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alertService.openErrorAlert(msg);
  }

  // thanks for https://javascript.programmer-reference.com/js-check-zenkaku-katakana/
  public isZenKataKana(str: string){
    str = (str==null)?"":str;
    if(str.match(/^[ァ-ヶー　]+$/)){
      return true;
    }else{
      return false;
    }
  }
}
