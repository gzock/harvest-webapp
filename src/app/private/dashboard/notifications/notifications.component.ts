import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Observable, of, merge, throwError, Subject, Subscription  } from "rxjs";
import { filter, map, tap, catchError } from "rxjs/operators";

import { AuthService } from './../../../shared/services/auth/auth.service';
import { AlertService } from './../../../shared/services/alert/alert.service';
import { NotificationsService } from './../../../shared/services/notifications/notifications.service';

import { Notification } from './notification';

import { SelectionModel } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public notifications: Notification[] = [] as Notification[];
  private notificationsSubscription: Subscription;
  public selection = new SelectionModel<Notification>(true, []);

  displayedColumns: string[] = ["select", "created_at", "message"];
  dataSource: MatTableDataSource<Notification>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

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
          if(notifications instanceof Array && notifications.length) {
            this.notifications = notifications;
            this.dataSource = new MatTableDataSource(this.notifications);
            this.dataSource.paginator = this.paginator;
            //this.dataSource.sort = this.sort;
          }
        },
        err => {
          console.log("error: " + err);
          this.openErrorAlert("プロジェクト一覧の取得");
        }
      );
  }

  ngOnDestroy() {
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
      .subscribe(
        response => {
          console.log(response);
        },
        err => {
          console.log(err);
        }
      );
  }

  public onDeleteNotifications(notifications: Notification[]) {
  //TODO: 何とかobservable.mergeでdeleteをまとめてsubscribeできないか
    this.notificationsService.deletes(notifications.map(item => item.notification_id));
    //  .subscribe(
    //    response => {
    //      console.log(response);
    //    },
    //    err => {
    //      console.log(err);
    //    }
    //  );
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  public masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  public checkboxLabel(row?: Notification): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.notification_id}`;
  }

  private openSuccessAlert(msg) {
    this.alert.openSuccessAlert(msg);
  }

  private openErrorAlert(msg) {
    this.alert.openErrorAlert(msg + "に失敗しました。内容をご確認の上、再度お試しください。");
  }

  public formatDate(date: string) {
    if(date) {
      let _date: Date = new Date(date);
      _date.setTime(_date.getTime() + 1000*60*60*9);
      return _date.getFullYear() + "/" + (_date.getMonth() + 1) + "/" + _date.getDate() + " " + _date.getHours() + ":" + _date.getMinutes();
    }
  }

}
