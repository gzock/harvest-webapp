import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';

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
  private currentProject: Project;
  public isLoading: boolean = true;
  public myUserData: any;

  constructor(
    private dialogRef: MatDialogRef<SettingProjectComponent>,
    private projectsService: ProjectsService,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    this.projectsService.listUsers(this.currentProject.project_id)
      .subscribe(
        users => {
          this.joinedUsers = users.filter( user => user.status === "active" );
          this.requestedUsers = users.filter( user => user.status === "request" );
          this.isLoading = false;
          console.log(users);
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
    this.projectsService.updateRole(this.currentProject.project_id, userId, role)
     .subscribe(
       res => {
         this.openSucccessAlert("ロールの変更に成功しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("ロールの変更");
         console.log(err);
       }
     );
  }

  public onAcceptUser(userId) {
    this.projectsService.acceptUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSucccessAlert("指定したユーザーの参加を許可しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("参加処理");
         console.log(err);
       }
     );
  }

  public onRejectUser(userId) {
    this.projectsService.rejectUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSucccessAlert("指定したユーザーの参加を拒否しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("参加拒否の処理");
         console.log(err);
       }
     );
  }

  public onDeleteUser(userId) {
    this.projectsService.deleteUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         this.openSucccessAlert("指定したユーザーを削除しました。");
         this.dialogRef.close();
       },
       err => {
         this.openErrorAlert("削除処理");
         console.log(err);
       }
     );
  }

  private openSucccessAlert(msg) {
    this.alertService.openSucccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alertService.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

}
