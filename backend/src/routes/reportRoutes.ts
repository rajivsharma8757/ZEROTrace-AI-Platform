import { Router } from "express";
import { getReportData, exportCsv, exportPdf } from "../controllers/reportController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/:type", getReportData);
router.get("/:type/export-csv", exportCsv);
router.get("/:type/export-pdf", exportPdf);

export default router;
