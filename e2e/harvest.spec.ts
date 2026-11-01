import { expect, test, type Page } from '@playwright/test';
import { environment } from '../src/environments/environment';

const projects = [
  { project_id: 'project-a', project_code: 'A', name: '青空工事', role: 'owner', start_on: '2026-01-01', complete_on: '2026-12-31' },
  { project_id: 'project-b', project_code: 'B', name: '緑の改修', role: 'guest', start_on: '2026-02-01', complete_on: '2026-11-30' },
];

// Cognito's browser cache is seeded with synthetic, unsigned tokens. Every API and
// Cognito request is intercepted; these tests never authenticate against AWS.
async function signInLocally(page: Page) {
  const auth = environment.amplify.Auth as unknown as { Cognito?: { userPoolClientId: string }; userPoolWebClientId?: string };
  const clientId = auth.Cognito?.userPoolClientId ?? auth.userPoolWebClientId;
  if (!clientId) throw new Error('The development Cognito client is not configured');
  const now = Math.floor(Date.now() / 1000);
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const jwt = (claims: object) => `${encode({ alg: 'RS256', typ: 'JWT' })}.${encode({ sub: 'test-user', iat: now, exp: now + 3600, ...claims })}.dGVzdA`;
  await page.addInitScript(({ prefix, idToken, accessToken }) => {
    localStorage.setItem(`${prefix}.LastAuthUser`, 'test-user');
    localStorage.setItem(`${prefix}.test-user.idToken`, idToken);
    localStorage.setItem(`${prefix}.test-user.accessToken`, accessToken);
    localStorage.setItem(`${prefix}.test-user.refreshToken`, 'synthetic-refresh-token');
    localStorage.setItem(`${prefix}.test-user.clockDrift`, '0');
    localStorage.setItem(`${prefix}.test-user.signInDetails`, JSON.stringify({ loginId: 'test@example.invalid', authFlowType: 'USER_SRP_AUTH' }));
  }, {
    prefix: `CognitoIdentityServiceProvider.${clientId}`,
    idToken: jwt({ token_use: 'id', aud: clientId, 'cognito:username': 'test-user', email: 'test@example.invalid', 'custom:user_type': 'personal' }),
    accessToken: jwt({ token_use: 'access', client_id: clientId, username: 'test-user', scope: 'aws.cognito.signin.user.admin' }),
  });
}

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === 'http://127.0.0.1:4200' && url.pathname === '/assets/runtime-config.json') {
      return route.fulfill({ json: {
        apiBaseUrl: environment.base_url,
        auth: { userPoolId: environment.amplify.Auth.userPoolId, userPoolClientId: environment.amplify.Auth.userPoolWebClientId },
      } });
    }
    if (url.origin === 'http://127.0.0.1:4200') return route.continue();
    if (url.origin === new URL(environment.base_url).origin) {
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      if (!request.headers()['authorization']) return route.fulfill({ status: 401, headers, json: { message: 'Missing authentication' } });
      if (url.pathname === '/projects') return route.fulfill({ headers, json: projects });
      if (/^\/users\/[^/]+\/notifications$/.test(url.pathname)) return route.fulfill({ headers, json: [] });
      if (/\/places(?:\/[^/]+\/children)?$/.test(url.pathname)) return route.fulfill({ headers, json: { places: [], targets: [] } });
      if (/\/targets$/.test(url.pathname)) return route.fulfill({ headers, json: [] });
      return route.fulfill({ status: 404, headers, json: { message: `No fixture for ${url.pathname}` } });
    }
    if (url.hostname.startsWith('cognito-idp.')) {
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      const target = request.headers()['x-amz-target'] ?? '';
      if (target.endsWith('GetUser')) return route.fulfill({ headers, json: {
        Username: 'test-user', UserAttributes: [
          { Name: 'sub', Value: 'test-user' },
          { Name: 'email', Value: 'test@example.invalid' },
          { Name: 'custom:user_type', Value: 'personal' },
        ],
      } });
      return route.fulfill({ status: 400, headers, json: { __type: 'NotAuthorizedException', message: 'Synthetic invalid credentials' } });
    }
    // No external fonts, analytics, images, or unexpected production requests.
    return route.abort('blockedbyclient');
  });
});

