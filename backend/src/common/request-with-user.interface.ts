import { Request } from 'express';
import { User } from '../users/user.entity';

export type UserPayload = Omit<User, 'password'>;

export interface RequestWithUser extends Request {
  user: UserPayload;
}
