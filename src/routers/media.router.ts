import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validation.middleware";
import { protect } from "../middleware/auth.middleware";
import mediaController from "../controllers/media.controller";

const router = Router();

export const UpdateMediaSchema = z.object({
  deletedMedia: z.array(z.string()).optional(),
  newMedia: z
    .array(
      z.object({
        locationReference: z.string(),
        order: z.number().int(),
      }),
    )
    .optional(),
  updatedMedia: z
    .array(
      z.object({
        id: z.string(),
        order: z.number().int().optional(),
      }),
    )
    .optional(),
});

router.put(
  "/:artPieceId",
  protect,
  validate(UpdateMediaSchema),
  mediaController.updateMediaHandler,
);

export default router;
