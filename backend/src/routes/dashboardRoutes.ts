import { Router } from "express";
import { getStats, getCharts } from "../controllers/dashboardController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/stats", getStats);
router.get("/charts", getCharts);

export default router;
