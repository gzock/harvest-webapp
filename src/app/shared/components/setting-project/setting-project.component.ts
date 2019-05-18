import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Project } from '../../../private/dashboard/projects/project';
import { ProjectJoinUser } from './project-join-user';
import { ProjectsService } from './../../services/projects/projects.service';

@Component({
  selector: 'app-setting-project',
  templateUrl: './setting-project.component.html',
  styleUrls: ['./setting-project.component.scss']
})
export class SettingProjectComponent implements OnInit {
  public projects: Project[];
  public joinCode: string;
  public users: ProjectJoinUser[];
  private currentProject: Project;

  constructor(
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    this.projectsService.showJoinCode(this.currentProject.project_id)
      .subscribe(
        res => {
          this.joinCode = res.join_code;
        }
      );
    this.projectsService.listUsers(this.currentProject.project_id)
      .subscribe(
        users => {
          this.users = users;
          console.log(users);
        }
      );
  }

  //public users = [
  //  {
  //    name: "hoge",
  //    organization: "株式会社ミライト"
  //  },
  //  {
  //    name: "foo",
  //    organization: "株式会社ミライト"
  //  }
  //];

}
