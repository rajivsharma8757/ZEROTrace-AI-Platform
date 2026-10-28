import { Router } from "express";
import { getVerifications, getVerificationById, submitDecision } from "../controllers/verificationController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getVerifications);
router.get("/:id", getVerificationById);
router.post("/:id/decision", roleMiddleware(["ADMIN", "OPERATOR", "AUDITOR"]), submitDecision);

export default router;
