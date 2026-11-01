import { confirmSignIn,fetchAuthSession,fetchUserAttributes,getCurrentUser,signIn,signOut } from 'aws-amplify/auth';
import { firstValueFrom } from 'rxjs';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { AuthService } from './auth.service';
vi.mock('aws-amplify', () => ({ Amplify: { configure: vi.fn() } }));
vi.mock('aws-amplify/auth', () => ({
  signUp: vi.fn(), confirmSignUp: vi.fn(), signIn: vi.fn(), confirmSignIn: vi.fn(), signOut: vi.fn(),
  getCurrentUser: vi.fn(), fetchUserAttributes: vi.fn(), fetchAuthSession: vi.fn(), updatePassword: vi.fn(),
}));
describe('Cognito session adapter', () => {
  let service: AuthService;
  const router = { navigate: vi.fn() };
  beforeEach(() => { vi.resetAllMocks(); localStorage.clear(); service = new AuthService(router as never); });
  it('exposes a password challenge without reporting an authenticated session', async () => {
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: false, nextStep: { signInStep: 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED', missingAttributes: [] } });
    await firstValueFrom(service.signIn('user@example.test', 'temporary'));
    expect(service.state.value).toBe('challenge');
    expect(service.loggedIn.value).toBe(false);
    expect(confirmSignIn).not.toHaveBeenCalled();
  });
  it('waits for explicit new-password completion', async () => {
    vi.mocked(confirmSignIn).mockResolvedValue({ isSignedIn: true, nextStep: { signInStep: 'DONE' } });
    await firstValueFrom(service.completeNewPassword('replacement'));
    expect(confirmSignIn).toHaveBeenCalledWith({ challengeResponse: 'replacement' });
    expect(service.loggedIn.value).toBe(true);
  });
  it('does not mark a personal user logged out during corporation checks', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ username: 'user-id', userId: 'sub' });
    vi.mocked(fetchUserAttributes).mockResolvedValue({ 'custom:user_type': 'personal' });
    expect(await firstValueFrom(service.isCorporationUser())).toBe(false);
    expect(service.loggedIn.value).toBe(true);
  });
  it('preserves the existing ID-token API contract', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({ tokens: { idToken: { toString: () => 'id.jwt', payload: { email: 'a@example.test' } } } } as never);
    expect((await firstValueFrom(service.getToken())).idToken.jwtToken).toBe('id.jwt');
  });
  it('rejects sessions without an ID token', async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({});
    await expect(firstValueFrom(service.getToken())).rejects.toThrow('Not authenticated');
  });
  it('rejects an ID token resolved after sign-out', async () => {
    let resolveSession!: (session: Awaited<ReturnType<typeof fetchAuthSession>>) => void;
    vi.mocked(fetchAuthSession).mockImplementation(() => new Promise(resolve => { resolveSession = resolve; }));
    vi.mocked(signOut).mockResolvedValue();
    const token = firstValueFrom(service.getToken());
    service.signOut();
    resolveSession({ tokens: { idToken: { toString: () => 'old.jwt', payload: {} } } } as never);
    await expect(token).rejects.toThrow('Session ended');
  });
  it.each(['signIn', 'challenge'])('ignores a late %s result after sign-out', async flow => {
    let resolveAuth!: (value: { isSignedIn: boolean; nextStep: { signInStep: 'DONE' } }) => void;
    const pending = new Promise<{ isSignedIn: boolean; nextStep: { signInStep: 'DONE' } }>(resolve => { resolveAuth = resolve; });
    vi.mocked(signIn).mockReturnValue(pending);
    vi.mocked(confirmSignIn).mockReturnValue(pending);
    vi.mocked(signOut).mockResolvedValue();
    const attempt = firstValueFrom(flow === 'signIn' ? service.signIn('user', 'password') : service.completeNewPassword('new'));
    service.signOut();
    resolveAuth({ isSignedIn: true, nextStep: { signInStep: 'DONE' } });
    await expect(attempt).rejects.toThrow('Session ended');
    expect(service.state.value).toBe('anonymous');
  });
  it('does not let an old session check clear a newer login', async () => {
    let rejectUser!: (error: Error) => void;
    vi.mocked(getCurrentUser).mockImplementation(() => new Promise((_resolve, reject) => { rejectUser = reject; }));
    vi.mocked(fetchUserAttributes).mockResolvedValue({});
    const check = firstValueFrom(service.isAuthenticated());
    vi.mocked(signIn).mockResolvedValue({ isSignedIn: true, nextStep: { signInStep: 'DONE' } });
    await firstValueFrom(service.signIn('user', 'password'));
    rejectUser(new Error('Old session expired'));
    expect(await check).toBe(false);
    expect(service.state.value).toBe('authenticated');
  });
  it('clears feature state even when sign-out fails', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('offline'));
    const reset = vi.fn(); service.signedOut.subscribe(reset);
    localStorage.setItem('selectedProject', 'old');
    service.signOut(); await Promise.resolve(); await Promise.resolve();
    expect(reset).toHaveBeenCalledOnce();
    expect(localStorage.getItem('selectedProject')).toBeNull();
    expect(service.state.value).toBe('anonymous');
  });
});
