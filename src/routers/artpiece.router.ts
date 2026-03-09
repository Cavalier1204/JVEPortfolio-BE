import { Router } from "express";
import {
  CreateArtPieceSchema,
  GetArtPiecesQuerySchema,
  GetArtPiecesSubjectQuerySchema,
} from "../types/artPiece.types";
import {
  handleInputErrors,
  validate,
  validateQuery,
} from "../middleware/validation.middleware";
import artPieceController from "../controllers/artPiece.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  protect,
  validate(CreateArtPieceSchema),
  artPieceController.createArtPieceHandler,
);
router.get("/:id", artPieceController.getArtPieceHandler);
router.get(
  "/module",
  validateQuery(GetArtPiecesQuerySchema),
  artPieceController.getArtPiecesByYearModuleHandler,
);
router.get(
  "/subject",
  validateQuery(GetArtPiecesSubjectQuerySchema),
  artPieceController.getArtPiecesByYearModuleSubjectHandler,
);
router.put(
  "/:id",
  protect,
  handleInputErrors,
  artPieceController.updateArtPieceHandler,
);
router.delete("/:id", protect, artPieceController.deleteArtPieceHandler);

router.get("/portfolio", artPieceController.getPortfolioArtPiecesHandler);

export default router;
