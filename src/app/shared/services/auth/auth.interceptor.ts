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

    return this.auth.getToken()
            .pipe(
              mergeMap((token: string) => {
                request = request.clone({
                  headers:
                    request.headers
                      .set('Content-Type', 'application/json;charset=utf-8')
                      .set('Authorization', token['idToken']['jwtToken'])
                });
                return next.handle(request);
              })
            );

  }
}
