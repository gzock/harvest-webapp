import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Place } from '../../../private/dashboard/work/place';
import { Target } from '../../../private/dashboard/work/target';

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private projectId = '';
  private place!: Place;
  placeHistory: Place[] = [];
  constructor(private http: HttpClient) {}
  setProjectId(projectId: string): void { this.projectId = projectId; }
  private base(): string { return environment.base_url + '/projects/' + encodeURIComponent(this.projectId) + '/places'; }
  select(place: Place): void { this.place = place; }
  getCurrentPlace(): Place { return this.place; }
  list(placeId: string): Observable<{ places: Place[]; targets: Target[] }> {
    return this.http.get<{ places: Place[]; targets: Target[] }>(this.base() + '/' + encodeURIComponent(placeId) + '/children');
  }
  create(name: string, placeId = ''): Observable<unknown> {
    const path = placeId && placeId !== this.projectId ? '/' + encodeURIComponent(placeId) : '';
    return this.http.post(this.base() + path, { name });
  }
  update_name(placeId: string, name: string): Observable<unknown> {
    return this.http.put(this.base() + '/' + encodeURIComponent(placeId), { name });
  }
  delete(placeId: string): Observable<unknown> {
    return this.http.delete(this.base() + '/' + encodeURIComponent(placeId));
  }
}