test('unauthenticated private routes redirect to login and expose signup', async ({ page }) => {
  await page.goto('/dashboard/projects');
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
  await expect(page.getByPlaceholder('パスワード', { exact: true })).toHaveAttribute('type', 'password');
  await page.getByRole('link', { name: '新規登録' }).click();
  await expect(page).toHaveURL(/\/signup$/);
  await expect(page.getByRole('button', { name: '登録', exact: true })).toBeDisabled();
});

test('invalid credentials show an error without opening private pages', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('メールアドレス').fill('test@example.invalid');
  await page.getByPlaceholder('パスワード', { exact: true }).fill('InvalidPassword123');
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await expect(page.getByText(/ログインに失敗しました/)).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test('authenticated projects can be filtered and selection controls permitted actions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await signInLocally(page);
  await page.goto('/dashboard/projects');
  await expect(page.getByRole('cell', { name: '青空工事', exact: true })).toBeVisible();
  await expect(page.getByRole('cell', { name: '緑の改修', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '設定', exact: true })).toBeVisible();
  await page.getByPlaceholder('フィルタ', { exact: true }).fill('緑');
  await expect(page.getByRole('cell', { name: '青空工事', exact: true })).toHaveCount(0);
  await page.getByRole('row').filter({ hasText: '緑の改修' }).getByRole('radio').check();
  await expect(page.getByRole('button', { name: '設定', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /GENERATE/ })).toHaveCount(0);
  await page.getByRole('link', { name: /WORK/ }).click();
  await expect(page).toHaveURL(/\/dashboard\/work$/);
  await expect(page.getByRole('combobox').first()).toContainText('緑の改修');
  await expect(page.getByText('撮影対象を追加', { exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('combobox').first()).toContainText('緑の改修');
  await expect(page.getByRole('link', { name: /GENERATE/ })).toHaveCount(0);
  expect(errors).toEqual([]);
});


test('an empty project list remains usable without exposing project actions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await signInLocally(page);
  await page.route(`${environment.base_url}/projects`, route => route.fulfill({
    headers: { 'access-control-allow-origin': '*' }, json: [],
  }));
  await page.goto('/dashboard/projects');
  await expect(page.getByRole('button', { name: '新規作成', exact: true })).toBeEnabled();
  await page.getByPlaceholder('フィルタ', { exact: true }).fill('存在しないプロジェクト');
  await expect(page.getByRole('cell')).toHaveCount(0);
  await expect(page.getByRole('button', { name: '設定', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: /WORK/ }).click();
  await expect(page.getByText('エラー: プロジェクトを選択してください。')).toBeVisible();
  expect(errors).toEqual([]);
});

const apiHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};

for (const scenario of [{ status: 201, retry: false, mobile: false }, { status: 200, retry: false, mobile: false }, { status: 200, retry: true, mobile: false }, { status: 200, retry: false, mobile: true }]) {
  test(`JPEG is resized and uploaded through an authorized reservation and unsigned S3 form (${scenario.status}, retry=${scenario.retry}, mobile=${scenario.mobile})`, async ({ page }, testInfo) => {
    if (scenario.mobile) await page.setViewportSize({ width: 390, height: 844 });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    const operations: string[] = [];
    let reservation: Record<string, unknown> | undefined;
    let s3Headers: Record<string, string> = {};
    let multipart = Buffer.alloc(0);
    let completed = false;
    const target = {
      project_id: 'project-a', target_id: 'target-a', parent_place_id: 'project-a', name: '屋上防水',
      photos: { before: [] as string[], after: [] as string[], adopt: { before: '', after: '' } },
    };
    await page.route(`${environment.base_url}/projects/project-a/**`, async route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: apiHeaders });
      if (path.endsWith('/places/project-a/children')) return route.fulfill({ headers: apiHeaders, json: {
        places: [], targets: [{ ...target, photos: { ...target.photos, before: completed ? ['photo-a'] : [] } }],
      } });
      if (path.endsWith('/upload-sessions')) {
        operations.push('reserve');
        expect(request.headers()['authorization']).toBeTruthy();
        reservation = request.postDataJSON();
        return route.fulfill({ status: 201, headers: apiHeaders, json: {
          session_id: 'session-a', photo_id: 'photo-a', expires_at: Math.floor(Date.now() / 1000) + 300,
          upload: { url: 'https://uploads.example.invalid/', fields: { key: 'pending/project-a/photo-a.jpg', policy: 'synthetic-policy', 'Content-Type': 'image/jpeg' } },
        } });
      }
      if (path.endsWith('/upload-sessions/session-a/complete')) {
        operations.push('complete');
        expect(request.headers()['authorization']).toBeTruthy();
        if (scenario.retry && operations.filter(operation => operation === 'complete').length === 1) {
          return route.fulfill({ status: 500, headers: apiHeaders, json: { error: { title: '保存失敗', message: '再試行してください。', code: 500 } } });
        }
        completed = true;
        return route.fulfill({ status: scenario.status, headers: apiHeaders, json: { photo_id: 'photo-a' } });
      }
      return route.fallback();
    });
    await page.route('https://uploads.example.invalid/**', async route => {
      if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: apiHeaders });
      operations.push('upload');
      s3Headers = route.request().headers();
      multipart = route.request().postDataBuffer() ?? Buffer.alloc(0);
      return route.fulfill({ status: 204, headers: apiHeaders });
    });
    await signInLocally(page);
    await page.goto('/dashboard/work');
    await page.getByRole('cell', { name: '屋上防水', exact: true }).click();
    await page.getByRole('tab').filter({ hasText: 'photo_camera' }).click();
    const jpeg = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      canvas.width = 1600;
      canvas.height = 900;
      const context = canvas.getContext('2d')!;
      context.fillStyle = '#dbeafe';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#2563eb';
      context.fillRect(120, 160, 1360, 580);
      context.fillStyle = '#ffffff';
      context.font = 'bold 80px sans-serif';
      context.fillText('HARVEST / JPEG FIXTURE', 180, 490);
      return canvas.toDataURL('image/jpeg', 0.95).split(',')[1];
    });
    await page.locator('#camera-input').setInputFiles({ name: 'construction.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(jpeg, 'base64') });
    const preview = page.getByRole('img', { name: '施工写真' });
    await expect(preview).toBeVisible();
    await expect.poll(() => preview.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBe(1280);
    await expect(page.getByRole('button', { name: /アップロード/ })).toBeEnabled();
    if (scenario.mobile) {
      const uploadButton = page.getByRole('button', { name: /アップロード/ });
      await uploadButton.scrollIntoViewIfNeeded();
      await expect(uploadButton).toBeInViewport();
      const bounds = await uploadButton.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
    }
    await page.screenshot({ path: testInfo.outputPath('photo-preview.png'), fullPage: true });
    await page.getByRole('button', { name: /アップロード/ }).click();
    if (scenario.retry) {
      await expect(page.getByRole('button', { name: /アップロード/ })).toBeEnabled();
      await expect(preview).toBeVisible();
      await page.getByRole('button', { name: /アップロード/ }).click();
    }
    await expect(page.getByText('写真のアップロードに成功しました。')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: '屋上防水' }).locator('td').nth(1)).toHaveText('1');
    expect(operations).toEqual(scenario.retry ? ['reserve', 'upload', 'complete', 'complete'] : ['reserve', 'upload', 'complete']);
    expect(reservation).toMatchObject({ type: 'before', content_type: 'image/jpeg' });
    expect(s3Headers['authorization']).toBeUndefined();
    expect(s3Headers['content-type']).toMatch(/^multipart\/form-data; boundary=/);
    const body = multipart.toString('latin1');
    expect(body).toContain('name="key"\r\n\r\npending/project-a/photo-a.jpg');
    expect(body.indexOf('name="file"')).toBeGreaterThan(body.indexOf('name="policy"'));
    const jpegStart = multipart.indexOf(Buffer.from([0xff, 0xd8, 0xff]));
    const jpegEnd = multipart.indexOf(Buffer.from([0xff, 0xd9]), jpegStart) + 2;
    expect(jpegStart).toBeGreaterThan(0);
    expect(jpegEnd - jpegStart).toBe(reservation?.['size']);
    expect(errors).toEqual([]);
  });
}

