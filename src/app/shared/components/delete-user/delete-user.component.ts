import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { UserData } from './../../../private/dashboard/user/user-data';
import { AlertService } from './../../services/alert/alert.service';
import { CorporationService } from './../../services/corporation/corporation.service';

@Component({
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent implements OnInit {
  public errMsg: string;
  public code: string;
  public targetUser: UserData;
  public targetUserName: string;
  public isProgress: boolean = false;

  constructor(
    private alertService: AlertService,
    private corp: CorporationService,
    public dialogRef: MatDialogRef<DeleteUserComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) { 
    this.targetUser = data.targetUser;
    this.targetUserName = this.targetUser.preferred_username;
  }

  ngOnInit() {
  }

  public onDeleteUser() {
    this.errMsg = "";
    this.isProgress = true;

    this.corp.deleteUser(this.targetUser.user_id)
      .subscribe(
        result => {
          console.log(result)
          this.openSuccessAlert("ユーザーの削除に成功しました。");
          this.dialogRef.close(true);
        },
        error => {
          console.log(error);
          this.errMsg = error.message;
          this.openErrorAlert("ユーザーの削除に失敗しました。");
          this.isProgress = false;
        }
      );
  }

  private openSuccessAlert(msg) {
    this.alertService.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alertService.openErrorAlert(msg);
  }

}
