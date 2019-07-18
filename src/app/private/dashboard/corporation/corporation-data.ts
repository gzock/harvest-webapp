import { UserData } from './../user/user-data';

export interface CorporationData {
  users: [ UserData ]
  billing: {
    price: number;
    cycle: string;
  }
}
