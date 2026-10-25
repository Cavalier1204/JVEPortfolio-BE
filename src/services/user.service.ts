import { db } from "../drizzle/db";
import { user } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  comparePasswords,
  createJWT,
  hashPassword,
} from "../middleware/auth.middleware";
import {
  UnauthorizedError,
  AdminAlreadyExistsError,
} from "../errors/domain.errors";

export interface UserInput {
  username: string;
  password: string;
}

export const createNewUser = async (input: UserInput) => {
  const existingUsers = await db.select().from(user);
  if (existingUsers.length > 0) {
    throw new AdminAlreadyExistsError("Admin user already exists");
  }

  const hashedPassword = await hashPassword(input.password);
  const [createdUser] = await db
    .insert(user)
    .values({
      username: input.username,
      password: hashedPassword,
    })
    .returning();

  const token = createJWT({
    id: createdUser.id,
    username: createdUser.username,
    role: createdUser.role,
  });
  return { token, user: createdUser };
};

export const signin = async (input: UserInput) => {
  const [existingUser] = await db
    .select()
    .from(user)
    .where(eq(user.username, input.username));

  if (!existingUser) {
    throw new UnauthorizedError("access restricted");
  }

  const isValid = await comparePasswords(input.password, existingUser.password);
  if (!isValid) {
    throw new UnauthorizedError("access restricted");
  }

  const token = createJWT({
    id: existingUser.id,
    username: existingUser.username,
    role: existingUser.role,
  });

  return {
    token,
    user: {
      id: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    },
  };
};

export const getMe = async (userId: string) => {
  const [existingUser] = await db
    .select({
      id: user.id,
      username: user.username,
      role: user.role,
    })
    .from(user)
    .where(eq(user.id, userId));

  if (!existingUser) {
    throw new UnauthorizedError("access restricted");
  }

  return existingUser;
};
