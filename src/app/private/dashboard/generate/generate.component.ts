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
           //this.places = response.places;
           //this.placeDataSource = new MatTableDataSource(this.places);
           //this.targets = response.targets;
           //this.targetDataSource = new MatTableDataSource(this.targets);
           //
           //this.currentProject = this.projectsService.getCurrentProject();
           //this.placesService.setProjectId(this.currentProject.project_id);
         },
         err => {
           console.log("error: " + err);
         }
      );
  }

}
