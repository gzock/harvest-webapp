import { BreakpointObserver,Breakpoints } from '@angular/cdk/layout';
import { Platform } from '@angular/cdk/platform';
import { ChangeDetectionStrategy,Component,OnDestroy,OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable,ReplaySubject,Subscription,takeUntil } from 'rxjs';
import { map } from "rxjs/operators";
import { GuestPermissions } from '../../shared/services/projects/action-permissions/permissions/guest-permissions';
import { formatJapanDate } from '../../shared/utils/date';

import { AlertService } from './../../shared/services/alert/alert.service';
import { AuthService } from './../../shared/services/auth/auth.service';
import { NotificationsService } from './../../shared/services/notifications/notifications.service';
import { Permissions } from './../../shared/services/projects/action-permissions/permissions/permissions';
import { ProjectsService } from './../../shared/services/projects/projects.service';
import { Notification } from './notifications/notification';
import { Project } from './projects/project';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new ReplaySubject<void>(1);
  public projects: Project[] = [];
  public notifications: Notification[] = [] as Notification[];
  private currentProject: Project | null = null;
  public currentProjectName: string = '';
  private currentProjectSubscription?: Subscription;
  private joinedProjectsSubscription?: Subscription;
  public isMobile: boolean = false;
  public permissions: Permissions = new GuestPermissions();

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
    this.notificationsService.notificationsSubject.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.notifications = items;
    });
    if(this.platform.ANDROID || this.platform.IOS) {
      this.isMobile = true;
    }
    if (this.router.url === '/') {
      this.router.navigate(['/dashboard']);

    } else {
      this.projectsService.list()
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           (response: Project[]) => {
              this.projects = response;
           },
           _err => {

             this.openErrorAlert("プロジェクト一覧の取得");
           }
        );
      this.joinedProjectsSubscription = this.projectsService.joinedProjectsSubject
        .subscribe(
          projects => {
            this.projects = projects;
          },
          _err => {

            this.openErrorAlert("プロジェクト一覧の取得");
          }
        );
      this.currentProjectSubscription = this.projectsService.currentProjectSubject
        .subscribe(
          project => {
            this.currentProject = project;
            this.currentProjectName = project?.name || '';
            this.permissions = this.projectsService.getCurrentPermissions();
          },
          _error => {

          }
        );
      this.notificationsService.list()
        .pipe(
           takeUntil(this.destroy$)
        )
        .subscribe(
           (response: Notification[]) => {
              this.notifications = response;
           },
           _err => {

             this.openErrorAlert("通知一覧の取得");
           }
        );
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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

  private openErrorAlert(msg: string) {
    this.alert.openErrorAlert(msg + "に失敗しました。再度、お試しください。");
  }

  public formatDate(date: string) {
    return formatJapanDate(date, true);
  }

}
