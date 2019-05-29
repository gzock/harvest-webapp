import { ProjectActions } from './../actions/project-actions';
import { ProjectUserActions } from './../actions/project-user-actions';
import { WorkActions } from './../actions/work-actions';
import { PhotoActions } from './../actions/photo-actions';
import { GenerateActions } from './../actions/generate-actions';

export interface Permissions {
  "project": ProjectActions;
  "user": ProjectUserActions;
  "work": WorkActions;
  "photo": PhotoActions;
  "generate": GenerateActions;
}
