import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AppRole =
  | "OWNER"
  | "ADMINISTRATOR"
  | "ADMIN"
  | "CREATOR"
  | "AUTHOR"
  | "TECHNICIAN"
  | "OPERATOR"
  | "AUDITOR"
  | "CUSTOMER"
  | "USER";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AppRole;
  fullName: string;
  organizationId?: string | null;
  status?: string;
  emailVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const JWT_SECRET = process.env.JWT_SECRET || "zerotrace_jwt_super_secret_enterprise_key_2026";

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization token required." });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    
    // Check if account status is disabled or suspended
    if (decoded.status === "DISABLED" || decoded.status === "SUSPENDED") {
      res.status(403).json({ success: false, message: "Account is deactivated or suspended. Please contact support." });
      return;
    }

    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid or expired session token." });
    return;
  }
}

export function roleMiddleware(allowedRoles: (AppRole | string)[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const userRole = (req.user.role || "").toUpperCase() as AppRole;

    // OWNER has superuser access across all modules
    if (userRole === "OWNER") {
      next();
      return;
    }

    const normalizedAllowed = allowedRoles.map((r) => r.toUpperCase());

    // Role equivalencies:
    // ADMIN <-> ADMINISTRATOR
    // OPERATOR <-> TECHNICIAN
    // CUSTOMER <-> USER
    const matches =
      normalizedAllowed.includes(userRole) ||
      (userRole === "ADMINISTRATOR" && normalizedAllowed.includes("ADMIN")) ||
      (userRole === "ADMIN" && normalizedAllowed.includes("ADMINISTRATOR")) ||
      (userRole === "TECHNICIAN" && normalizedAllowed.includes("OPERATOR")) ||
      (userRole === "OPERATOR" && normalizedAllowed.includes("TECHNICIAN")) ||
      (userRole === "USER" && normalizedAllowed.includes("CUSTOMER")) ||
      (userRole === "CUSTOMER" && normalizedAllowed.includes("USER"));

    if (!matches) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${userRole}' is not authorized to access this resource.`,
      });
      return;
    }

    next();
  };
}
