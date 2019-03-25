import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { Project } from '../../../private/dashboard/projects/project';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {
  public errMsg: string;
  public newProject: Project = {
    "name": "",
    "project_id": "",
    "created_at": "",
    "updated_at": "",
    "start_on": "",
    "complete_on": ""
  }

  constructor(
    public dialogRef: MatDialogRef<CreateProjectComponent>
  ) { }

  ngOnInit() {
  }

  public onCreateProject(newProject: Project) {
    this.errMsg = "";
    console.log("event fired create project.")
    if(newProject.name && newProject.start_on && newProject.complete_on) {
      this.dialogRef.close(newProject);
    } else {
      this.errMsg = "エラー: 全ての項目を指定してください。";
    }
  }

  public onDateChange(type: string, event: MatDatepickerInputEvent<Date>) {
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
