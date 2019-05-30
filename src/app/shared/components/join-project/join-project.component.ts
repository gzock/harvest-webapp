import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

import { ProjectsService } from './../../services/projects/projects.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-join-project',
  templateUrl: './join-project.component.html',
  styleUrls: ['./join-project.component.scss']
})
export class JoinProjectComponent implements OnInit {
  public projectCode: string;
  public isLoading: boolean = false;
  public errMsg: string;

  constructor(
    private dialogRef: MatDialogRef<JoinProjectComponent>,
    private projectsService: ProjectsService,
    private alertService: AlertService
  ) { }

  ngOnInit() {
  }

  public onJoinProjectRequest(projectCode) {
    this.errMsg = "";
    this.isLoading = true;
    this.projectsService.joinProject(projectCode)
     .subscribe(
       res => {
         console.log(res);
         this.alertService.openSuccessAlert("指定したプロジェクトへの参加希望を申請しました。");
         this.dialogRef.close();
       },
       err => {
         this.alertService.openErrorAlert("参加機能の申請に失敗しました。再度、お試しください。");
         this.errMsg = err.message;
         this.isLoading = false;
       }
     );
  }

}
