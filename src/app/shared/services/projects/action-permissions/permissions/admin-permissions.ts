import { Permissions } from './permissions';
import { ProjectActions } from './../actions/project-actions';
import { ProjectUserActions } from './../actions/project-user-actions';
import { WorkActions } from './../actions/work-actions';
import { PhotoActions } from './../actions/photo-actions';
import { GenerateActions } from './../actions/generate-actions';

export class AdminPermissions implements Permissions {
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
    "execute": true,
    "manage": true
  }
}
