import { Router } from "express";
import { getOrganizations, createOrganization } from "../controllers/organizationController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getOrganizations);
router.post("/", roleMiddleware(["ADMIN"]), createOrganization);

export default router;
