import { HttpRequest,HttpResponse } from '@angular/common/http';
import { firstValueFrom,of,Subject } from 'rxjs';
import { describe,expect,it,vi } from 'vitest';
import { environment } from '../../../../environments/environment';
import { AuthInterceptor,isApiRequest } from './auth.interceptor';
describe('API token boundary', () => {
  it.each([
    ['https://api.example.test/v1/projects', true],
    ['https://api.example.test/v1', true],
    ['https://api.example.test/v10/projects', false],
    ['https://api.example.test.evil.test/v1', false],
    ['https://bucket.s3.amazonaws.com/key?signature=1', false],
  ])('matches %s as %s', (url, expected) => expect(isApiRequest(url, 'https://api.example.test/v1')).toBe(expected));
  it('leaves signed file uploads untouched without resolving a session', async () => {
    const auth = { signedOut: new Subject<void>(), getToken: vi.fn() };
    const interceptor = new AuthInterceptor(auth as never);
    const request = new HttpRequest('PUT', 'https://bucket.s3.amazonaws.com/photo', new Blob());
    const next = { handle: vi.fn((_request: HttpRequest<unknown>) => of(new HttpResponse())) };
    await firstValueFrom(interceptor.intercept(request, next));
    expect(auth.getToken).not.toHaveBeenCalled();
    expect(next.handle).toHaveBeenCalledWith(request);
  });
  it('cancels token lookup and in-flight API responses on sign-out', () => {
    const signedOut = new Subject<void>();
    const token = new Subject<{ idToken: { jwtToken: string } }>();
    const response = new Subject<HttpResponse<unknown>>();
    const next = { handle: vi.fn(() => response) };
    const interceptor = new AuthInterceptor({ signedOut, getToken: () => token } as never);
    interceptor.intercept(new HttpRequest('GET', environment.base_url + '/projects'), next).subscribe();
    signedOut.next();
    token.next({ idToken: { jwtToken: 'old.jwt' } });
    expect(next.handle).not.toHaveBeenCalled();
    interceptor.intercept(new HttpRequest('GET', environment.base_url + '/projects'), next).subscribe();
    token.next({ idToken: { jwtToken: 'new.jwt' } });
    expect(response.observed).toBe(true);
    signedOut.next();
    expect(response.observed).toBe(false);
  });
  it('adds only the ID-token authorization header to the API', async () => {
    const auth = { signedOut: new Subject<void>(), getToken: () => of({ idToken: { jwtToken: 'id.jwt' } }) };
    const next = { handle: vi.fn((_request: HttpRequest<unknown>) => of(new HttpResponse())) };
    await firstValueFrom(new AuthInterceptor(auth as never).intercept(new HttpRequest('GET', environment.base_url + '/projects'), next));
    const request = next.handle.mock.calls[0][0] as HttpRequest<unknown>;
    expect(request.headers.get('Authorization')).toBe('id.jwt');
    expect(request.headers.has('Content-Type')).toBe(false);
  });
});
