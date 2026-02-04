import { Router } from "express";
import { handleInputErrors } from "../middleware/middleware";
import { updateMedia } from "../services/media";
import { protect } from "../middleware/auth";

const router = Router();

router.put("/media/:artPieceId", protect, handleInputErrors, updateMedia);

export default router;
