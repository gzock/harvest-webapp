import { describe,expect,expectTypeOf,it } from 'vitest';
import type { Order } from '../private/dashboard/generate/order';
import type { TemplateConfig } from '../private/dashboard/generate/template-config';
import type { TemplateRequest,UploadCompletionRequest } from './dto';
import { toGenerationRequest,toTemplateRequest } from './dto';

const template: TemplateConfig = {
  template_type: 'project', template_id: 'ui-selection-only', template_data: 'eA==',
  name: 'Template', description: '', property_title: true, property_hierarchy: false, property_date: false,
};

describe('Generated API boundary DTOs', () => {
  it('keeps template flags boolean and omits UI-only identifiers', () => {
    const request = toTemplateRequest(template);
    expect(request.property_hierarchy).toBe(false);
    expect(request.property_date).toBe(false);
    expect(request.property_title).toBe(true);
    expect(request).not.toHaveProperty('template_id');
    type Flags = 'property_title' | 'property_hierarchy' | 'property_date';
    expectTypeOf<Pick<TemplateRequest, Flags>>().toEqualTypeOf<Pick<TemplateConfig, Flags>>();
  });
  it('rejects a missing file before issuing an upload request', () => {
    expect(() => toTemplateRequest({ ...template, template_data: '' })).toThrow();
  });
  it('rejects an unselected storage scope before issuing an upload request', () => {
    expect(() => toTemplateRequest({ ...template, template_type: '' })).toThrow();
  });
  it('keeps optional upload completion version IDs optional on the wire', () => {
    const request = {} satisfies UploadCompletionRequest;
    expect(request).toEqual({});
  });
  it.each(['utf_8', 'utf-8', 'shift_jis', 'cp932'])('accepts supported filename encoding %s', char_enc => {
    const result = toGenerationRequest({ type: 'zip', char_enc, title: 'Report' } as Order);
    expect(result.char_enc).toBe(char_enc);
    expect(result.type).toBe('zip');
  });
  it('rejects unfinished or unsupported generation choices before a job is created', () => {
    expect(() => toGenerationRequest({ type: '', char_enc: 'utf_8' } as Order)).toThrow();
    expect(() => toGenerationRequest({ type: 'excel', char_enc: 'arbitrary' } as Order)).toThrow();
  });
});
