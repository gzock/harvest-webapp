import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { LoginComponent } from './login.component';
import { LoginModule } from './login.module';
describe('Login navigation', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [LoginModule] }));
  it('keeps anonymous visitors on the login page', () => {
    const router = { navigate: vi.fn() };
    const auth = { isAuthenticated: () => of(false), isCorporationUser: vi.fn() };
    new LoginComponent(router as never, auth as never).ngOnInit();
    expect(router.navigate).not.toHaveBeenCalled(); expect(auth.isCorporationUser).not.toHaveBeenCalled();
  });
  it('navigates once to the corporation screen after a complete sign-in', () => {
    const router = { navigate: vi.fn() };
    const auth = { signIn: () => of({ isSignedIn: true }), isCorporationUser: () => of(true) };
    new LoginComponent(router as never, auth as never).onLoggedIn('e', 'p');
    expect(router.navigate).toHaveBeenCalledExactlyOnceWith(['/corporation']);
  });
  it('does not navigate on a password challenge', () => {
    const router = { navigate: vi.fn() };
    const auth = { signIn: () => of({ isSignedIn: false, nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED' } }) };
    const component = new LoginComponent(router as never, auth as never);
    component.onLoggedIn('e', 'p');
    expect(component.requiresNewPassword).toBe(true); expect(router.navigate).not.toHaveBeenCalled();
  });
  it('shows and hides the password with the rendered Material checkbox', async () => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideRouter([]),
      { provide: AuthService, useValue: { isAuthenticated: () => of(false) } }] });
    const fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const checkbox = fixture.nativeElement.querySelector('.option-display-password input') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    expect(password.type).toBe('password');
    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(checkbox.checked).toBe(true);
    expect(password.type).toBe('text');
    checkbox.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(password.type).toBe('password');
  });

});
