import { ChangeDetectionStrategy,Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { AlertService } from './../../../shared/services/alert/alert.service';
import { ProjectsService } from './../../services/projects/projects.service';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-join-project',
  templateUrl: './join-project.component.html',
  styleUrls: ['./join-project.component.scss']
})
export class JoinProjectComponent {
  public projectCode: string = '';
  public isLoading: boolean = false;
  public errMsg: string = '';

  constructor(
    private dialogRef: MatDialogRef<JoinProjectComponent>,
    private projectsService: ProjectsService,
    private alertService: AlertService
  ) { }


  public onJoinProjectRequest(projectCode: string) {
    this.errMsg = "";
    this.isLoading = true;
    this.projectsService.joinProject(projectCode)
     .subscribe(
       _res => {

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
