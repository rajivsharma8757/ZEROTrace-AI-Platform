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
import { dbStore } from "./services/dbStore.js";

const app: Express = express();

const defaultAllowedOrigins = [
  "https://rajivsharma8757.github.io",
  "http://localhost:8080",
  "http://localhost:8081",
  "http://localhost:3000",
  "http://localhost:5173",
];

const customFrontend = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.replace(/\/+$/, "") : "";
let parsedCustomOrigin = "";
if (customFrontend) {
  try {
    const u = new URL(customFrontend);
    parsedCustomOrigin = u.origin;
  } catch {}
}

const allowedOriginsSet = new Set(
  [...defaultAllowedOrigins, customFrontend, parsedCustomOrigin].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOriginsSet.has(origin) ||
        origin.endsWith(".github.io") ||
        process.env.NODE_ENV !== "production"
      ) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check (Handles both /health and /api/health for Render and cloud balancers)
const healthHandler = (req: Request, res: Response) => {
  res.json({
    status: "HEALTHY",
    service: "ZEROTrace AI Enterprise Backend API",
    version: "1.0.0",
    storageMode: dbStore.isPostgresAvailable ? "postgresql" : "file",
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthHandler);
app.get("/api/health", healthHandler);

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
