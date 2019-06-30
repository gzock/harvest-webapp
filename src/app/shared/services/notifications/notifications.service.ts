import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { AuthService } from './../auth/auth.service';
import { Notification } from "./../../../private/dashboard/notifications/notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private notificationsUrl = environment.base_url + '/users/';  // URL to web api

  private userId: string;
  private notificationId: string;
  public notifications: Notification[];
  public notificationsSubject: BehaviorSubject<Notification[]>;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { 
    this.authService.getData()
      .subscribe(
        userData => {
          this.notificationsUrl += `${userData.username}/notifications`;
        }
      )
    this.notificationsSubject = new BehaviorSubject<Notification[]>(this.notifications);
  }

  public show(notificationId: string): Observable<any> {
    return this.http.get(this.notificationsUrl + "/" + notificationId);
  }

  public list(): Observable<any> {
    return this.http.get(this.notificationsUrl)
        .pipe(
          tap(
            (notifications: Notification[]) => {
              if(notifications.length > 0) {
                this.notifications = notifications;
                this.notificationsSubject.next(notifications);
              }
            }
          )
        );
  }

  public update(notificationId: string, read: boolean): Observable<any> {
    return this.http.put(this.notificationsUrl + "/" + notificationId, {"read": read});
  }

  public read(notificationId: string): Observable<any> {
    return this.update(notificationId, true);
  }

  public reads(notificationIds: string[]): Observable<any> {
    console.log(notificationIds);
    return this.http.put(this.notificationsUrl, {"read": true, "notification_ids": notificationIds});
  }

  public delete(notificationId: string): Observable<any> {
    return this.http.delete(this.notificationsUrl + "/" + notificationId);
  }

  //public deletes(notificationIds: string[]): Observable<any> {
  public deletes(notificationIds: string[]) {
    console.log(notificationIds);
    for(let id of notificationIds) {
      this.http.delete(this.notificationsUrl + "/" + id).subscribe();
    }
  }

}
