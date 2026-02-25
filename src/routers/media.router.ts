import { Router } from "express";
import { handleInputErrors } from "../middleware/validation.middleware";
import { updateMedia } from "../services/media.services";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.put("/media/:artPieceId", protect, handleInputErrors, updateMedia);

export default router;
