export interface Notification {
  user_id: string;
  notification_id: string;
  project_id: string;
  message: string;
  created_at: string;
  updated_at: string;
  read: boolean;
}
