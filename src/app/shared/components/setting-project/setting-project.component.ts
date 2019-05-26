import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';

import { Observable, of, merge, throwError, Subject, BehaviorSubject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

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
  public joinedUsers: ProjectJoinUser[] = [];
  public requestedUsers: ProjectJoinUser[] = [];
  private currentProject: Project;

  constructor(
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
    this.projectsService.listUsers(this.currentProject.project_id)
      .subscribe(
        users => {
          this.joinedUsers = users.filter( user => user.status === "active" );
          this.requestedUsers = users.filter( user => user.status === "request" );
          console.log(users);
        }
      );
  }

  public onUpdateRole(userId, role) {
    this.projectsService.updateRole(this.currentProject.project_id, userId, role)
     .subscribe(
       res => {
         console.log(res);
       }
     );
  }

  public onAcceptUser(userId) {
    this.projectsService.acceptUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         console.log(res);
       }
     );
  }

  public onRejectUser(userId) {
    this.projectsService.rejectUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         console.log(res);
       }
     );
  }

  public onDeleteUser(userId) {
    this.projectsService.deleteUser(this.currentProject.project_id, userId)
     .subscribe(
       res => {
         console.log(res);
       }
     );
  }

}
