import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material';

import { AuthService } from './../../shared/services/auth/auth.service';
import { SignupInfo } from './signup-info';
import { ConfirmSignupComponent } from './../../shared/components/confirm-signup/confirm-signup.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  public retypePassword: string;
  public info: SignupInfo = {
    "user_type": "personal",
    "pricing_plan": "standard",
    "organization": "",
    "email": "",
    "firstName": "",
    "lastName": "",
    "kanaFirstName": "",
    "kanaLastName": "",
    "password": ""
  }
  public errMsg: string;

  constructor(
    public router: Router,
    private authService: AuthService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
  }

  public onSignup(info: SignupInfo) {
    this.errMsg = "";
    console.log(info);
    let userName: string = info.lastName + " " + info.firstName;
    let kanaUserName: string = info.kanaLastName + " " + info.kanaFirstName;
    let now = new Date().toISOString()
    let attr = {
      "email": info.email,
      "preferred_username": userName,
      "custom:kana_username": kanaUserName,
      "custom:user_type": info.user_type,
      "custom:pricing_plan": info.pricing_plan,
      //"custom:organization": info.organization,
      "custom:created_at": now
    }
    this.authService.signUp(info.email, info.password, attr)
      .subscribe(
        result => {
          this.openConfirmSignupDialog(info);
        },
        error => {
          if(error.code === "UsernameExistsException") {
            this.errMsg = "ご指定のメールアドレスは既に存在しています。他のメールアドレスを指定してください。";
          } else {
            this.errMsg = "登録に失敗しました。各内容を再度ご確認ください。"
          }
        });
  }

  private openConfirmSignupDialog(info: SignupInfo) {
    const dialogRef = this.dialog.open(ConfirmSignupComponent, { disableClose: true});

    dialogRef.afterClosed().subscribe(code => {
      console.log("Dialog result: " + JSON.stringify(code));
      if(code) {
        this.onConfirmSignup(info.email, code);
      }
    });
  }

  private onConfirmSignup(email:string, code: string) {
    this.authService.confirmSignUp(email, code)
      .subscribe(
        result => {
          this.router.navigate(['/dashboard/projects']);
        }
      );
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
