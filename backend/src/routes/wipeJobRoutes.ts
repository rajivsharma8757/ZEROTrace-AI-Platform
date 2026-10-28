import { Router } from "express";
import { getWipeJobs, createWipeJob, startWipeJob, advanceWipeJob } from "../controllers/wipeJobController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getWipeJobs);
router.post("/", roleMiddleware(["ADMIN", "OPERATOR"]), createWipeJob);
router.post("/:id/start", roleMiddleware(["ADMIN", "OPERATOR"]), startWipeJob);
router.post("/:id/advance", roleMiddleware(["ADMIN", "OPERATOR"]), advanceWipeJob);

export default router;
