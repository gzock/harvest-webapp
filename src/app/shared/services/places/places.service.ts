import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private placeUrl = environment.base_url + '/places';  // URL to web api

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  //public requestSubject = new Subject<NwConfRequest>();

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public list(): Observable<any> {
    return this.http.get(this.placeUrl);
  }

  public show(placeId): Observable<any> {
    return this.http.get(this.placeUrl + "/" + placeId);
  }

  public create(name): Observable<any> {
    return this.http.post(this.placeUrl, { "name": name });
  }

  public update(placeId, name): Observable<any> {
    return this.http.put(this.placeUrl + "/" + placeId, { "name": name });
  }

  public delete(placeId): Observable<any> {
    return this.http.delete(this.placeUrl + "/" + placeId);
  }
}
