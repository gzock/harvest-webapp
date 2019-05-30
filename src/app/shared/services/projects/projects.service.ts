import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { Project } from "./../../../private/dashboard/projects/project";
import { Permissions } from "./action-permissions/permissions/permissions";
import { ActionPermissions } from "./action-permissions/action-permissions";

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private projectUrl = environment.base_url + '/projects';  // URL to web api

  private userId: string;
  public project: Project;
  public joinedProjects: Project[];
  public joinedProjectsSubject: BehaviorSubject<Project[]>;
  //public currentProject: Project = JSON.parse(localStorage.getItem('selectedProject')) as Project;
  public currentProject: Project = {} as Project;
  public currentProjectSubject: BehaviorSubject<Project>;
  private actionPermissions: ActionPermissions;;
  private permissions: Permissions = {} as Permissions;

  constructor(private http: HttpClient) { 
    this.joinedProjectsSubject = new BehaviorSubject<Project[]>(this.joinedProjects);
    this.currentProjectSubject = new BehaviorSubject<Project>(this.currentProject);
    this.actionPermissions = new ActionPermissions();
  }

  public setUserId(userId) {
    this.userId = userId;
  }

  public select(project) {
    this.currentProject = project;
    this.permissions = this.actionPermissions.permissions(project.role);

    localStorage.setItem('selectedProject', JSON.stringify(project));
    this.currentProjectSubject.next(project);
  }

  public getCurrentProject(): Project {
    let project = this.currentProject || JSON.parse(localStorage.getItem('selectedProject'));
    if(project) {
      this.permissions = this.actionPermissions.permissions(project.role);
    }
    return project;
  }

  public getCurrentPermissions(): Permissions {
    return Object.keys(this.permissions).length ? this.permissions : this.actionPermissions.permissions(this.currentProject.role);
  }

  public list(): Observable<any> {
    return this.http.get(this.projectUrl)
        .pipe(
          tap(
            (projects: Project[]) => {
              this.joinedProjects = projects;
              this.joinedProjectsSubject.next(projects);
              this.renewSelectedProject();
            }
          )
        );
  }

  private renewSelectedProject() {
    const newProject: Project = this.joinedProjects.find(
      project => project.project_id === this.currentProject.project_id
    );
    if(newProject && this.currentProject) {
      if(newProject.name !== this.currentProject.name || newProject.role !== this.currentProject.role) {
        this.select(newProject);
      }
    }
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

  public import(csv): Observable<any> {
    if(this.currentProject) {
      return this.http.post(this.projectUrl + "/" + this.currentProject.project_id + "/import", { "csv": csv });
    }
  }

  public listUsers(projectId): Observable<any> {
    return this.http.get(this.projectUrl + "/" + projectId + "/users");
  }

  public updateRole(projectId, userId, role): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "update", "role": role});
  }

  public joinProject(projectId): Observable<any> {
    return this.http.post(this.projectUrl + "/" + projectId + "/users", {"action": "join"});
  }

  public acceptUser(projectId, userId): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "accept"});
  }

  public rejectUser(projectId, userId): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "reject"});
  }

  public deleteUser(projectId, userId): Observable<any> {
    return this.http.delete(this.projectUrl + "/" + projectId + "/users/" + userId, {});
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
