import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from './../../shared/services/auth/auth.service';
import { SignupInfo } from './signup-info';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  public info: SignupInfo = {
    "type": "personal",
    "plan": "standard",
    "organization": "",
    "email": "",
    "firstName": "",
    "lastName": "",
    "kanaFirstName": "",
    "kanaLastName": "",
    "password": ""
  }

  constructor(
      public router: Router,
      private authService: AuthService
  ) { }

  ngOnInit() {
  }

  public onSignUp(info: SignupInfo) {
    let userName: string = info.lastName + " " + info.firstName;
    let kanaUserName: string = info.kanaLastName + " " + info.kanaFirstName;
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
