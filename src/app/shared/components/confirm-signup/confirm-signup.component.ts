import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

@Component({
  selector: 'app-confirm-signup',
  templateUrl: './confirm-signup.component.html',
  styleUrls: ['./confirm-signup.component.scss']
})
export class ConfirmSignupComponent implements OnInit {
  public errMsg: string;
  public code: string;

  constructor(
    public dialogRef: MatDialogRef<ConfirmSignupComponent>
  ) { }

  ngOnInit() {
  }

  public onConfirm(code: string) {
    this.dialogRef.close(code);
  }

}
