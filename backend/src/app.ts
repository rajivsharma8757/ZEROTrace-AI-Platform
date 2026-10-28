import express, { Express, Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import assetRoutes from "./routes/assetRoutes.js";
import wipeJobRoutes from "./routes/wipeJobRoutes.js";
import verificationRoutes from "./routes/verificationRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import auditLogRoutes from "./routes/auditLogRoutes.js";
import recyclingRoutes from "./routes/recyclingRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import { errorHandler } from "./middleware/error.js";

const app: Express = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "HEALTHY",
    service: "ZEROTrace AI Enterprise Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/wipe-jobs", wipeJobRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/audit-logs", auditLogRoutes);
app.use("/api/recycling", recyclingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
