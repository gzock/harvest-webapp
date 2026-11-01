import { ChangeDetectionStrategy,Component } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialogRef } from '@angular/material/dialog';

import { Project } from '../../../private/dashboard/projects/project';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent {
  public errMsg: string = '';
  public newProject: Project = {} as Project;

  constructor(
    public dialogRef: MatDialogRef<CreateProjectComponent>
  ) { }


  public onCreateProject(newProject: Project) {
    this.errMsg = "";

    if(newProject.name && newProject.start_on && newProject.complete_on) {
      if(newProject.start_on < newProject.complete_on) {
        this.dialogRef.close(newProject);
      } else {
        this.errMsg = "エラー: 終了予定日は開始予定日よりも後の日付にしてください。";
      }
    } else {
      this.errMsg = "エラー: 全ての項目を指定してください。";
    }
  }

  public onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
    if (!event.value) return;
    switch(type) {
      case "start":
        this.newProject.start_on = event.value.toISOString();
        break;
      case "complete":
        this.newProject.complete_on = event.value.toISOString();
        break;
    }
  }
}
