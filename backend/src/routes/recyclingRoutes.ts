import { Router } from "express";
import { getRecyclingStatus, approveRecycling, rejectRecycling } from "../controllers/recyclingController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getRecyclingStatus);
router.post("/approve", roleMiddleware(["ADMIN", "AUDITOR"]), approveRecycling);
router.post("/reject", roleMiddleware(["ADMIN", "AUDITOR"]), rejectRecycling);

export default router;
