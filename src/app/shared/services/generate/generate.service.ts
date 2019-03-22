import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

import { Order } from './../../../private/dashboard/generate/order';

@Injectable({
  providedIn: 'root'
})
export class GenerateService {
  private generateUrl = environment.base_url + "/projects/";  // URL to web api
  private projectId: string;

  constructor(private http: HttpClient) { }

  public generateZip(projectId: string, order: Order) {
    let _generateUrl = this.generateUrl + projectId + "/generate/zip";
    return this.http.post(_generateUrl, order);
  }

  public generateExcelDoc(projectId: string, order: Order) {
    //let template = order.template;
    //let needCustomTemplate = false;

    let _generateUrl = this.generateUrl + projectId + "/generate/excel-doc";
    return this.http.post(_generateUrl, order);
  }

  public generate(projectId: string, order: Order) {
    console.log(order);
    switch(order.type) {
      case 'zip':
        return this.generateZip(projectId, order)
      case 'excel':
        return this.generateExcelDoc(projectId, order)
    }
  }
}
