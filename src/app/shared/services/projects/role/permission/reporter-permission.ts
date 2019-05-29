import { Actions } from './actions';
import { ProjectActions } from './project-actions';
import { ProjectUserActions } from './project-user-actions';
import { WorkActions } from './work-actions';
import { PhotoActions } from './photo-actions';
import { GenerateActions } from './generate-actions';

export class OwnerActions implements Actions {
  public project: ProjectActions = {
    "create": false,
    "update": false,
    "delete": false
  }

  public user: ProjectUserActions = {
    "accept": false,
    "update": false,
    "reject": false,
    "delete": false
  }

  public work: WorkActions = {
    "create": false,
    "update": false,
    "delete": false
  }

  public photo: PhotoActions = {
    "create": true,
    "update": false,
    "delete": false
  }

  public generate: GenerateActions = {
    "zip": false,
    "excel": false
  }
}
