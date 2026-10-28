import { Router } from "express";
import { getNotifications, markAsRead, markAllRead } from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.post("/read-all", markAllRead);

export default router;
