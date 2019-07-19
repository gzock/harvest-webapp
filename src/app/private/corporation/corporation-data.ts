import { UserData } from './../dashboard/user/user-data';

export interface CorporationData {
  users: [ UserData ]
  billing: {
    price: number;
    cycle: string;
  }
}
