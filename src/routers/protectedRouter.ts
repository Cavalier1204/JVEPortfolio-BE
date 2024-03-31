import { Router } from "express";
import { handleInputErrors } from "../modules/middleware";
import { body } from "express-validator";
import {
  deleteArtPiece,
  saveArtPiece,
  // updateArtPiece,
} from "../handlers/artpiece";

const router = Router();

/**
 * ArtPiece
 */
// router.put(
//   "/artpiece/:id",
//   body("name").isString(),
//   handleInputErrors,
//   updateArtPiece
// );
router.post(
  "/artpiece",
  body("title").isString(),
  body("description").isString(),
  body("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Value must be between 1 and 4"),
  body("module")
    .isInt({ min: 1, max: 4 })
    .withMessage("Value must be between 1 and 4"),
  body("media").isArray(), // Check if 'media' is an array
  body("media.*.locationReference").isString(), // Check if each 'media' object has 'locationReference' as string
  body("media.*.order").isInt(),
  handleInputErrors,
  saveArtPiece
);
router.delete("/artpiece/:id", deleteArtPiece);

export default router;
