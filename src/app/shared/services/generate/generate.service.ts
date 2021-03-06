import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";
import { timeout } from 'rxjs/operators';

import { Order } from './../../../private/dashboard/generate/order';

@Injectable({
  providedIn: 'root'
})
export class GenerateService {
  private TIMEOUT: number = 150;
  private generateUrl = environment.base_url + "/projects/";  // URL to web api
  private projectId: string;

  constructor(private http: HttpClient) { }

  public list(projectId: string) {
    let _generateUrl = this.generateUrl + projectId + "/generate";
    return this.http.get(_generateUrl);
  }

  public generate(projectId: string, order: Order) {
    let _generateUrl = this.generateUrl + projectId + "/generate";
    return this.http.post(_generateUrl, order).pipe(timeout(this.TIMEOUT * 1000));
  }

  public generateDownloadUrl(projectId: string, generatedFileName) {
    let _generateUrl = this.generateUrl + projectId + "/generate/" + generatedFileName + "/download";
    return this.http.put(_generateUrl, {});
  }
}
