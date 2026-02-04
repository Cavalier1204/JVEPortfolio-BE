import { Router } from "express";
import { body, query } from "express-validator";
import { handleInputErrors, parseQueryToInt } from "../middleware/middleware";
import {
  deleteArtPiece,
  getArtPiecesByYearByModule,
  getArtPiecesByYearByModuleBySubject,
  getOneArtPiece,
  getPortfolioPieces,
  saveArtPiece,
  updateArtPiece,
} from "../services/artpiece";
import { protect } from "../middleware/auth";

const router = Router();

router.put("/:id", protect, handleInputErrors, updateArtPiece);
router.post(
  "/",
  protect,
  body("title").isString(),
  body("description").isString(),
  body("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Value must be between 1 and 4"),
  body("module")
    .isInt({ min: 1, max: 16 })
    .withMessage("Value must be between 1 and 16"),
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
  saveArtPiece,
);
router.delete("/:id", protect, deleteArtPiece);

router.get(
  "/module",
  parseQueryToInt,
  query("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be an integer"),
  query("module")
    .isInt({ min: 1, max: 16 })
    .withMessage("Module must be an integer"),
  handleInputErrors,
  getArtPiecesByYearByModule,
);
router.get(
  "/subject",
  parseQueryToInt,
  query("year")
    .isInt({ min: 1, max: 4 })
    .withMessage("Year must be an integer"),
  query("module")
    .isInt({ min: 1, max: 16 })
    .withMessage("Module must be an integer"),
  query("subject").isIn(["werkpraktijk", "kennis", "positionering"]),
  handleInputErrors,
  getArtPiecesByYearByModuleBySubject,
);
router.get("/:id", getOneArtPiece);
router.get("/portfolio", getPortfolioPieces);

export default router;
