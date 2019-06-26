export interface Target {
  project_id: string;
  target_id: string;
  parent_place_id: string;
  name: string;
  photos: {
    adopt: {
      before: string;
      after: string;
    }
    before: [string];
    after: [string];
  };
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
