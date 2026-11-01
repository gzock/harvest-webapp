import { ChangeDetectionStrategy,Component,Inject } from '@angular/core';
import { MAT_DIALOG_DATA,MatDialogRef } from '@angular/material/dialog';

import { UserData } from './../../../private/dashboard/user/user-data';
import { AlertService } from './../../services/alert/alert.service';
import { CorporationService } from './../../services/corporation/corporation.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-delete-user',
  templateUrl: './delete-user.component.html',
  styleUrls: ['./delete-user.component.scss']
})
export class DeleteUserComponent {
  public errMsg: string = '';
  public code: string = '';
  public checkFormValue: string = '';
  public targetUser: UserData;
  public targetUserName: string = '';
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


  public onDeleteUser() {
    if (!this.targetUser.user_id) return;
    this.errMsg = "";
    this.isProgress = true;

    this.corp.deleteUser(this.targetUser.user_id)
      .subscribe(
        _result => {

          this.openSuccessAlert("ユーザーの削除に成功しました。");
          this.dialogRef.close(true);
        },
        error => {

          this.errMsg = error.message;
          this.openErrorAlert("ユーザーの削除に失敗しました。");
          this.isProgress = false;
        }
      );
  }

  private openSuccessAlert(msg: string) {
    this.alertService.openSuccessAlert(msg);
  }

  private openErrorAlert(msg: string) {
    this.alertService.openErrorAlert(msg);
  }

}
