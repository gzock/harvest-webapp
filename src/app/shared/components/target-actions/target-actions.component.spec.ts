import { BehaviorSubject,Subject } from 'rxjs';
import { beforeEach,describe,expect,it,vi } from 'vitest';
import { Project } from '../../../private/dashboard/projects/project';
import { Target } from '../../../private/dashboard/work/target';
import { GuestPermissions } from '../../services/projects/action-permissions/permissions/guest-permissions';
import { TargetActionsComponent } from './target-actions.component';

/** Focus on races and resource lifetime, independently of Material rendering. */
describe('Target action request ownership', () => {
  let component: TargetActionsComponent;
  let project: BehaviorSubject<Project | null>;
  let firstPhoto: Subject<{ data: string }>;
  let secondPhoto: Subject<{ data: string }>;
  let upload: Subject<unknown>;
  let dismiss: ReturnType<typeof vi.fn>;
  let success: ReturnType<typeof vi.fn>;
  let show: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const target = {
      project_id: 'project-a', target_id: 'target-a', name: 'Target',
      photos: { before: ['photo-a', 'photo-b'], after: [], adopt: { before: 'photo-a', after: '' } },
    } as unknown as Target;
    project = new BehaviorSubject<Project | null>({ project_id: 'project-a', role: 'reporter' } as Project);
    firstPhoto = new Subject();
    secondPhoto = new Subject();
    upload = new Subject();
    dismiss = vi.fn();
    success = vi.fn();
    show = vi.fn().mockReturnValueOnce(firstPhoto).mockReturnValueOnce(secondPhoto);
    component = new TargetActionsComponent(
      { dismiss } as never,
      { selected: target, defaultType: 'target' },
      {} as never,
      { getCurrentTarget: () => target } as never,
      { currentProjectSubject: project, getCurrentProject: () => project.value,
        getCurrentPermissions: () => new GuestPermissions() } as never,
      { show, create: () => upload } as never,
      { detectChanges: vi.fn(), markForCheck: vi.fn() } as never,
      { openSuccessAlert: success, openErrorAlert: vi.fn() } as never,
      {} as never,
    );
    component.ngOnInit();
  });

  it('cancels the previous photo request when selecting another image', () => {
    component.onGetPhoto('before', 0);
    expect(firstPhoto.observed).toBe(true);
    component.onGetPhoto('before', 1);
    expect(firstPhoto.observed).toBe(false);
    secondPhoto.next({ data: 'newer' });
    firstPhoto.next({ data: 'older' });
    expect(component.neededPhoto).toBe('data:image/jpeg;base64,newer');
    component.ngOnDestroy();
  });

  it('cancels photo and upload work when the sheet is destroyed', () => {
    component.onGetPhoto('before', 0);
    component.compressedPhoto = 'data:image/jpeg;base64,eA==';
    component.onUpload();
    expect(upload.observed).toBe(true);
    component.ngOnDestroy();
    expect(firstPhoto.observed).toBe(false);
    expect(upload.observed).toBe(false);
    upload.next({ photo_id: 'photo-new' });
    expect(success).not.toHaveBeenCalled();
  });

  it('dismisses stale actions and cancels requests when the project changes', () => {
    component.onGetPhoto('before', 0);
    component.compressedPhoto = 'data:image/jpeg;base64,eA==';
    component.onUpload();
    expect(dismiss).not.toHaveBeenCalled();
    project.next({ project_id: 'project-b', role: 'owner' } as Project);
    expect(dismiss).toHaveBeenCalled();
    expect(firstPhoto.observed).toBe(false);
    expect(upload.observed).toBe(false);
    component.ngOnDestroy();
  });

  it('dismisses actions when signing out clears the selected project', () => {
    component.onGetPhoto('before', 0);
    project.next(null);
    expect(dismiss).toHaveBeenCalled();
    expect(firstPhoto.observed).toBe(false);
    component.ngOnDestroy();
  });
});
