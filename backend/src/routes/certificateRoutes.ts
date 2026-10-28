import { Router } from "express";
import {
  getCertificates,
  getCertificateById,
  generateCertificate,
  revokeCertificate,
  downloadPdf,
  publicVerify,
} from "../controllers/certificateController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

// Public routes for verification and PDF download
router.get("/:id/public", publicVerify);
router.get("/:id/pdf", downloadPdf);

// Protected routes
router.use(authMiddleware);
router.get("/", getCertificates);
router.get("/:id", getCertificateById);
router.post("/", roleMiddleware(["ADMIN", "OPERATOR"]), generateCertificate);
router.post("/:id/revoke", roleMiddleware(["ADMIN", "AUDITOR"]), revokeCertificate);

export default router;
