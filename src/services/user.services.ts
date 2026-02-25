import prisma from "../config/prisma";
import {
  comparePasswords,
  createJWT,
  hashPassword,
} from "../middleware/auth.middleware";

export const createNewUser = async (req, res, next) => {
  try {
    const user = await prisma.user.create({
      data: {
        username: req.body.username,
        password: await hashPassword(req.body.password),
      },
    });

    const token = createJWT(user);
    res.json({ token });
  } catch (e) {
    next(e);
  }
};

export const signin = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: req.body.username,
      },
    });

    const isValid = await comparePasswords(req.body.password, user.password);

    if (!isValid) {
      res.status(401);
      res.json({ message: "access restricted" });
      return;
    }

    const token = createJWT(user);
    res.json({ token });
  } catch (e) {
    next(e);
  }
};
