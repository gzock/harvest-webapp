import { Component, OnInit } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { MatTableDataSource } from '@angular/material';
import { MatDialog } from '@angular/material';
import { CreateProjectComponent } from './../../../shared/components/create-project/create-project.component';
import { SettingProjectComponent } from './../../../shared/components/setting-project/setting-project.component';

import { Project } from './project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { AlertService } from './../../../shared/services/alert/alert.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  public projects: Project[];
  public dataSource: MatTableDataSource<Project>;

  constructor(
    public dialog: MatDialog,
    public projectsService: ProjectsService,
    public alert: AlertService
  ) { }

  ngOnInit() {
    this.getProjects();
  }

  displayedColumns: string[] = ['project_id', 'name', 'created_at', 'updated_at'];
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  public onSelectProject(project) {
    this.projectsService.select(project);
  }

  public getProjects() {
    this.projectsService.list()
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           //this.showAlert("Successfully", "success", 3000);
           console.log(response);
           this.projects = response;
           this.projectsService.joinedProjects = response;
           this.dataSource = new MatTableDataSource(this.projects);
         },
         err => {
           console.log("error: " + err);
           this.openErrorAlert("プロジェクト一覧の取得");
         }
      );
  }

  public onCreateProject(project) {
    this.projectsService.create(project)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           console.log(response);
           this.getProjects();
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
      console.log("Dialog result: " + JSON.stringify(result));
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

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

}
