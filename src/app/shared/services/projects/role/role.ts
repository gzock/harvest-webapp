export class Role {
  private _role: string;

  constructor(role: string) {
    this._role = role;
  }

  public set role(role :string) {
    this._role = role;
  }

  public get role(): string {
    return this._role;
  }

  public validActions(): string {
    return this._role;
  }

  //owner: {
  //
  //}
  //admin:
  //worker:
  //reporter:
  //viewer:
}
