import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { dbStore } from "../services/dbStore.js";
import { JWT_SECRET } from "../middleware/auth.js";
import { emailService } from "../services/emailService.js";
import { prisma } from "../utils/prisma.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function register(req: Request, res: Response): Promise<void> {
  const { fullName, email, password, organizationId, department } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: "Full name, email, and password are required." });
    return;
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ success: false, message: "Please enter a valid email address." });
    return;
  }

  // Password strength check
  if (password.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Prevent duplicate accounts
  const existing = dbStore.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(409).json({ success: false, message: "An account with this email address already exists." });
    return;
  }

  // Public registration MUST assign least-privileged role (USER), unless configured as OWNER_EMAIL
  let assignedRole = "USER";
  if (process.env.OWNER_EMAIL && normalizedEmail === process.env.OWNER_EMAIL.toLowerCase().trim()) {
    assignedRole = "OWNER";
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const newUser = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash,
    role: assignedRole,
    organizationId: organizationId || "org-apex-01",
    department: department || "General Operations",
    status: "ACTIVE",
    emailVerified: assignedRole === "OWNER",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbStore.saveUser(newUser);

  // Generate Email Verification Token
  const verifyToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  if (dbStore.isPostgresAvailable) {
    try {
      await prisma.emailVerificationToken.create({
        data: {
          userId: newUser.id,
          token: verifyToken,
          expiresAt,
        },
      });
    } catch (err: any) {
      console.warn("Could not persist email verification token to DB:", err.message);
    }
  }

  // Attempt to deliver verification email
  await emailService.sendVerificationEmail(newUser.email, verifyToken);

  await dbStore.recordAudit(
    newUser.id,
    "USER_REGISTERED",
    null,
    null,
    `New account registered: ${newUser.fullName} with role ${newUser.role}`
  );

  const token = jwt.sign(
    {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      fullName: newUser.fullName,
      organizationId: newUser.organizationId,
      status: newUser.status,
      emailVerified: newUser.emailVerified,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      organizationId: newUser.organizationId,
      status: newUser.status,
      emailVerified: newUser.emailVerified,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: "Email and password are required." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();

  // Find user by normalized email
  let user = dbStore.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);

  // If not found in memory cache, query PostgreSQL directly
  if (!user && dbStore.isPostgresAvailable) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (dbUser) {
        user = dbUser;
        await dbStore.saveUser(dbUser);
      }
    } catch {}
  }

  if (!user) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  // Account status check
  if (user.status === "DISABLED" || user.status === "SUSPENDED") {
    res.status(403).json({
      success: false,
      message: "This account has been deactivated or suspended. Please contact your organization administrator.",
    });
    return;
  }

  // Verify password using bcrypt
  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid email or password." });
    return;
  }

  user.lastLogin = new Date().toISOString();
  await dbStore.saveUser(user);

  await dbStore.recordAudit(
    user.id,
    "USER_LOGIN",
    null,
    null,
    `User ${user.fullName} (${user.role}) logged in successfully`
  );

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      organizationId: user.organizationId,
      status: user.status,
      emailVerified: user.emailVerified,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      organizationId: user.organizationId,
      status: user.status,
      emailVerified: user.emailVerified,
    },
  });
}

