import { Permissions } from './permissions/permissions';

import { OwnerPermissions } from './permissions/owner-permissions';
import { AdminPermissions } from './permissions/admin-permissions';
import { WorkerPermissions } from './permissions/worker-permissions';
import { ReporterPermissions } from './permissions/reporter-permissions';

export class ActionPermissions {
  private role: string;

  constructor(role?: string) {
    if(role) this.setRole(role);
  }

  public setRole(role: string) {
    this.role = role;
  }

  public permissions(role?: string): Permissions {
    return this.actionPermissionsFactory(role || this.role);
  }

  private actionPermissionsFactory(role: string): Permissions {
    let permissions: Permissions;

    switch(role) {
      case "owner":
        permissions = new OwnerPermissions();
        break;

      case "admin":
        permissions = new AdminPermissions();
        break;

      case "worker":
        permissions = new WorkerPermissions();
        break;

      case "reporter":
        permissions = new ReporterPermissions();
        break;
    }
    return permissions;
  }
}
