import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { ProjectsService } from './../../services/projects/projects.service';

@Component({
  selector: 'app-join-project',
  templateUrl: './join-project.component.html',
  styleUrls: ['./join-project.component.scss']
})
export class JoinProjectComponent implements OnInit {
  public projectCode: string;

  constructor(
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {
  }

  public onJoinProjectRequest(projectCode) {
    this.projectsService.join(projectCode)
     .subscribe(
       res => {
         console.log(res);
       }
     );
  }

}
