import { environment } from '../../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of, merge, concat, throwError, Subject, Subscription, BehaviorSubject, AsyncSubject } from "rxjs";
import { map, mergeMap, tap, catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class CorporationService {

  private corporationUrl = environment.base_url + '/corporation';  // URL to web api

  constructor(
    private http: HttpClient
  ) { }

  public show(): Observable<any> {
    return this.http.get(this.corporationUrl)
  }

  public createUser(userName: string, kanaUserName: string, email: string, password: string): Observable<any> {
    const body = {
      "username": userName,
      "kana_username": kanaUserName,
      "email": email,
      "password": password
    }
    return this.http.post(this.corporationUrl + "/users", body);
  }

}
