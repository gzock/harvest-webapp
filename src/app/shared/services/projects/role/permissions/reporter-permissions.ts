import { Permissions } from './permissions';
import { ProjectActions } from './../actions/project-actions';
import { ProjectUserActions } from './../actions/project-user-actions';
import { WorkActions } from './../actions/work-actions';
import { PhotoActions } from './../actions/photo-actions';
import { GenerateActions } from './../actions/generate-actions';

export class ReporterPermissions implements Permissions {
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
