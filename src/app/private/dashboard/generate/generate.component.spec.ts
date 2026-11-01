import { TestBed } from '@angular/core/testing';
import { DashboardModule } from '../dashboard.module';
import { FormBuilder } from '@angular/forms';
import { BehaviorSubject,Subject,defer,of,throwError } from 'rxjs';
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { OwnerPermissions } from '../../../shared/services/projects/action-permissions/permissions/owner-permissions';
import { Project } from '../projects/project';
import { AvailableTemplates } from './available-templates';
import { GenerateComponent } from './generate.component';
import { TemplateConfig } from './template-config';

describe('Generation project scope', () => {
  let component: GenerateComponent;
  let project: BehaviorSubject<Project | null>;
  let templatesA: Subject<AvailableTemplates>;
  let templatesB: Subject<AvailableTemplates>;
  let generate: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [DashboardModule] });
    project = new BehaviorSubject<Project | null>({ project_id: 'a', name: 'First', role: 'owner' } as Project);
    templatesA = new Subject();
    templatesB = new Subject();
    generate = vi.fn(() => of({ job_id: 'job', status: 'queued' }));
    component = new GenerateComponent(
      { currentProjectSubject: project, getCurrentPermissions: () => new OwnerPermissions() } as never,
      { generate } as never,
      { list: vi.fn().mockReturnValueOnce(templatesA).mockReturnValueOnce(templatesB) } as never,
      { openErrorAlert: vi.fn(), openSuccessAlert: vi.fn() } as never,
      new FormBuilder(), {} as never, {} as never,
    );
    component.ngOnInit();
    component.order.type = 'excel';
  });
  afterEach(() => component.ngOnDestroy());
  it('clears the previous project template and blocks submission until the new list arrives', () => {
    templatesA.next({ default: [], user: [], project: [{ template_id: 'a-template' } as TemplateConfig] });
    project.next({ project_id: 'b', name: 'Second', role: 'owner' } as Project);
    expect(templatesA.observed).toBe(false);
    expect(component.selectTemplate.template_id).toBeUndefined();
    component.onGenerate(component.order);
    expect(generate).not.toHaveBeenCalled();
    templatesB.next({ default: [{ template_id: 'basic_1.xlsx' } as TemplateConfig], user: [], project: [] });
    component.onGenerate(component.order);
    expect(generate).toHaveBeenCalledWith('b', expect.objectContaining({ template_id: 'basic_1.xlsx', title: 'Second' }));
  });
  it('keeps Excel submission disabled after a template-list failure', () => {
    templatesA.error(new Error('offline'));
    expect(component.templatesLoading).toBe(false);
    component.onGenerate(component.order);
    expect(generate).not.toHaveBeenCalled();
  });
  it('reuses the generation operation when retrying an uncertain network result', () => {
    let attempts = 0;
    generate.mockReturnValue(defer(() => ++attempts === 1
      ? throwError(() => new Error('Response lost'))
      : of({ job_id: 'same-job', status: 'queued' })));
    templatesA.next({ default: [{ template_id: 'basic_1.xlsx' } as TemplateConfig], user: [], project: [] });
    component.onGenerate(component.order);
    expect(component.isProgress).toBe(false);
    component.onGenerate(component.order);
    expect(generate).toHaveBeenCalledOnce();
    expect(attempts).toBe(2);
  });

  it('cancels a pending download URL when the selected project changes', () => {
    const download = new Subject();
    Object.assign(component.generateService, { generateDownloadUrl: () => download });
    component.onDownload('report');
    expect(download.observed).toBe(true);
    project.next({ project_id: 'b', name: 'Second', role: 'owner' } as Project);
    expect(download.observed).toBe(false);
  });
  it('cancels a template deletion when its view is destroyed', () => {
    const deletion = new Subject();
    Object.assign(component.templateService, { delete: () => deletion });
    component.onDeleteTemplate('custom-template');
    expect(deletion.observed).toBe(true);
    component.ngOnDestroy();
    expect(deletion.observed).toBe(false);
  });

});
