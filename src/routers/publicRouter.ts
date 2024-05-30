import { Router } from "express";
import {
  getArtPiecesByYearByModule,
  getArtPiecesByYearByModuleBySubject,
  getOneArtPiece,
  getPortfolioPieces,
} from "../handlers/artpiece";
import { query } from "express-validator";
import { handleInputErrors, parseQueryToInt } from "../modules/middleware";

const router = Router();

/**
 * ArtPiece
 */
router.get(
  "/module",
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
router.get(
  "/subject",
  parseQueryToInt,
  query("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be an integer"),
  query("module")
    .isInt({ min: 1, max: 4 })
    .withMessage("Module must be an integer"),
  query("subject").isIn(["werkpraktijk", "kennis", "positionering"]),
  handleInputErrors,
  getArtPiecesByYearByModuleBySubject
);
router.get("/artpiece/:id", getOneArtPiece);

/**
 * Portfolio items
 */
router.get("/portfolio", getPortfolioPieces);

export default router;
