import { Request } from "express";
import { User } from "@prisma/client";

declare module "express-serve-static-core" {
  interface Request {
    accessToken?: string;
    user?: User;
  }
}
