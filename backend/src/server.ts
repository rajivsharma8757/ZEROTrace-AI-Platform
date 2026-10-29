import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { dbStore } from "./services/dbStore.js";

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  await dbStore.init();

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`  ZEROTrace AI - Enterprise Backend REST Server     `);
    console.log(`  Secure • Verify • Prove • Recycle                `);
    console.log(`====================================================`);
    console.log(`  API Server running on: http://localhost:${PORT}`);
    console.log(`  Health Check:         http://localhost:${PORT}/api/health`);
    console.log(`  Environment:          ${process.env.NODE_ENV || "development"}`);
    console.log(`====================================================`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
