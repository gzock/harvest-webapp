import { Actions } from './actions';
import { ProjectActions } from './project-actions';
import { ProjectUserActions } from './project-user-actions';
import { WorkActions } from './work-actions';
import { PhotoActions } from './photo-actions';
import { GenerateActions } from './generate-actions';

export class OwnerActions implements Actions {
  public project: ProjectActions = {
    "create": true,
    "update": false,
    "delete": false
  }

  public user: ProjectUserActions = {
    "accept": true,
    "update": true,
    "reject": true,
    "delete": true
  }

  public work: WorkActions = {
    "create": true,
    "update": true,
    "delete": true
  }

  public photo: PhotoActions = {
    "create": true,
    "update": true,
    "delete": true
  }

  public generate: GenerateActions = {
    "zip": true,
    "excel": true
  }
}
