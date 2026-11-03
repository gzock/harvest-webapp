import type { Order } from '../private/dashboard/generate/order';
import type { TemplateConfig } from '../private/dashboard/generate/template-config';
import type { components } from './schema';

/** Wire DTOs derive from the checked-in backend contract, never from UI storage. */
export type GenerationRequest = components['schemas']['GenerationInput'];
export type GenerationAccepted = components['schemas']['GenerationJobAccepted'];
export type GenerationStatus = components['schemas']['GenerationJob'];
export type GenerationJob = GenerationAccepted & Partial<GenerationStatus>;
export type UploadRequest = components['schemas']['UploadInput'];
export type UploadSession = components['schemas']['UploadSession'];
export type UploadCompletionRequest = components['schemas']['CompleteUploadInput'];
export type UploadCompletion = components['schemas']['UploadComplete'];
export type TemplateRequest = components['schemas']['TemplateInput'];

export function toGenerationRequest(order: Order): GenerationRequest {
  const type = order.type;
  if (type !== 'zip' && type !== 'excel') throw new Error('生成する形式を選択してください。');
  const encoding = order.char_enc;
  if (encoding !== 'utf_8' && encoding !== 'utf-8' && encoding !== 'shift_jis' && encoding !== 'cp932') {
    throw new Error('ファイル名の文字コードが無効です。');
  }
  return {
    type, title: order.title, template_id: order.template_id,
    by_name: order.by_name, needs_include_hierarchy: order.needs_include_hierarchy,
    needs_make_dir: order.needs_make_dir, needs_all_photos: order.needs_all_photos,
    needs_date: order.needs_date, needs_print_settings: order.needs_print_settings,
    needs_sort: order.needs_sort, force_download: order.force_download,
    char_enc: encoding,
  };
}

export function toTemplateRequest(config: TemplateConfig): TemplateRequest {
  const type = config.template_type;
  if (type !== 'user' && type !== 'project') throw new Error('テンプレートの保存先を選択してください。');
  if (!config.template_data) throw new Error('テンプレートファイルを選択してください。');
  return {
    template_type: type, template_data: config.template_data,
    name: config.name, description: config.description,
    property_title: config.property_title, property_hierarchy: config.property_hierarchy,
    property_date: config.property_date,
  };
}
