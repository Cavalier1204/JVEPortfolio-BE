import { Router } from "express";
import { handleInputErrors } from "../modules/middleware";
import { body } from "express-validator";
import {
  deleteArtPiece,
  saveArtPiece,
  updateArtPiece,
} from "../handlers/artpiece";
import { updateMedia } from "../handlers/media";

const router = Router();

/**
 * ArtPiece
 */
router.put("/artpiece/:id", handleInputErrors, updateArtPiece);
router.post(
  "/artpiece",
  body("title").isString(),
  body("description").isString(),
  body("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Value must be between 1 and 4"),
  body("module")
    .isInt({ min: 1, max: 16 })
    .withMessage("Value must be between 1 and 4"),
  body("media").isArray(),
  body("media.*.locationReference").isString(),
  body("media.*.order").isInt(),
  body("subject").isIn([
    "WERKPRAKTIJK_1",
    "WERKPRAKTIJK_2",
    "THEORIE",
    "SKILLS",
    "POSITIONERING",
    "PORTFOLIO",
  ]),
  handleInputErrors,
  saveArtPiece
);
router.delete("/artpiece/:id", deleteArtPiece);

/**
 * Media
 */
router.put("/media/:artPieceId", handleInputErrors, updateMedia);

export default router;
