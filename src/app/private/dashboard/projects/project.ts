export interface Project {
  project_id: string;
  project_code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  start_on: string;
  complete_on: string;
  role: string;
}
