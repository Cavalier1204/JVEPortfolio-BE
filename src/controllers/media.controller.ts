import { Request, Response, NextFunction } from "express";
import { updateMedia, UpdateMediaInput } from "../services/media.service";

export const updateMediaHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const artPieceId = (req.params.artPieceId as string);
    const input: UpdateMediaInput = req.body;

    await updateMedia(artPieceId, input);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export default {
  updateMediaHandler,
};
