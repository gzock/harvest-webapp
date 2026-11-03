import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Target } from '../../../private/dashboard/work/target';

@Injectable({ providedIn: 'root' })
export class TargetsService {
  private projectId = '';
  constructor(private http: HttpClient) {}
  setProjectId(projectId: string): void { this.projectId = projectId; }
  private base(): string { return environment.base_url + '/projects/' + encodeURIComponent(this.projectId); }
  show(targetId: string): Observable<Target> {
    return this.http.get<Target>(this.base() + '/targets/' + encodeURIComponent(targetId));
  }
  create(name: string, placeId = ''): Observable<unknown> {
    const path = placeId && placeId !== this.projectId ? '/places/' + encodeURIComponent(placeId) : '';
    return this.http.post(this.base() + path + '/targets', { name });
  }
  update_name(targetId: string, name: string): Observable<unknown> {
    return this.http.put(this.base() + '/targets/' + encodeURIComponent(targetId), { name });
  }
  delete(targetId: string): Observable<unknown> {
    return this.http.delete(this.base() + '/targets/' + encodeURIComponent(targetId));
  }
}
