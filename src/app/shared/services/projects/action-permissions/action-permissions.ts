import { Permissions } from './permissions';

import { OwnerPermissions } from './permissions/owner-permissions';
import { AdminPermissions } from './permissions/admin-permissions';
import { WorkerPermissions } from './permissions/worker-permissions';
import { ReporterPermissions } from './permissions/reporter-permissions';

export class ActionPermissions {
  private role: string;

  constructor(role: string) {
    this.role = role;
  }

  public permissions(role: string): Permissions {
    return this.actionPermissionsFactory(role);
  }

  private actionPermissionsFactory(role: string): Permissions {
    permission: Permissions;

    switch(role) {
      case "owner":
        permission = new OwnerPermissions();
        break;

      case "admin":
        permission = new AdminPermissions();
        break;

      case "worker":
        permission = new WorkerPermissions();
        break;

      case "reporter":
        permission = new ReporterPermissions();
        break;
    }
    return permission;
  }
}
