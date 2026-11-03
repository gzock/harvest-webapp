import { environment } from '../../../environments/environment';

export interface RuntimeConfig {
  apiBaseUrl: string;
  auth: { userPoolId: string; userPoolClientId: string };
}
export function validateRuntimeConfig(value: unknown, production: boolean): RuntimeConfig {
  if (!value || typeof value !== 'object') throw new Error('Invalid runtime configuration');
  const config = value as Partial<RuntimeConfig>;
  if (typeof config.apiBaseUrl !== 'string' || !config.auth) throw new Error('Missing API/auth configuration');
  const url = new URL(config.apiBaseUrl);
  const localHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && (production || !localHttp)) throw new Error('The API must use HTTPS');
  if (url.username || url.password || url.hash || url.search) throw new Error('Invalid API base URL');
  if (typeof config.auth.userPoolId !== 'string' || typeof config.auth.userPoolClientId !== 'string') throw new Error('Invalid Cognito configuration');
  if (!/^[a-z]{2}(?:-gov)?-[a-z]+-\d_[A-Za-z0-9]+$/.test(config.auth.userPoolId || '')) throw new Error('Invalid Cognito pool');
  if (!/^[a-z0-9]{1,128}$/.test(config.auth.userPoolClientId || '')) throw new Error('Invalid Cognito client');
  return {
    apiBaseUrl: config.apiBaseUrl.replace(/\/$/, ''),
    auth: { userPoolId: config.auth.userPoolId, userPoolClientId: config.auth.userPoolClientId },
  };
}
export async function loadRuntimeConfig(fetcher: typeof fetch = fetch): Promise<void> {
  // Bypass a previously installed worker as well as the browser HTTP cache.
  const response = await fetcher('assets/runtime-config.json?ngsw-bypass=true', { cache: 'no-store', credentials: 'same-origin' });
  if (response.status === 404 && !environment.production) return;
  if (!response.ok) throw new Error('Runtime configuration is unavailable');
  const config = validateRuntimeConfig(await response.json(), environment.production);
  environment.base_url = config.apiBaseUrl;
  environment.amplify.Auth.userPoolId = config.auth.userPoolId;
  environment.amplify.Auth.userPoolWebClientId = config.auth.userPoolClientId;
}
