import { ChangeDetectionStrategy,Component,OnDestroy,OnInit } from '@angular/core';
import { ReplaySubject,Subscription } from "rxjs";
import { switchMap,takeUntil } from "rxjs/operators";
import { formatJapanDate } from '../../../shared/utils/date';

import { AlertService } from './../../../shared/services/alert/alert.service';
import { AuthService } from './../../../shared/services/auth/auth.service';
import { NotificationsService } from './../../../shared/services/notifications/notifications.service';

import { Notification } from './notification';

import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  standalone: false,
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new ReplaySubject<void>(1);
  public notifications: Notification[] = [] as Notification[];
  private notificationsSubscription?: Subscription;
  public selection = new SelectionModel<Notification>(true, []);

  displayedColumns: string[] = ["select", "created_at", "message"];
  dataSource = new MatTableDataSource<Notification>([]);

  //@ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  //@ViewChild(MatSort, {static: true}) sort!: MatSort;

  constructor(
    private auth: AuthService,
    private alert: AlertService,
    private notificationsService: NotificationsService
  ) {
  }

  ngOnInit() {
    this.notificationsSubscription = this.notificationsService.notificationsSubject
      .subscribe(
        (notifications: Notification[]) => {
          if(notifications instanceof Array) {
            this.notifications = notifications;
            this.dataSource = new MatTableDataSource(this.notifications);
            //this.dataSource.paginator = this.paginator;
            //this.dataSource.sort = this.sort;
          }
        },
        _err => {

          this.openErrorAlert("プロジェクト一覧の取得");
        }
      );
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public onReadNotifications(notifications: Notification[]) {
    this.notificationsService.reads(notifications.map(item => item.notification_id))
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        _response => {

        },
        _err => {

        }
      );
  }

  public onDeleteNotifications(notifications: Notification[]) {
    this.notificationsService.deletes(notifications.map(item => item.notification_id))
      .pipe(switchMap(() => this.notificationsService.list()), takeUntil(this.destroy$))
      .subscribe({ next: () => this.selection.clear(), error: () => this.openErrorAlert('通知の削除') });
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    if (this.isAllSelected()) this.selection.clear();
    else this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  public checkboxLabel(row?: Notification): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.notification_id}`;
  }

  private openSuccessAlert(msg: string) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg: string) {
    this.alert.openErrorAlert(msg + "に失敗しました。内容をご確認の上、再度お試しください。");
  }

  public formatDate(date: string) {
    return formatJapanDate(date, true);
  }

}
