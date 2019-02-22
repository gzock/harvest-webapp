export interface Target {
  project_id: string;
  target_id: string;
  parent_place_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  photos: {
    adopt: {
      before: string;
      after: string;
    }
    before: [string];
    after: [string];
  }
}
