import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(public auth: AuthService) {}
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    request = request.clone({
      headers:
        request.headers
          .set('Content-Type', 'application/json;charset=utf-8')
          .set('Authorization', this.auth.getToken())
    });

    return next.handle(request);
    //console.log(this.auth.getIdToken());
    //return this.auth.getIdToken()
    //          .mergeMap((token: string) => {
    //            console.log(token);
    //            request = request.clone({
    //              headers:
    //                request.headers
    //                  .set('Content-Type', 'application/json;charset=utf-8')
    //                  .set('Authorization', token['idToken']['jwtToken'])
    //            });
    //            return next.handle(request);
    //          });
    return next.handle(request);
    //      return result['__zone_symbol__value']['idToken']['jwtToken'];
    
    //this.auth.getIdToken()
    //    .subscribe(
    //      result => {
    //        console.log(result);
    //        request = request.clone({
    //          setHeaders: {
    //            Authorization: result['idToken']['jwtToken']
    //          }
    //        });
    //        return next.handle(request);
    //      },
    //      error => {
    //        console.log(error);
    //        return next.handle(request);
    //      });
    //return next.handle(request);
    //request = request.clone({
    //  setHeaders: {
    //    Authorization: this.auth.getIdToken()
    //  }
    //});

  }
}
