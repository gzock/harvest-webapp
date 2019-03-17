import { Component, OnInit } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { Project } from './../projects/project';
import { ProjectsService } from './../../../shared/services/projects/projects.service';
import { GenerateService } from './../../../shared/services/generate/generate.service';

@Component({
  selector: 'app-generate',
  templateUrl: './generate.component.html',
  styleUrls: ['./generate.component.scss']
})
export class GenerateComponent implements OnInit {
  private currentProject: Project;
  public downloadUrl: string;

  constructor(
    public projectsService: ProjectsService,
    public generateService: GenerateService
  ) { }

  ngOnInit() {
    this.currentProject = this.projectsService.getCurrentProject();
  }

  public onGenerateZip() {
    let projectId = this.currentProject.project_id;
    this.generateService.generateZip(projectId)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           console.log(response);
           this.downloadUrl = response.toString();
         },
         err => {
           console.log("error: " + err);
         }
      );
  }

  public onGenerateExcelDoc() {
    let projectId = this.currentProject.project_id;
    this.generateService.generateExcelDoc(projectId, "basic_1.xlsx", false)
      .pipe(
         catchError(error => throwError(error))
      )
      .subscribe(
         response => {
           console.log(response);
           this.downloadUrl = response.toString();
         },
         err => {
           console.log("error: " + err);
         }
      );
  }
}
