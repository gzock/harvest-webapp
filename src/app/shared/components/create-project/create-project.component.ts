import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { Project } from '../../../private/dashboard/projects/project';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.scss']
})
export class CreateProjectComponent implements OnInit {

  public newProject: Project = {
    "name": "",
    "project_id": "",
    "created_at": "",
    "updated_at": "",
    "start_on": "",
    "complete_on": ""
  }

  constructor() { }

  ngOnInit() {
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
