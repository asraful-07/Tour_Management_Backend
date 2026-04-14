import { Role } from "../modules/user/user.interface";

export interface IRequestUser {
  userId: string;
  role: Role;
  email: string;
}
