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
export class PhotosService {
  
  private photoUrl = environment.base_url;  // URL to web api

  private place: Place;
  private photo: Target;

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  private projectId: string;
  private placeId: string;

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public setProjectId(projectId) {
    this.projectId = projectId;
    this.photoUrl = environment.base_url + "/projects/" + projectId + "/places";
  }

  public setTargetId(placeId) {
    this.placeId = placeId;
    //this.photoUrl = environment.base_url + "/projects/" + projectId + "/places";
  }

  public list(placeId = ""): Observable<any> {
    if(placeId) {
      return this.http.get(this.photoUrl + "/" + placeId + "/children");
    } else {
      return this.http.get(this.photoUrl);
    }
  }

  public show(targetId, photoId): Observable<any> {
    let photoUrl = environment.base_url + "/projects/" + this.projectId + "/targets/" + targetId + "/photos";
    return this.http.get(photoUrl + "/" + photoId);
  }

  public create(targetId, type, photoData): Observable<any> {
    let photoUrl = environment.base_url + "/projects/" + this.projectId + "/targets/" + targetId + "/photos";
    return this.http.post(photoUrl, { "type": type, "data": photoData });
  }

  public delete(targetId, photoId): Observable<any> {
    let photoUrl = environment.base_url + "/projects/" + this.projectId + "/targets/" + targetId + "/photos";
    return this.http.delete(photoUrl + "/" + photoId);
  }

  public adopt(targetId, type, photoId) {
    let photoUrl = environment.base_url + "/projects/" + this.projectId + "/targets/" + targetId + "/photos";
    return this.http.put(photoUrl + "/" + photoId, { "type": type });
  }

}
