import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material';
import { CreateProjectComponent } from './../../../shared/components/create-project/create-project.component';
import { SettingProjectComponent } from './../../../shared/components/setting-project/setting-project.component';
import { JoinProjectComponent } from './../../../shared/components/join-project/join-project.component';

import { Project } from './project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { AlertService } from './../../../shared/services/alert/alert.service';
import { Permissions } from './../../../shared/services/projects/action-permissions/permissions/permissions';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit, OnDestroy {
  public projects: Project[] = [];
  public currentProject: Project;
  public dataSource: MatTableDataSource<Project>;
  public filterStatus: string;
  private joinedProjectsSubscription: Subscription;
  private currentProjectSubscription: Subscription;
  public isLoading: boolean = false;
  public permissions: Permissions = {} as Permissions;

  constructor(
    public dialog: MatDialog,
    public projectsService: ProjectsService,
    public alert: AlertService
  ) { }

  ngOnInit() {
    this.isLoading = true;
    this.joinedProjectsSubscription = this.projectsService.joinedProjectsSubject
      .subscribe(
        projects => {
          if(projects instanceof Array && projects.length) {
            this.projects = projects;
            this.dataSource = new MatTableDataSource(this.projects);
            this.currentProject = this.projectsService.getCurrentProject();
            this.permissions = this.projectsService.getCurrentPermissions();
            this.isLoading = false;

          } else if(projects instanceof Array && projects.length == 0) {
            this.isLoading = false;
          }
        },
        err => {
          console.log("error: " + err);
          this.openErrorAlert("プロジェクト一覧の取得");
          this.isLoading = false;
        }
      );
    this.currentProjectSubscription = this.projectsService.currentProjectSubject
      .subscribe(
        project => {
          if(project) {
            this.currentProject = project;
          }
        },
        err => {
          console.log("error: " + err);
        }
      );

  }

  ngOnDestroy() {
    if (this.joinedProjectsSubscription) {
      this.joinedProjectsSubscription.unsubscribe();
    }
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
  }

  displayedColumns: string[] = ['project_id', 'name', 'start_on', 'complete_on'];
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public onSelectProject(project: Project) {
    this.projectsService.select(project);
    this.permissions = this.projectsService.getCurrentPermissions();
  }

  public onCreateProject(project: Project) {
    this.isLoading = true;
    this.projectsService.create(project)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
            this.projectsService.list().subscribe();
            this.openSuccessAlert("プロジェクトの作成");
            this.isLoading = false;
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("プロジェクトの作成");
            this.isLoading = false;
         }
      );
  }

  openCreateProjectDialog() {
    const dialogRef = this.dialog.open(CreateProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      //console.log("Dialog result: " + JSON.stringify(result));
      if(result) {
        this.onCreateProject(result);
      }
    });
  }
  openSettingProjectDialog() {
    const dialogRef = this.dialog.open(SettingProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  openJoinProjectDialog() {
    const dialogRef = this.dialog.open(JoinProjectComponent);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg + "に成功しました。");
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public formatDate(date: string) {
    if(date) {
      let _date: Date = new Date(date);
      return _date.getFullYear() + "/" + (_date.getMonth() + 1) + "/" + _date.getDate();
    }
  }

}
