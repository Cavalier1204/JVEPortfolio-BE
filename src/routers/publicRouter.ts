import { Router } from "express";
import { getArtPieces, getOneArtPiece } from "../handlers/artpiece";

const router = Router();

/**
 * ArtPiece
 */
router.get("/artpiece", getArtPieces);
router.get("/artpiece/:id", getOneArtPiece);

export default router;
