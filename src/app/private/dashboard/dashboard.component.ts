import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { Project } from './projects/project';
import { ProjectsService } from './../../shared/services/projects/projects.service';
import { AuthService } from './../../shared/services/auth/auth.service';
import { AlertService } from './../../shared/services/alert/alert.service';
import { Notification } from './notification';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { Permissions } from './../../shared/services/projects/action-permissions/permissions/permissions';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  public projects: Project[];
  public notifications: Notification[] = [] as Notification[];
  private currentProject: Project;
  public currentProjectName: string;
  private currentProjectSubscription: Subscription;
  private joinedProjectsSubscription: Subscription;
  public isMobile: boolean = false;
  public permissions: Permissions = {} as Permissions;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
  .pipe(
    map(result => result.matches)
  );

  constructor(
    public router: Router, 
    private breakpointObserver: BreakpointObserver,
    public platform: Platform,
    private projectsService: ProjectsService,
    private authService: AuthService,
    public alert: AlertService,
    private notificationsService: NotificationsService
  ) {}

  ngOnInit() {
    if(this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard']);

    } else {
      this.projectsService.list()
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           (response: Project[]) => {
              this.projects = response;
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("プロジェクト一覧の取得");
           }
        );
      this.joinedProjectsSubscription = this.projectsService.joinedProjectsSubject
        .subscribe(
          projects => {
            this.projects = projects;
          },
          err => {
            console.log("error: " + err);
            this.openErrorAlert("プロジェクト一覧の取得");
          }
        );
      this.currentProjectSubscription = this.projectsService.currentProjectSubject
        .subscribe(
          project => {
            this.currentProject = project;
            this.currentProjectName = project.name;
            this.permissions = this.projectsService.getCurrentPermissions();
          },
          error => {
            console.log(error);
          }
        );
      this.notificationsService.list()
        .pipe(
           catchError(error => throwError(error))
        )
        .subscribe(
           (response: Notification[]) => {
              this.notifications = response;
           },
           err => {
             console.log("error: " + err);
             this.openErrorAlert("通知一覧の取得");
           }
        );
    }
  }

  ngOnDestroy() {
    if (this.currentProjectSubscription) {
      this.currentProjectSubscription.unsubscribe();
    }
    if (this.joinedProjectsSubscription) {
      this.joinedProjectsSubscription.unsubscribe();
    }
  }

  public select(project: Project) {
    this.projectsService.select(project);
  }

  public onLogout() {
    this.authService.signOut();
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

}
