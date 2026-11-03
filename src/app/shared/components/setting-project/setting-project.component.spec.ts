import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DashboardModule } from '../../../private/dashboard/dashboard.module';
import { AlertService } from '../../services/alert/alert.service';
import { AuthService, SessionUser } from '../../services/auth/auth.service';
import { AdminPermissions } from '../../services/projects/action-permissions/permissions/admin-permissions';
import { ProjectsService } from '../../services/projects/projects.service';
import { SettingProjectComponent } from './setting-project.component';

describe('Project member settings', () => {
  it('renders the member list safely while Cognito attributes are still loading', async () => {
    const identity = new Subject<SessionUser>();
    TestBed.configureTestingModule({ imports: [DashboardModule], providers: [
      provideZonelessChangeDetection(), provideNoopAnimations(),
      { provide: MatDialogRef, useValue: { close: vi.fn() } },
      { provide: AlertService, useValue: { openErrorAlert: vi.fn() } },
      { provide: AuthService, useValue: { getData: () => identity } },
      { provide: ProjectsService, useValue: {
        getCurrentProject: () => ({ project_id: 'p', name: 'Project', role: 'admin' }),
        getCurrentPermissions: () => new AdminPermissions(),
        listUsers: () => of([{ user_id: 'member', username: 'Member', role: 'worker', status: 'active' }]),
      } },
    ] });
    const fixture = TestBed.createComponent(SettingProjectComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Member');
    expect(fixture.nativeElement.querySelector('mat-select')?.getAttribute('aria-disabled')).toBe('true');
    identity.next({ username: 'admin', attributes: {} });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-select')?.getAttribute('aria-disabled')).toBe('false');
    fixture.destroy();
    expect(identity.observed).toBe(false);
  });
});
