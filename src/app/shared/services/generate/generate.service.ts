import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GenerateService {
  private generateUrl = environment.base_url + "/projects/";  // URL to web api
  private projectId: string;

  constructor(private http: HttpClient) { }

  public generateZip(projectId) {
    let _generateUrl = this.generateUrl + projectId + "/generate/zip";
    return this.http.post(_generateUrl, {});
  }
  public generateDoc(projectId) {
    let _generateUrl = this.generateUrl + projectId + "/generate/doc";
    return this.http.post(_generateUrl, {});
  }
}
