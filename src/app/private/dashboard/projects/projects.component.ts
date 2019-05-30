import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";
import { ChangeDetectorRef } from '@angular/core';

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
  private permissions: Permissions = {} as Permissions;

  constructor(
    public dialog: MatDialog,
    private changeDetectorRef: ChangeDetectorRef,
    public projectsService: ProjectsService,
    public alert: AlertService
  ) { }

  ngOnInit() {
    this.joinedProjectsSubscription = this.projectsService.joinedProjectsSubject
      .subscribe(
        projects => {
          if(projects instanceof Array && projects.length) {
            this.projects = projects;
            this.dataSource = new MatTableDataSource(this.projects);
            this.currentProject = projects[0];
            this.projectsService.select(this.currentProject);
            this.permissions = this.projectsService.getCurrentPermissions();
            this.changeDetectorRef.detectChanges();
            console.log(this.permissions);
          }
        },
        err => {
          console.log("error: " + err);
          this.openErrorAlert("プロジェクト一覧の取得");
        }
      );
  }

  ngOnDestroy() {
    if (this.joinedProjectsSubscription) {
      this.joinedProjectsSubscription.unsubscribe();
    }
  }

  displayedColumns: string[] = ['project_id', 'name', 'start_on', 'complete_on'];
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public onSelectProject(project: Project) {
    this.projectsService.select(project);
  }

  public onCreateProject(project: Project) {
    this.projectsService.create(project)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
            this.projectsService.list().subscribe();
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("プロジェクトの作成");
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
