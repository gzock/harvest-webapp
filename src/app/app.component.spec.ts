import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { Subject } from 'rxjs';
import { describe,expect,it } from 'vitest';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
describe('PWA update notice', () => {
  it('offers the available version without activating or reloading it', () => {
    const versionUpdates = new Subject();
    TestBed.configureTestingModule({ imports: [AppModule], providers: [provideZonelessChangeDetection(), AppComponent, { provide: SwUpdate, useValue: { isEnabled: true, versionUpdates } }] });
    const app = TestBed.inject(AppComponent);
    expect(app.updateReady).toBe(false);
    versionUpdates.next({ type: 'VERSION_DETECTED' }); expect(app.updateReady).toBe(false);
    versionUpdates.next({ type: 'VERSION_READY' }); expect(app.updateReady).toBe(true);
  });
});
