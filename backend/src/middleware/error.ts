import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  console.error("Internal Error:", err);
  const status = err.status || 500;
  const message = err.message || "An internal server error occurred.";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
