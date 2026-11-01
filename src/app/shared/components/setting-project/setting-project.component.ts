import { ChangeDetectionStrategy,Component,OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';
import { GuestPermissions } from '../../services/projects/action-permissions/permissions/guest-permissions';


import { Project } from '../../../private/dashboard/projects/project';
import { AlertService } from './../../../shared/services/alert/alert.service';
import { AuthService } from './../../../shared/services/auth/auth.service';
import { Permissions } from './../../services/projects/action-permissions/permissions/permissions';
import { ProjectsService } from './../../services/projects/projects.service';
import { ProjectJoinUser } from './project-join-user';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-setting-project',
  templateUrl: './setting-project.component.html',
  styleUrls: ['./setting-project.component.scss']
})
export class SettingProjectComponent implements OnInit {
  tmp = '';
  public projects: Project[] = [];
  public joinCode: string = '';
  public joinedUsers: ProjectJoinUser[] = [];
  public requestedUsers: ProjectJoinUser[] = [];
  public rejectedUsers: ProjectJoinUser[] = [];
  public currentProject: Project | null = null;
  public isLoading: boolean = true;
  public myUserData: any;
  public updateProject: Project = {} as Project;
  public permissions: Permissions = new GuestPermissions();

  constructor(
    private dialogRef: MatDialogRef<SettingProjectComponent>,
    private projectsService: ProjectsService,
    private alertService: AlertService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    if (!this.currentProject) { this.dialogRef.close(); return; }
    this.updateProject =  JSON.parse(JSON.stringify(this.currentProject));
    this.permissions = this.projectsService.getCurrentPermissions();
    this.projectsService.listUsers(this.currentProject.project_id)
      .subscribe(
        (users: ProjectJoinUser[]) => {
          this.joinedUsers = users.filter( user => user.status === "active" );
          this.requestedUsers = users.filter( user => user.status === "request" );
          this.rejectedUsers = users.filter( user => user.status === "reject" );
          this.isLoading = false;
        },
        _err => {
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

  public onUpdateRole(userId: string, role: string) {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.updateRole(this.currentProject.project_id, userId, role)
     .subscribe(
       _res => {
         this.openSuccessAlert("ロールの変更に成功しました。");
         this.dialogRef.close();
       },
       _err => {
         this.openErrorAlert("ロールの変更");
         this.isLoading = false;

       }
     );
  }

  public onAcceptUser(userId: string) {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.acceptUser(this.currentProject.project_id, userId)
     .subscribe(
       _res => {
         this.openSuccessAlert("指定したユーザーの参加を許可しました。");
         this.dialogRef.close();
       },
       _err => {
         this.openErrorAlert("参加処理");
         this.isLoading = false;

       }
     );
  }

  public onRejectUser(userId: string) {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.rejectUser(this.currentProject.project_id, userId)
     .subscribe(
       _res => {
         this.openSuccessAlert("指定したユーザーの参加を拒否しました。");
         this.dialogRef.close();
       },
       _err => {
         this.openErrorAlert("参加拒否の処理");
         this.isLoading = false;

       }
     );
  }

  public onDeleteUser(userId: string) {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.deleteUser(this.currentProject.project_id, userId)
     .subscribe(
       _res => {
         this.openSuccessAlert("指定したユーザーを削除しました。");
         this.dialogRef.close();
       },
       _err => {
         this.openErrorAlert("削除処理");
         this.isLoading = false;

       }
     );
  }

  public async onCopyClipboard(str: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(str);
      this.openSuccessAlert('クリップボードにコピーしました。');
    } catch {
      this.openErrorAlert('クリップボードへのコピー');
    }
  }

  private openSuccessAlert(msg: string) {
    this.alertService.openSuccessAlert(msg);
  }

  public onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
    if(event.value) {
      switch(type) {
        case "start":
          this.updateProject.start_on = event.value.toISOString();
          break;
        case "complete":
          this.updateProject.complete_on = event.value.toISOString();
          break;
      }
    }
  }

  public onUpdateProject(project: Project) {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.update(this.currentProject.project_id, project)
     .subscribe(
       _res => {
         this.openSuccessAlert("プロジェクトの設定を変更しました。");
         this.dialogRef.close(true);
       },
       _err => {
         this.openErrorAlert("プロジェクトの設定");
         this.isLoading = false;

       }
     );
  }

  public onDeleteProject() {
    if (!this.currentProject) return;
    this.isLoading = true;
    this.projectsService.delete(this.currentProject.project_id)
     .subscribe(
       _res => {
         this.openSuccessAlert("プロジェクトを削除しました。");
         this.dialogRef.close(true);
       },
       _err => {
         this.openErrorAlert("プロジェクトの削除");
         this.isLoading = false;

       }
     );
  }

  private openErrorAlert(msg: string) {
    this.alertService.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }
}
