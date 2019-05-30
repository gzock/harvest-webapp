import { ProjectActions } from './../actions/project-actions';
import { ProjectUserActions } from './../actions/project-user-actions';
import { WorkActions } from './../actions/work-actions';
import { PhotoActions } from './../actions/photo-actions';
import { GenerateActions } from './../actions/generate-actions';

export interface Permissions {
  readonly "project": ProjectActions;
  readonly "user": ProjectUserActions;
  readonly "work": WorkActions;
  readonly "photo": PhotoActions;
  readonly "generate": GenerateActions;
}
