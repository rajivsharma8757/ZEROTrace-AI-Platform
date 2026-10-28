import { Router } from "express";
import { searchGlobal } from "../controllers/searchController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", searchGlobal);

export default router;
