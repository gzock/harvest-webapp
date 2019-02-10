import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class TargetsService {

  private targetUrl = environment.base_url + '/targets';  // URL to web api

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  //public requestSubject = new Subject<NwConfRequest>();

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public list(): Observable<any> {
    return this.http.get(this.targetUrl);
  }

  public show(targetId): Observable<any> {
    return this.http.get(this.targetUrl + "/" + targetId);
  }

  public create(name): Observable<any> {
    return this.http.post(this.targetUrl, { "name": name });
  }

  public update(targetId, name): Observable<any> {
    return this.http.put(this.targetUrl + "/" + targetId, { "name": name });
  }

  public delete(targetId): Observable<any> {
    return this.http.delete(this.targetUrl + "/" + targetId);
  }
}
