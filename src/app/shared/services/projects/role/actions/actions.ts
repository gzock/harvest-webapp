import { ProjectActions } from './project-actions';
import { ProjectUserActions } from './project-user-actions';
import { WorkActions } from './work-actions';
import { PhotoActions } from './photo-actions';
import { GenerateActions } from './generate-actions';

export interface Actions {
  "project": ProjectActions;
  "user": ProjectUserActions;
  "work": WorkActions;
  "photo": PhotoActions;
  "generate": GenerateActions;
}
