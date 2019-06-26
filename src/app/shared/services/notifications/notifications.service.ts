import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { AuthService } from './../auth/auth.service';
import { Notification } from "./../../../private/dashboard/notification";

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  private notificationsUrl = environment.base_url + '/users/';  // URL to web api

  private userId: string;
  private notificationId: string;
  public notification: Notification;

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
  }

  public show(notificationId: string): Observable<any> {
    return this.http.get(this.notificationsUrl + "/" + notificationId);
  }

  public list(): Observable<any> {
    return this.http.get(this.notificationsUrl);
  }

  public update(notificationId: string, read: boolean): Observable<any> {
    return this.http.put(this.notificationsUrl + "/" + notificationId, {"read": read});
  }

  public delete(notificationId: string): Observable<any> {
    return this.http.delete(this.notificationsUrl + "/" + notificationId);
  }

}
