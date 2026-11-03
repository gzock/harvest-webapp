import { describe,expect,it } from 'vitest';
import { validateRuntimeConfig } from './runtime-config';
const auth = { userPoolId: 'ap-northeast-1_Test', userPoolClientId: 'testclient' };
describe('Public deployment configuration', () => {
  it('accepts public HTTPS endpoint and Cognito IDs', () => expect(validateRuntimeConfig({ apiBaseUrl: 'https://api.example.test/v1/', auth }, true).apiBaseUrl).toBe('https://api.example.test/v1'));
  it('allows loopback HTTP only in development', () => {
    expect(validateRuntimeConfig({ apiBaseUrl: 'http://127.0.0.1:3000', auth }, false)).toBeTruthy();
    expect(() => validateRuntimeConfig({ apiBaseUrl: 'http://127.0.0.1:3000', auth }, true)).toThrow();
  });
  it.each(['http://api.example.test', 'https://user:password@api.example.test', 'https://api.example.test?token=x'])('rejects unsafe API URL %s', apiBaseUrl => expect(() => validateRuntimeConfig({ apiBaseUrl, auth }, true)).toThrow());
  it('rejects missing and malformed auth settings', () => {
    expect(() => validateRuntimeConfig({}, true)).toThrow();
    expect(() => validateRuntimeConfig({ apiBaseUrl: 'https://api.example.test', auth: { ...auth, userPoolClientId: 123 } }, true)).toThrow();
    expect(() => validateRuntimeConfig({ apiBaseUrl: 'https://api.example.test', auth: { ...auth, userPoolId: 'bad' } }, true)).toThrow();
  });
});
