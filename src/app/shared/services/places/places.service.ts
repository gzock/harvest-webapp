import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { Place } from "./../../../private/dashboard/work/place";

@Injectable({
  providedIn: 'root'
})
export class PlacesService {

  private placeUrl = environment.base_url;  // URL to web api

  private place: Place;
  public placeHistory: Place[] = [];

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  private projectId: string;
  //public requestSubject = new Subject<NwConfRequest>();

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public setProjectId(projectId) {
    this.projectId = projectId;
    this.placeUrl = environment.base_url + "/projects/" + projectId + "/places";
  }

  public select(place) {
    this.place = place;
    console.log("current place: " + JSON.stringify(this.place));
  }

  public getCurrentPlace() {
    return this.place;
  }

  public list(placeId = ""): Observable<any> {
    if(placeId) {
      return this.http.get(this.placeUrl + "/" + placeId + "/children");
    } else {
      return this.http.get(this.placeUrl);
    }
  }

  public show(placeId): Observable<any> {
    return this.http.get(this.placeUrl + "/" + placeId);
  }

  public create(name, placeId = ""): Observable<any> {
    if(placeId === this.projectId) placeId = ""
    if(placeId) {
      return this.http.post(this.placeUrl + "/" + placeId, { "name": name,  });
    } else {
      return this.http.post(this.placeUrl, { "name": name,  });
    }
  }

  public update_name(placeId, name): Observable<any> {
    return this.http.put(this.placeUrl + "/" + placeId, { "name": name });
  }

  public delete(placeId): Observable<any> {
    return this.http.delete(this.placeUrl + "/" + placeId);
  }
}
