import { HttpEvent,HttpHandler,HttpInterceptor,HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap,takeUntil } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';

export function isApiRequest(url: string, apiUrl: string): boolean {
  const base = new URL(apiUrl, globalThis.location?.origin || 'http://localhost');
  const target = new URL(url, globalThis.location?.origin || 'http://localhost');
  const path = base.pathname.replace(/\/$/, '');
  return target.origin === base.origin && (target.pathname === path || target.pathname.startsWith(path + '/'));
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!isApiRequest(request.url, environment.base_url)) return next.handle(request);
    return this.auth.getToken().pipe(switchMap(session => next.handle(request.clone({
      setHeaders: { Authorization: session.idToken.jwtToken },
    }))), takeUntil(this.auth.signedOut));
  }
}
