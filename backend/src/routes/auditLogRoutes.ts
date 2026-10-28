import { Router } from "express";
import { getAuditLogs, verifyAuditChain } from "../controllers/auditLogController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);
router.use(roleMiddleware(["ADMIN", "AUDITOR"]));

router.get("/", getAuditLogs);
router.get("/verify-chain", verifyAuditChain);

export default router;
