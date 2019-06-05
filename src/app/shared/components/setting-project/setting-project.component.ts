import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { Observable, of, merge, throwError, Subject, BehaviorSubject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { Project } from '../../../private/dashboard/projects/project';
import { ProjectJoinUser } from './project-join-user';
import { ProjectsService } from './../../services/projects/projects.service';
import { AlertService } from './../../../shared/services/alert/alert.service';
import { AuthService } from './../../../shared/services/auth/auth.service';

@Component({
  selector: 'app-setting-project',
  templateUrl: './setting-project.component.html',
  styleUrls: ['./setting-project.component.scss']
})
export class SettingProjectComponent implements OnInit {
  public projects: Project[];
  public joinCode: string;
  public joinedUsers: ProjectJoinUser[] = [];
  public requestedUsers: ProjectJoinUser[] = [];
  public rejectedUsers: ProjectJoinUser[] = [];
  public currentProject: Project;
  public isLoading: boolean = true;
  public myUserData: any;
  public updateProject: Project = {} as Project;

  constructor(
    private dialogRef: MatDialogRef<SettingProjectComponent>,
    private projectsService: ProjectsService,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    this.updateProject = this.currentProject;
    this.projectsService.listUsers(this.currentProject.project_id)
      .subscribe(
        users => {
          this.joinedUsers = users.filter( user => user.status === "active" );
          this.requestedUsers = users.filter( user => user.status === "request" );
          this.rejectedUsers = users.filter( user => user.status === "reject" );
          this.isLoading = false;
        },
        err => {
          this.openErrorAlert("ユーザー情報の取得");
        }
      );
    this.authService.getData()
      .subscribe(
        userData => {
          this.myUserData = userData;
        }
      )
  }

  public onUpdateRole(userId, role) {
    this.isLoading = true;
    this.projectsService.updateRole(this.currentProject.project_id, userId, role)
     .subscribe(
       res => {
         this.openSuccessAlert("ロールの変更に成功しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("ロールの変更");
         this.isLoading = false;
         console.log(err);
       }
     );
  }

  public onAcceptUser(userId) {
    this.isLoading = true;
    this.projectsService.acceptUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSuccessAlert("指定したユーザーの参加を許可しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("参加処理");
         this.isLoading = false;
         console.log(err);
       }
     );
  }

  public onRejectUser(userId) {
    this.isLoading = true;
    this.projectsService.rejectUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSuccessAlert("指定したユーザーの参加を拒否しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("参加拒否の処理");
         this.isLoading = false;
         console.log(err);
       }
     );
  }

  public onDeleteUser(userId) {
    this.isLoading = true;
    this.projectsService.deleteUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSuccessAlert("指定したユーザーを削除しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("削除処理");
         this.isLoading = false;
         console.log(err);
       }
     );
  }

  public onCopyClipboard(str: string) {
    let selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = str;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
    this.openSuccessAlert("クリップボードにコピーしました。");
  }

  private openSuccessAlert(msg) {
    this.alertService.openSuccessAlert(msg);
  }

  public onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
    switch(type) {
      case "start":
        this.updateProject.start_on = event.value.toISOString();
        break;
      case "complete":
        this.updateProject.complete_on = event.value.toISOString();
        break;
    }
  }

  public onUpdateProject(project: Project) {
    console.log(project);
  }

  private openErrorAlert(msg) {
    this.alertService.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }
}
