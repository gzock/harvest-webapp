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
}
