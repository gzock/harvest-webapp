import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { TemplateConfig } from './../../../private/dashboard/generate/template-config';

@Injectable({
  providedIn: 'root'
})
export class TemplateService {
  private templateUrl = environment.base_url + "/projects/";  // URL to web api
  private projectId: string;

  constructor(private http: HttpClient) { }

  public get(projectId: string, templateId: string) {
    let _templateUrl = this.templateUrl + projectId + "/templates/" + templateId;
    return this.http.get(_templateUrl);
  }

  public list(projectId: string) {
    let _templateUrl = this.templateUrl + projectId + "/templates";
    return this.http.get(_templateUrl);
  }

  public create(projectId: string, config: TemplateConfig) {
    let _templateUrl = this.templateUrl + projectId + "/templates";
    return this.http.post(_templateUrl, config);
  }
}
