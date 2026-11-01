import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

import { Observable } from "rxjs";

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

  public deleteUser(userName: string): Observable<any> {
    return this.http.delete(this.corporationUrl + "/users/" + userName);
  }

}
