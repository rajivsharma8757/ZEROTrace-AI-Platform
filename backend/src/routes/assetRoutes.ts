import { Router } from "express";
import { getAssets, getAssetById, createAsset, updateAsset, analyzeAsset } from "../controllers/assetController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAssets);
router.post("/", roleMiddleware(["ADMIN", "OPERATOR", "CUSTOMER"]), createAsset);
router.get("/:id", getAssetById);
router.patch("/:id", roleMiddleware(["ADMIN", "OPERATOR"]), updateAsset);
router.post("/:id/ai-analyze", analyzeAsset);

export default router;
