import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { defer } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { toTemplateRequest } from '../../../api/dto';
import { AvailableTemplates } from '../../../private/dashboard/generate/available-templates';
import { TemplateConfig } from '../../../private/dashboard/generate/template-config';

type WireTemplate = Omit<TemplateConfig, 'property_title' | 'property_hierarchy' | 'property_date'> & {
  property_title: boolean | string; property_hierarchy: boolean | string; property_date: boolean | string;
};
export function normalizeTemplate(template: WireTemplate): TemplateConfig {
  const enabled = (value: boolean | string) => value === true || value === 'True' || value === 'true';
  return { ...template, property_title: enabled(template.property_title), property_hierarchy: enabled(template.property_hierarchy), property_date: enabled(template.property_date) };
}
@Injectable({ providedIn: 'root' })
export class TemplateService {
  constructor(private http: HttpClient) {}
  private base(projectId: string): string { return environment.base_url + '/projects/' + encodeURIComponent(projectId) + '/templates'; }
  get(projectId: string, templateId: string) {
    return this.http.get<{ download_url: string }>(this.base(projectId) + '/' + encodeURIComponent(templateId));
  }
  list(projectId: string) {
    return this.http.get<Record<'default' | 'user' | 'project', WireTemplate[]>>(this.base(projectId)).pipe(map(response => ({
      default: response.default.map(normalizeTemplate), user: response.user.map(normalizeTemplate), project: response.project.map(normalizeTemplate),
    } satisfies AvailableTemplates)));
  }
  create(projectId: string, config: TemplateConfig) { return defer(() => this.http.post(this.base(projectId), toTemplateRequest(config))); }
  delete(projectId: string, templateId: string) { return this.http.delete(this.base(projectId) + '/' + encodeURIComponent(templateId)); }
}
