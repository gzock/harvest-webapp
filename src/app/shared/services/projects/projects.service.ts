import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject,EMPTY,Observable,Subject,defer } from 'rxjs';
import { switchMap,takeUntil,tap,timeout } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Project } from '../../../private/dashboard/projects/project';
import { ProjectJoinUser } from '../../components/setting-project/project-join-user';
import { AuthService } from '../auth/auth.service';
import { ActionPermissions } from './action-permissions/action-permissions';
import { Permissions } from './action-permissions/permissions/permissions';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly TIMEOUT = 150;
  private readonly projectUrl = environment.base_url + '/projects';
  private userId = '';
  private readonly refreshStarted = new Subject<void>();
  currentProject: Project | null = null;
  joinedProjects: Project[] = [];
  private readonly projectsState = new BehaviorSubject<Project[]>([]);
  private readonly selectionState = new BehaviorSubject<Project | null>(null);
  readonly joinedProjectsSubject = this.projectsState.asObservable();
  readonly currentProjectSubject = this.selectionState.asObservable();
  private readonly actionPermissions = new ActionPermissions();

  constructor(private http: HttpClient, private auth: AuthService) {
    auth.signedOut.subscribe(() => this.reset());
  }
  setUserId(userId: string): void { this.userId = userId; }
  select(project: Project | null): void {
    this.currentProject = project;
    if (this.userId) {
      if (project) localStorage.setItem(this.storageKey, project.project_id);
      else localStorage.removeItem(this.storageKey);
    }
    this.selectionState.next(project);
  }
  getCurrentProject(): Project | null { return this.currentProject; }
  getCurrentPermissions(): Permissions {
    return this.actionPermissions.permissions(this.currentProject?.role || 'guest');
  }
  list(): Observable<Project[]> {
    return defer(() => {
      this.refreshStarted.next();
      return this.auth.getData().pipe(
      switchMap(user => {
        if (this.userId !== user.username) {
          this.reset();
          this.userId = user.username;
        }
        return this.http.get<Project[]>(this.projectUrl);
      }),
      takeUntil(this.auth.signedOut),
      takeUntil(this.refreshStarted),
      tap(projects => {
        const selectedId = this.currentProject?.project_id || localStorage.getItem(this.storageKey);
        this.joinedProjects = projects;
        this.select(projects.find(p => p.project_id === selectedId) || projects[0] || null);
        this.projectsState.next(projects);
      }),
      );
    });
  }
  private get storageKey(): string { return 'harvest.selectedProject.' + this.userId; }
  private reset(): void {
    this.currentProject = null;
    this.joinedProjects = [];
    this.selectionState.next(null);
    this.projectsState.next([]);
    this.userId = '';
  }
  public show(projectId: string): Observable<any> {
    return this.http.get(this.projectUrl + "/" + projectId);
  }

  public create(project: Project): Observable<any> {
    return this.http.post(this.projectUrl, project);
  }

  public update(projectId: string, updateProject: Project): Observable<any> {
    if (!this.currentProject) return EMPTY;
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

  public delete(projectId: string): Observable<any> {
    return this.http.delete(this.projectUrl + "/" + projectId);
  }

  public import(csv: string): Observable<any> {
    if(this.currentProject) {
      return this.http.post(this.projectUrl + "/" + this.currentProject.project_id + "/import", { "csv": csv }).pipe(timeout(this.TIMEOUT * 1000));
    }
    return EMPTY;
  }

  public listUsers(projectId: string): Observable<ProjectJoinUser[]> {
    return this.http.get<ProjectJoinUser[]>(this.projectUrl + "/" + projectId + "/users");
  }

  public updateRole(projectId: string, userId: string, role: string): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "update", "role": role});
  }

  public joinProject(projectId: string): Observable<any> {
    return this.http.post(this.projectUrl + "/" + projectId + "/users", {"action": "join"});
  }

  public acceptUser(projectId: string, userId: string): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "accept"});
  }

  public rejectUser(projectId: string, userId: string): Observable<any> {
    return this.http.put(this.projectUrl + "/" + projectId + "/users/" + userId, {"action": "reject"});
  }

  public deleteUser(projectId: string, userId: string): Observable<any> {
    return this.http.delete(this.projectUrl + "/" + projectId + "/users/" + userId, {});
  }

}
