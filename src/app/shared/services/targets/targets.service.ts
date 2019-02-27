import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { Place } from "./../../../private/dashboard/work/place";
import { Target } from "./../../../private/dashboard/work/target";

@Injectable({
  providedIn: 'root'
})
export class TargetsService {

  private targetUrl = environment.base_url;  // URL to web api

  private place: Place;
  private currentTarget: Target;

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  private projectId: string;
  private placeId: string;
  //public requestSubject = new Subject<NwConfRequest>();

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public setProjectId(projectId) {
    this.projectId = projectId;
    this.targetUrl = environment.base_url + "/projects/" + projectId + "/places";
  }

  public setPlaceId(placeId) {
    this.placeId = placeId;
    //this.targetUrl = environment.base_url + "/projects/" + projectId + "/places";
  }

  public select(target) {
    this.currentTarget = target;
    console.log("current target: " + JSON.stringify(this.currentTarget));
  }

  public getCurrentTarget() {
    return this.currentTarget;
  }

  public show(targetId): Observable<any> {
    return this.http.get(this.targetUrl + this.placeId + "/targets/" + targetId);
  }

  public create(name, placeId = ""): Observable<any> {
    if(placeId === this.projectId) placeId = ""
    if(placeId) {
      return this.http.post(this.targetUrl + "/" + placeId + "/targets", { "name": name,  });
    } else {
      let targetUrl = environment.base_url + "/projects/" + this.projectId + "/targets";
      return this.http.post(targetUrl, { "name": name });
    }
  }

  public update_name(targetId, name): Observable<any> {
    let targetUrl = environment.base_url + "/projects/" + this.projectId + "/targets/" + targetId;
    return this.http.put(targetUrl, { "name": name });
  }

  public delete(targetId): Observable<any> {
    return this.http.delete(this.targetUrl + this.placeId + "/targets/" + targetId);
  }
}
