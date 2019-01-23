import { environment } from '../../../environments/environment';
import { Injectable }    from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { LoginUser } from './login';

@Injectable()
export class LoginService {
//  private loginUrl = environment.base_url + '/api/login';  // URL to web api
//   
//  constructor(private http: Http) { }
//   
//  onLoggedin(username, password): Promise<LoginUser> {
//
//    let headers = new Headers();
//    headers.append('Content-Type','application/x-www-form-urlencoded');
//    let options = new RequestOptions({ headers: headers, withCredentials: true });
//
//    const body = {username: username, password: password}
//
//    return this.http.post(this.loginUrl, body, options)
//               .toPromise()
//               //.then(response => console.log(response.json().data))
//               .then(response => response.json() as LoginUser)
//               .catch(this.handleError);
//  }
//   
//  private handleError(error: any): Promise<any> {
//    console.error('An error occurred', error); // for demo purposes only
//    return Promise.reject(error.message || error);
//  }
}
