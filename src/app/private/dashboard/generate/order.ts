export interface Order {
  title: string;
  type: string;
  template: string;
  by_name: boolean;
  needs_include_hierarchy: boolean;
  needs_make_dir: boolean;
  needs_all_photos: boolean;
  needs_date: boolean;
  force_download: boolean;
  char_enc: string;
}
