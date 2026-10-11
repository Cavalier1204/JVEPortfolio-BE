import { Request } from "express";

export interface UserPayload {
  id: string;
  username: string;
}

declare module "express-serve-static-core" {
  interface Request {
    accessToken?: string;
    user?: UserPayload | any;
  }
}
