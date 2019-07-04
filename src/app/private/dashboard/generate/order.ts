export interface Order {
  type: string;
  template: string;
  by_name: boolean;
  needs_include_hierarchy: boolean;
  needs_make_dir: boolean;
  force_download: boolean;
  char_enc: string;
}
