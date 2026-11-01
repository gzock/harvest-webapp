import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { describe,expect,it,vi } from 'vitest';
import { ImportActionComponent } from '../import-action/import-action.component';
import { UploadTemplateComponent } from './upload-template.component';

const fileEvent = () => ({ target: { files: [new File(['fixture'], 'template.xlsx')] } }) as unknown as Event;
const alert = () => ({ openSuccessAlert: vi.fn(), openErrorAlert: vi.fn() });

describe('File dialog request lifecycle', () => {
  function template() {
    const response = new Subject<unknown>();
    const create = vi.fn(() => response);
    const component = new UploadTemplateComponent(
      { projectId: 'project', projectTemplatesCount: 0, userTemplatesCount: 0 },
      { close: vi.fn() } as never, { create } as never, alert() as never,
      {} as never, new FormBuilder(),
    );
    component.ngOnInit();
    component.firstFormGroup.setValue({ firstCtrl: 'project' });
    component.secondFormGroup.setValue({ secondCtrl: 'Template', thirdCtrl: 'Description' });
    return { component, response, create };
  }
  it('blocks duplicate file selection and cancels upload when the template dialog closes', async () => {
    const { component, response, create } = template();
    component.onFileSelected(fileEvent());
    component.onFileSelected(fileEvent());
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    expect(response.observed).toBe(true);
    component.ngOnDestroy();
    expect(response.observed).toBe(false);
    expect(component.isUploading).toBe(false);
  });
  it('shows a retryable message for network errors without a legacy API body', async () => {
    const { component, response, create } = template();
    component.onFileSelected(fileEvent());
    await vi.waitFor(() => expect(create).toHaveBeenCalledOnce());
    response.error({ status: 0 });
    expect(component.errMsg).toContain('通信に失敗');
    expect(component.isUploading).toBe(false);
    component.ngOnDestroy();
  });
  it('cancels a pending file read before it can submit after closing', async () => {
    const { component, create } = template();
    component.onFileSelected(fileEvent());
    component.ngOnDestroy();
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(create).not.toHaveBeenCalled();
  });
  it('guards duplicate CSV imports and handles errors without a body', async () => {
    const response = new Subject<unknown>();
    const upload = vi.fn(() => response);
    const component = new ImportActionComponent({ close: vi.fn() } as never, { import: upload } as never, alert() as never);
    component.onFileSelected(fileEvent());
    component.onFileSelected(fileEvent());
    await vi.waitFor(() => expect(upload).toHaveBeenCalledOnce());
    response.error({ status: 0 });
    expect(component.errMsg).toContain('通信に失敗');
    expect(component.isImporting).toBe(false);
    component.ngOnDestroy();
  });
});
