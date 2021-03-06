import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";
import { timeout } from 'rxjs/operators';

import { Project } from "./../../../private/dashboard/projects/project";
import { Permissions } from "./action-permissions/permissions/permissions";
import { ActionPermissions } from "./action-permissions/action-permissions";

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  private TIMEOUT: number = 150;
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
    let savedProject = localStorage.getItem('selectedProject');
    if(savedProject) {
      this.currentProject = JSON.parse(savedProject);
    }

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
    let project = Object.keys(this.currentProject).length ? this.currentProject : JSON.parse(localStorage.getItem('selectedProject'));
    if(project && Object.keys(project).length ) {
    //if(Object.keys(project).length ) {
      this.permissions = this.actionPermissions.permissions(project.role);
      return project;
    }
  }

  public getCurrentPermissions(): Permissions {
    return Object.keys(this.permissions).length ? this.permissions : this.actionPermissions.permissions(this.currentProject.role);
  }

  public list(): Observable<any> {
    return this.http.get(this.projectUrl)
        .pipe(
          tap(
            (projects: Project[]) => {
              if(projects.length == 0) {
                let project = JSON.parse(localStorage.getItem('selectedProject'));
                if(project) {
                  localStorage.removeItem('selectedProject');
                }

              } else if(projects.length == 1 || Object.keys(this.currentProject).length == 0) {
                this.renewSelectedProject(projects[0]);

              } else if(projects.length > 1) {
                let project: Project[] = projects.filter( project => project.project_id === this.currentProject.project_id )
                if(project.length) {
                  this.renewSelectedProject(project[0]);
                } else {
                  this.select(projects[0]);
                }
              }
              this.joinedProjects = projects;
              this.joinedProjectsSubject.next(projects);
            }
          )
        );
  }

 private renewSelectedProject(project: Project) {
   if(project && this.currentProject) {
     if(project.name !== this.currentProject.name || project.role !== this.currentProject.role) {
       this.select(project);
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

  public update(projectId, updateProject: Project): Observable<any> {
    if(! updateProject.name) {
      updateProject.name = this.currentProject.name;
    }
    if(! updateProject.start_on) {
      updateProject.start_on = this.currentProject.start_on;
    }
    if(! updateProject.complete_on) {
      updateProject.complete_on = this.currentProject.complete_on;
    }
    const project = {
      name: updateProject.name,
      start_on: updateProject.start_on,
      complete_on: updateProject.complete_on
    }
    return this.http.put(this.projectUrl + "/" + projectId, project);
  }

  public delete(projectId): Observable<any> {
    return this.http.delete(this.projectUrl + "/" + projectId);
  }

  public import(csv): Observable<any> {
    if(this.currentProject) {
      return this.http.post(this.projectUrl + "/" + this.currentProject.project_id + "/import", { "csv": csv }).pipe(timeout(this.TIMEOUT * 1000));
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
