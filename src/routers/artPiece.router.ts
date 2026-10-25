import { Router } from "express";
import {
  CreateArtPieceSchema,
  GetArtPiecesQuerySchema,
  GetArtPiecesSubjectQuerySchema,
  UpdateArtPieceSchema,
} from "../types/artPiece.types";
import { validate, validateQuery } from "../middleware/validation.middleware";
import artPieceController from "../controllers/artPiece.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  protect,
  validate(CreateArtPieceSchema),
  artPieceController.createArtPieceHandler,
);

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

router.get("/portfolio", artPieceController.getPortfolioArtPiecesHandler);

router.get("/:id", artPieceController.getArtPieceHandler);

router.put(
  "/:id",
  protect,
  validate(UpdateArtPieceSchema),
  artPieceController.updateArtPieceHandler,
);

router.delete("/:id", protect, artPieceController.deleteArtPieceHandler);

export default router;
