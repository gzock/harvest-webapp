export interface Project {
  project_id: string;
  project_code: string;
  name: string;
  created_at: string;
  updated_at: string;
  start_on: string;
  complete_on: string;
  role: string;
  selected?: boolean
}
