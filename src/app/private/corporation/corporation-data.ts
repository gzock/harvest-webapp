import { UserData } from './../dashboard/user/user-data';

export interface CorporationData {
  users: [ UserData ];
  billing: {
    billed_on: string;
    closed_on: string;
    price: number;
    status: string;
    destination: {
      name: string;
      email: string;
      postal_code: string;
      address: string; 
      department: string;
      contact: string;
      tel: string;
    }
    history: any;
  }
}
