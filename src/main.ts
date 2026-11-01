import { enableProdMode } from '@angular/core';
import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app.module';
import { loadRuntimeConfig } from './app/core/config/runtime-config';
import { environment } from './environments/environment';

async function bootstrap(): Promise<void> {
  await loadRuntimeConfig();
  if (environment.production) enableProdMode();
  await platformBrowser().bootstrapModule(AppModule);
}
void bootstrap().catch(() => {
  document.body.textContent = 'アプリケーションを起動できませんでした。通信と公開設定を確認して再読み込みしてください。';
});
