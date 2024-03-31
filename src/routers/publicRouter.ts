import { Router } from "express";
import {
  getArtPiecesByYearByModule,
  getOneArtPiece,
} from "../handlers/artpiece";
import { query } from "express-validator";
import { handleInputErrors, parseQueryToInt } from "../modules/middleware";

const router = Router();

/**
 * ArtPiece
 */
router.get(
  "/artpiece",
  parseQueryToInt,
  query("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be an integer"),
  query("module")
    .isInt({ min: 1, max: 4 })
    .withMessage("Module must be an integer"),
  handleInputErrors,
  getArtPiecesByYearByModule
);
router.get("/artpiece/:id", getOneArtPiece);

export default router;