test('Excel settings create a durable job and show its download after polling succeeds', async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  let submitted: Record<string, unknown> | undefined;
  let idempotencyKey = '';
  let polls = 0;
  await page.route(`${environment.base_url}/projects/project-a/**`, async route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: apiHeaders });
    if (path.endsWith('/templates')) return route.fulfill({ headers: apiHeaders, json: {
      default: [{ template_id: 'basic_1.xlsx', template_type: 'default', name: '標準帳票', description: '施工前後の写真帳票', property_title: 'True', property_hierarchy: true, property_date: true }],
      user: [], project: [],
    } });
    if (path.endsWith('/generate')) return route.fulfill({ headers: apiHeaders, json: [] });
    if (path.endsWith('/generation-jobs')) {
      expect(request.headers()['authorization']).toBeTruthy();
      submitted = request.postDataJSON();
      idempotencyKey = request.headers()['idempotency-key'] ?? '';
      return route.fulfill({ status: 202, headers: apiHeaders, json: { job_id: 'job-a', status: 'queued' } });
    }
    if (path.endsWith('/generation-jobs/job-a')) {
      polls++;
      return route.fulfill({ headers: apiHeaders, json: polls === 1
        ? { job_id: 'job-a', status: 'running' }
        : { job_id: 'job-a', status: 'succeeded', result: { name: '青空工事.xlsx', download_url: 'https://downloads.example.invalid/report.xlsx', generated_file_id: 'report-a', type: 'excel' } },
      });
    }
    return route.fallback();
  });
  await signInLocally(page);
  await page.goto('/dashboard/generate');
  await page.getByRole('button', { name: /EXCEL/ }).click();
  await expect(page.locator('mat-select[placeholder="テンプレートを選択"]')).toContainText('標準帳票');
  await page.getByPlaceholder('タイトル', { exact: true }).fill('青空工事 完了報告');
  await page.getByRole('checkbox', { name: /写真の撮影日時順でソートする/ }).check();
  await page.getByRole('button', { name: '次へ', exact: true }).click();
  await page.getByRole('button', { name: /EXCEL生成を開始/ }).click();
  await expect(page.getByRole('status')).toContainText('生成中');
  await expect(page.getByRole('link', { name: 'ダウンロード', exact: true })).toHaveAttribute('href', 'https://downloads.example.invalid/report.xlsx');
  expect(submitted).toMatchObject({ type: 'excel', template_id: 'basic_1.xlsx', title: '青空工事 完了報告', needs_sort: true });
  expect(idempotencyKey).toMatch(/^[0-9a-f-]{36}$/);
  expect(polls).toBe(2);
  await expect(page.getByRole('status')).toHaveCount(0);
  await page.screenshot({ path: testInfo.outputPath('excel-complete.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('toolbar project switching updates work and navigation permissions immediately', async ({ page }, testInfo) => {
  await signInLocally(page);
  await page.goto('/dashboard/work');
  await expect(page.getByRole('link', { name: /GENERATE/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '撮影対象を追加', exact: true })).toBeVisible();
  await page.locator('mat-select[placeholder="プロジェクトを選択"]').click();
  await page.getByRole('option', { name: '緑の改修', exact: true }).click();
  await expect(page.locator('mat-select[placeholder="プロジェクトを選択"]')).toContainText('緑の改修');
  await expect(page.getByRole('link', { name: /GENERATE/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '撮影対象を追加', exact: true })).toHaveCount(0);
  // Wait for Material's closing animation to detach the previous overlay.
  await expect(page.getByRole('listbox', { includeHidden: true })).toHaveCount(0);
  await page.locator('mat-select[placeholder="プロジェクトを選択"]').click();
  await page.getByRole('option', { name: '青空工事', exact: true }).click();
  await expect(page.getByRole('link', { name: /GENERATE/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '撮影対象を追加', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('work-owner.png'), fullPage: true });
});
