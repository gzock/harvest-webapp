import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject,Observable,forkJoin,of } from 'rxjs';
import { switchMap,takeUntil,tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Notification } from '../../../private/dashboard/notifications/notification';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  notifications: Notification[] = [];
  private readonly state = new BehaviorSubject<Notification[]>([]);
  readonly notificationsSubject = this.state.asObservable();
  constructor(private authService: AuthService, private http: HttpClient) {
    authService.signedOut.subscribe(() => { this.notifications = []; this.state.next([]); });
  }
  private request<T>(execute: (url: string) => Observable<T>): Observable<T> {
    return this.authService.getData().pipe(
      switchMap(user => execute(environment.base_url + '/users/' + encodeURIComponent(user.username) + '/notifications')),
      takeUntil(this.authService.signedOut),
    );
  }
  show(id: string) { return this.request(url => this.http.get<Notification>(url + '/' + id)); }
  list(): Observable<Notification[]> {
    return this.request(url => this.http.get<Notification[]>(url)).pipe(tap(items => {
      this.notifications = items;
      this.state.next(items);
    }));
  }
  update(id: string, read: boolean) { return this.request(url => this.http.put(url + '/' + id, { read })); }
  read(id: string) { return this.update(id, true); }
  reads(notificationIds: string[]) { return this.request(url => this.http.put(url, { read: true, notification_ids: notificationIds })); }
  delete(id: string) { return this.request(url => this.http.delete(url + '/' + id)); }
  deletes(ids: string[]) { return ids.length ? forkJoin(ids.map(id => this.delete(id))) : of([]); }
}
