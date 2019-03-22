export interface Order {
  type: string;
  template: string;
  by_name: boolean;
  has_hierarchy: boolean;
  force_download: boolean;
}
