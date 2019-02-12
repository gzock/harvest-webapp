import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { Project } from "./../../../private/dashboard/projects/project";

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private projectUrl = environment.base_url + '/projects';  // URL to web api

  //private userId: string = localStorage.getItem("_id");
  private userId: string;
  public project: Project;
  public currentProject: Project;
  public joinedProjects: Project[];
  //public requestSubject = new Subject<NwConfRequest>();

  constructor(private http: HttpClient) { }

  public setUserId(userId) {
    this.userId = userId;
  }

  public select(project) {
    this.currentProject = project;
    console.log("current project: " + JSON.stringify(this.currentProject));
  }

  public getCurrentProject() {
    return this.currentProject;
  }

  public list(): Observable<any> {
    // 可能なら返す前にresponseを自動的にjoinedProjectsに入れてしまいたい
    return this.http.get(this.projectUrl);
  }

  public show(projectId): Observable<any> {
    return this.http.get(this.projectUrl + "/" + projectId);
  }

  public create(project): Observable<any> {
    //return this.http.post(this.projectUrl, { "name": name });
    return this.http.post(this.projectUrl, project);
  }

  public update(projectId, name): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId, { "name": name });
  }

  public delete(projectId): Observable<any> {
    return this.http.delete(this.projectUrl + "/" + projectId);
  }





  /*
  onGetDraftRequestList(): Observable<any> {
    return this.onGetDraftRequest().pipe(map(response => { return {title: "下書き", list: response}; }));
  }

  public onGetRequestForUserSide(): Observable<any> {
    return concat(
        this.onGetDraftRequestListByUserId(),
        this.onGetInProgressRequestListByUserId(),
        this.onGetRemandRequestListByUserId(),
        this.onGetChangedRequestListByUserId(),
        this.onGetDoneRequestListByUserId()
      );
  }

  public selected(request: NwConfRequest) {
    this.request = request;
    this.requestSubject.next(this.request);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
  */
}
