import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { Project } from './projects/project';
import { ProjectsService } from './../../shared/services/projects/projects.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  public projects: Project[];
  private currentProject: Project;
  public currentProjectName: string;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  constructor(
    public router: Router, 
    private breakpointObserver: BreakpointObserver,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard']);

    } else {
      this.projectsService.list()
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           response => {
             console.log(response);
             this.projects = response;
           },
           err => {
             console.log("error: " + err);
           }
        );
    }
  }

  public select(project: Project) {
    this.projectsService.select(project);
    this.currentProjectName = project.name;
  }

}