export async function googleAuth(req: Request, res: Response): Promise<void> {
  const { credential } = req.body;

  if (!credential) {
    res.status(400).json({ success: false, message: "Google credential token is required." });
    return;
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    res.status(503).json({
      success: false,
      message: "Google OAuth is not configured on this server. Please set GOOGLE_CLIENT_ID in server environment.",
    });
    return;
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      res.status(400).json({ success: false, message: "Unable to verify Google profile." });
      return;
    }

    if (!payload.email_verified) {
      res.status(400).json({ success: false, message: "Google email is not verified. Please verify your Google account first." });
      return;
    }

    const email = payload.email.toLowerCase().trim();
    const fullName = payload.name || payload.email.split("@")[0];
    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    let user = dbStore.getUsers().find((u) => u.email.toLowerCase() === email || u.googleId === googleId);

    if (user) {
      // Safe linking to existing verified account
      if (!user.googleId) {
        user.googleId = googleId;
      }
      if (avatarUrl && !user.avatarUrl) {
        user.avatarUrl = avatarUrl;
      }
      user.emailVerified = true;
      user.lastLogin = new Date().toISOString();
      await dbStore.saveUser(user);
    } else {
      // First-time sign-in: assign least-privileged role (USER), or OWNER if matches OWNER_EMAIL
      let assignedRole = "USER";
      if (process.env.OWNER_EMAIL && email === process.env.OWNER_EMAIL.toLowerCase().trim()) {
        assignedRole = "OWNER";
      }

      const randomPass = crypto.randomBytes(24).toString("hex");
      const salt = bcrypt.genSaltSync(10);
      user = {
        id: `usr-g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        fullName,
        email,
        passwordHash: bcrypt.hashSync(randomPass, salt),
        role: assignedRole,
        organizationId: "org-apex-01",
        department: "Client Services",
        status: "ACTIVE",
        emailVerified: true,
        googleId,
        avatarUrl,
        lastLogin: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await dbStore.saveUser(user);
    }

    if (user.status === "DISABLED" || user.status === "SUSPENDED") {
      res.status(403).json({
        success: false,
        message: "This account has been deactivated. Please contact your organization administrator.",
      });
      return;
    }

    await dbStore.recordAudit(
      user.id,
      "GOOGLE_AUTH_LOGIN",
      null,
      null,
      `User ${user.fullName} logged in via Google OAuth (${user.email})`
    );

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        organizationId: user.organizationId,
        status: user.status,
        emailVerified: user.emailVerified,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        organizationId: user.organizationId,
        status: user.status,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err: any) {
    console.error("Google token verification failed:", err.message);
    res.status(401).json({ success: false, message: "Google authentication failed: Invalid or expired credential." });
  }
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email address is required." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = dbStore.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);

  if (user) {
    // Generate secure single-use expiring token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    if (dbStore.isPostgresAvailable) {
      try {
        await prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            token: resetToken,
            expiresAt,
          },
        });
      } catch (err: any) {
        console.warn("Could not save password reset token to DB:", err.message);
      }
    }

    // Deliver email
    const emailResult = await emailService.sendPasswordResetEmail(user.email, resetToken);

    await dbStore.recordAudit(
      user.id,
      "PASSWORD_RESET_REQUESTED",
      null,
      null,
      `Password reset requested for ${user.email} (Email delivery: ${emailResult.delivered ? "Delivered" : "Queued in local outbox"})`
    );
  }

  // Consistent response to avoid user enumeration
  res.json({
    success: true,
    message: "If an account exists with this email address, password reset instructions have been dispatched.",
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token, newPassword, email } = req.body;

  if (!token || !newPassword) {
    res.status(400).json({ success: false, message: "Reset token and new password are required." });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
    return;
  }

  let matchedUserId: string | null = null;

  // 1. Verify token in PostgreSQL
  if (dbStore.isPostgresAvailable) {
    try {
      const tokenRecord = await prisma.passwordResetToken.findUnique({
        where: { token },
      });

      if (tokenRecord) {
        if (tokenRecord.used) {
          res.status(400).json({ success: false, message: "This password reset token has already been used." });
          return;
        }

        if (new Date() > new Date(tokenRecord.expiresAt)) {
          res.status(400).json({ success: false, message: "This password reset token has expired. Please request a new one." });
          return;
        }

        matchedUserId = tokenRecord.userId;
        // Mark token as used
        await prisma.passwordResetToken.update({
          where: { token },
          data: { used: true },
        });
      }
    } catch (err: any) {
      console.warn("Token DB check warning:", err.message);
    }
  }

  // 2. Check local outbox tokens if DB token wasn't found (e.g. dev/fallback)
  if (!matchedUserId) {
    const outbox = emailService.getOutbox();
    const outboxMatch = outbox.find((o) => o.token === token && o.type === "PASSWORD_RESET");
    if (outboxMatch) {
      if (outboxMatch.used) {
        res.status(400).json({ success: false, message: "This password reset token has already been used." });
        return;
      }
      const u = dbStore.getUsers().find((usr) => usr.email.toLowerCase() === outboxMatch.to.toLowerCase());
      if (u) {
        matchedUserId = u.id;
        emailService.markTokenUsed(token);
      }
    }
  }

  if (!matchedUserId) {
    res.status(400).json({ success: false, message: "Invalid, expired, or previously used password reset token." });
    return;
  }

  const user = dbStore.getUsers().find((u) => u.id === matchedUserId);
  if (!user) {
    res.status(404).json({ success: false, message: "User account not found." });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  user.updatedAt = new Date().toISOString();
  await dbStore.saveUser(user);

  await dbStore.recordAudit(
    user.id,
    "PASSWORD_RESET_COMPLETED",
    null,
    null,
    `Password reset completed successfully for ${user.email}`
  );

  res.json({
    success: true,
    message: "Password updated successfully. You may now log in with your new password.",
  });
}

export async function verifyEmail(req: Request, res: Response): Promise<void> {
  const { token, email } = req.body;

  if (!token) {
    res.status(400).json({ success: false, message: "Verification token is required." });
    return;
  }

  let matchedUserId: string | null = null;

  if (dbStore.isPostgresAvailable) {
    try {
      const tokenRecord = await prisma.emailVerificationToken.findUnique({
        where: { token },
      });

      if (tokenRecord) {
        if (tokenRecord.used) {
          res.status(400).json({ success: false, message: "This verification link has already been used." });
          return;
        }

        if (new Date() > new Date(tokenRecord.expiresAt)) {
          res.status(400).json({ success: false, message: "Verification link has expired. Please request a new one." });
          return;
        }

        matchedUserId = tokenRecord.userId;
        await prisma.emailVerificationToken.update({
          where: { token },
          data: { used: true },
        });
      }
    } catch {}
  }

  if (!matchedUserId) {
    const outbox = emailService.getOutbox();
    const outboxMatch = outbox.find((o) => o.token === token && o.type === "EMAIL_VERIFICATION");
    if (outboxMatch) {
      const u = dbStore.getUsers().find((usr) => usr.email.toLowerCase() === outboxMatch.to.toLowerCase());
      if (u) matchedUserId = u.id;
    }
  }

  if (!matchedUserId && email) {
    const u = dbStore.getUsers().find((usr) => usr.email.toLowerCase() === email.toLowerCase().trim());
    if (u) matchedUserId = u.id;
  }

  if (!matchedUserId) {
    res.status(400).json({ success: false, message: "Invalid or expired verification token." });
    return;
  }

  const user = dbStore.getUsers().find((u) => u.id === matchedUserId);
  if (!user) {
    res.status(404).json({ success: false, message: "User account not found." });
    return;
  }

  user.emailVerified = true;
  user.status = "ACTIVE";
  user.updatedAt = new Date().toISOString();
  await dbStore.saveUser(user);

  await dbStore.recordAudit(user.id, "EMAIL_VERIFIED", null, null, `Email address verified for ${user.email}`);

  res.json({ success: true, message: "Email address verified successfully. Your account is active." });
}

export async function resendVerification(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: "Email is required." });
    return;
  }

  const user = dbStore.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (user && !user.emailVerified) {
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (dbStore.isPostgresAvailable) {
      try {
        await prisma.emailVerificationToken.create({
          data: {
            userId: user.id,
            token: verifyToken,
            expiresAt,
          },
        });
      } catch {}
    }

    await emailService.sendVerificationEmail(user.email, verifyToken);
  }

  res.json({
    success: true,
    message: "If an unverified account exists with this email, a new verification link has been sent.",
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, message: "Not authenticated" });
    return;
  }

  let user = dbStore.getUsers().find((u) => u.id === req.user!.id);
  if (!user && dbStore.isPostgresAvailable) {
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: req.user!.id } });
      if (dbUser) user = dbUser;
    } catch {}
  }

  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  const org = dbStore.getOrganizations().find((o) => o.id === user.organizationId);

  res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      organization: org || null,
      status: user.status,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin,
    },
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  if (req.user) {
    await dbStore.recordAudit(req.user.id, "USER_LOGOUT", null, null, `User ${req.user.fullName} logged out`);
  }
  res.json({ success: true, message: "Successfully logged out." });
}
