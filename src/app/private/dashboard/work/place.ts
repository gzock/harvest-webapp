export interface Place {
  project_id: string;
  place_id: string;
  parent_place_id: string;
  hierarchy: string;
  name: string;
  photos: {
    required: number;
    results: {
      before: number;
      after: number;
    }
  };
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}
