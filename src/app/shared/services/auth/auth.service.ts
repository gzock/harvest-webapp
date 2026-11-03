import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Amplify } from 'aws-amplify';
import {
confirmSignIn,
confirmSignUp,
fetchAuthSession,
fetchUserAttributes,
getCurrentUser,
signIn,
signOut,
signUp,
updatePassword,
} from 'aws-amplify/auth';
import { BehaviorSubject,Observable,Subject,defer,from,of } from 'rxjs';
import { catchError,map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface SessionUser {
  username: string;
  attributes: Record<string, string | undefined>;
}
export interface LegacySession {
  idToken: { jwtToken: string; payload: Record<string, any> };
}
export type SessionState = 'unknown' | 'anonymous' | 'challenge' | 'authenticated';

/** Keeps Cognito/Amplify response formats out of the existing feature screens. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private sessionEpoch = 0;
  readonly loggedIn = new BehaviorSubject<boolean>(false);
  readonly state = new BehaviorSubject<SessionState>('unknown');
  readonly signedOut = new Subject<void>();

  constructor(private router: Router) {
    const config = environment.amplify.Auth;
    Amplify.configure({ Auth: { Cognito: {
      userPoolId: config.userPoolId,
      userPoolClientId: config.userPoolWebClientId,
    } } });
  }

  signUp(email: string, password: string, attributes: Record<string, string>) {
    return defer(() => signUp({ username: email, password, options: { userAttributes: attributes } }));
  }
  confirmSignUp(email: string, code: string) {
    return defer(() => confirmSignUp({ username: email, confirmationCode: code }));
  }
  signIn(email: string, password: string) {
    return defer(async () => {
      const epoch = ++this.sessionEpoch;
      const result = await signIn({ username: email, password });
      if (epoch !== this.sessionEpoch) throw new Error('Session ended');
      return result;
    }).pipe(map(result => {
      this.setAuthenticated(result.isSignedIn);
      if (result.nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        this.state.next('challenge');
      }
      return result;
    }));
  }
  completeNewPassword(password: string) {
    return defer(async () => {
      const epoch = ++this.sessionEpoch;
      const result = await confirmSignIn({ challengeResponse: password });
      if (epoch !== this.sessionEpoch) throw new Error('Session ended');
      return result;
    }).pipe(map(result => {
      this.setAuthenticated(result.isSignedIn);
      return result;
    }));
  }
  isAuthenticated(): Observable<boolean> {
    return defer(() => {
      const epoch = this.sessionEpoch;
      return this.getData().pipe(map(() => true), catchError(() => {
        if (epoch === this.sessionEpoch) this.setAuthenticated(false);
        return of(false);
      }));
    });
  }
  isCorporationUser(): Observable<boolean> {
    return this.getData().pipe(
      map(user => user.attributes['custom:user_type'] === 'corporation'),
      catchError(() => of(false)),
    );
  }
  getData(): Observable<SessionUser> {
    return defer(async () => {
      const epoch = this.sessionEpoch;
      const [user, attributes] = await Promise.all([getCurrentUser(), fetchUserAttributes()]);
      if (epoch !== this.sessionEpoch) throw new Error('Session ended');
      this.setAuthenticated(true);
      return { username: user.username, attributes };
    });
  }
  getToken(): Observable<LegacySession> {
    return defer(async () => {
      const epoch = this.sessionEpoch;
      const session = await fetchAuthSession();
      if (epoch !== this.sessionEpoch) throw new Error('Session ended');
      if (!session.tokens?.idToken) throw new Error('Not authenticated');
      return { idToken: {
        jwtToken: session.tokens.idToken.toString(),
        payload: session.tokens.idToken.payload,
      } };
    });
  }
  signOut(): void {
    // Clear feature state immediately, even when the remote sign-out fails.
    this.sessionEpoch++;
    this.setAuthenticated(false);
    this.signedOut.next();
    localStorage.removeItem('selectedProject');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    from(signOut()).subscribe({
      next: () => void this.router.navigate(['/login']),
      error: () => void this.router.navigate(['/login']),
    });
  }
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return defer(() => updatePassword({ oldPassword, newPassword })).pipe(map(() => true));
  }
  private setAuthenticated(value: boolean): void {
    this.loggedIn.next(value);
    this.state.next(value ? 'authenticated' : 'anonymous');
  }
}
