import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { dbStore } from "../services/dbStore.js";
import { emailService } from "../services/emailService.js";
import { prisma } from "../utils/prisma.js";

// Valid role types
export const VALID_ROLES = [
  "OWNER",
  "ADMINISTRATOR",
  "ADMIN",
  "CREATOR",
  "AUTHOR",
  "TECHNICIAN",
  "OPERATOR",
  "AUDITOR",
  "CUSTOMER",
  "USER",
];

export async function getUsers(req: Request, res: Response): Promise<void> {
  const { search, role, status } = req.query;

  let users = dbStore.getUsers().map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    department: u.department,
    status: u.status,
    emailVerified: u.emailVerified ?? true,
    lastLogin: u.lastLogin,
    createdAt: u.createdAt,
  }));

  if (role && typeof role === "string" && role !== "ALL") {
    users = users.filter((u) => u.role.toUpperCase() === role.toUpperCase());
  }

  if (status && typeof status === "string" && status !== "ALL") {
    users = users.filter((u) => u.status.toUpperCase() === status.toUpperCase());
  }

  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.department && u.department.toLowerCase().includes(q))
    );
  }

  res.json({ success: true, count: users.length, data: users });
}

export async function createUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { fullName, email, password, role = "USER", department } = req.body;

  if (!fullName || !email || !password) {
    res.status(400).json({ success: false, message: "Full name, email, and password are required." });
    return;
  }

  const normalizedRole = role.toUpperCase();
  if (!VALID_ROLES.includes(normalizedRole)) {
    res.status(400).json({ success: false, message: `Invalid role '${role}'.` });
    return;
  }

  // Privilege checks: Only an OWNER can create another OWNER
  if (normalizedRole === "OWNER" && actor.role !== "OWNER") {
    res.status(403).json({ success: false, message: "Only an authorized Owner can create or assign the Owner role." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = dbStore.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    res.status(409).json({ success: false, message: "User with this email already exists." });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: fullName.trim(),
    email: normalizedEmail,
    passwordHash: bcrypt.hashSync(password, salt),
    role: normalizedRole,
    organizationId: actor.organizationId || "org-apex-01",
    department: department || "Operations",
    status: "ACTIVE",
    emailVerified: true,
    lastLogin: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbStore.saveUser(newUser);

  await dbStore.recordAudit(
    actor.id,
    "USER_CREATED",
    null,
    null,
    `${actor.fullName} (${actor.role}) created user ${fullName} (${normalizedRole})`
  );

  res.status(201).json({
    success: true,
    data: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: newUser.status,
    },
  });
}

export async function updateUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { id } = req.params;
  const { fullName, role, department, status } = req.body;

  const user = dbStore.getUsers().find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  }

  // Protection: Last active Owner cannot be demoted or disabled
  if (user.role === "OWNER") {
    const activeOwners = dbStore.getUsers().filter((u) => u.role === "OWNER" && u.status === "ACTIVE");
    if (activeOwners.length <= 1) {
      if (role && role !== "OWNER") {
        res.status(400).json({ success: false, message: "Cannot demote the last active organization Owner." });
        return;
      }
      if (status && status !== "ACTIVE") {
        res.status(400).json({ success: false, message: "Cannot deactivate or suspend the last active organization Owner." });
        return;
      }
    }
  }

  // Protection: Only OWNER can promote someone to OWNER
  if (role) {
    const targetRole = role.toUpperCase();
    if (targetRole === "OWNER" && actor.role !== "OWNER") {
      res.status(403).json({ success: false, message: "Only an authorized Owner can assign the Owner role." });
      return;
    }
    user.role = targetRole;
  }

  if (fullName) user.fullName = fullName.trim();
  if (department !== undefined) user.department = department;
  if (status) user.status = status;
  user.updatedAt = new Date().toISOString();

  await dbStore.saveUser(user);

  await dbStore.recordAudit(
    actor.id,
    "USER_UPDATED",
    null,
    null,
    `${actor.fullName} updated member ${user.email} (Role: ${user.role}, Status: ${user.status})`
  );

  res.json({
    success: true,
    data: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    },
  });
}

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { id } = req.params;

  if (id === actor.id) {
    res.status(400).json({ success: false, message: "Cannot disable or remove your own account." });
    return;
  }

  const user = dbStore.getUsers().find((u) => u.id === id);
  if (!user) {
    res.status(404).json({ success: false, message: "User not found." });
    return;
  }

  // Protection: Last active Owner cannot be removed
  if (user.role === "OWNER") {
    const activeOwners = dbStore.getUsers().filter((u) => u.role === "OWNER" && u.status === "ACTIVE");
    if (activeOwners.length <= 1) {
      res.status(400).json({ success: false, message: "Cannot remove the last active organization Owner." });
      return;
    }
  }

  // Non-owners cannot delete an Owner
  if (user.role === "OWNER" && actor.role !== "OWNER") {
    res.status(403).json({ success: false, message: "Only an Owner can deactivate or remove another Owner." });
    return;
  }

  user.status = "DISABLED";
  user.updatedAt = new Date().toISOString();
  await dbStore.saveUser(user);

  await dbStore.recordAudit(actor.id, "USER_DISABLED", null, null, `${actor.fullName} disabled account for ${user.email}`);

  res.json({ success: true, message: `User ${user.email} has been deactivated.` });
}

// ==========================================
// Team Invitations
// ==========================================

export async function inviteTeamMember(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { email, role = "USER", department } = req.body;

  if (!email) {
    res.status(400).json({ success: false, message: "Email is required for invitation." });
    return;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const normalizedRole = role.toUpperCase();

  if (!VALID_ROLES.includes(normalizedRole)) {
    res.status(400).json({ success: false, message: `Invalid role '${role}'.` });
    return;
  }

  // Privilege checks: Only an OWNER can invite another OWNER
  if (normalizedRole === "OWNER" && actor.role !== "OWNER") {
    res.status(403).json({ success: false, message: "Only an authorized Owner can invite a new Owner." });
    return;
  }

  // Check if user already exists
  const existingUser = dbStore.getUsers().find((u) => u.email.toLowerCase() === normalizedEmail);
  if (existingUser) {
    res.status(409).json({ success: false, message: "A registered user with this email already exists." });
    return;
  }

  // Generate secure invitation token
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const invitation = {
    id: `inv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    email: normalizedEmail,
    role: normalizedRole,
    department: department || "Operations",
    organizationId: actor.organizationId || "org-apex-01",
    invitedById: actor.id,
    token,
    status: "PENDING",
    expiresAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbStore.saveInvitation(invitation);

  // Deliver invitation email
  const emailResult = await emailService.sendTeamInvitationEmail(
    normalizedEmail,
    token,
    normalizedRole,
    actor.fullName
  );

  await dbStore.recordAudit(
    actor.id,
    "TEAM_INVITATION_SENT",
    null,
    null,
    `${actor.fullName} invited ${normalizedEmail} as ${normalizedRole} (Email delivery: ${emailResult.delivered ? "Delivered" : "Queued in local outbox"})`
  );

  res.status(201).json({
    success: true,
    message: `Invitation dispatched to ${normalizedEmail} with role ${normalizedRole}.`,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    },
  });
}

export async function getInvitations(req: Request, res: Response): Promise<void> {
  const invitations = dbStore.getInvitations();
  res.json({ success: true, count: invitations.length, data: invitations });
}

export async function resendInvitation(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { id } = req.params;

  const invitation = dbStore.getInvitations().find((i) => i.id === id);
  if (!invitation) {
    res.status(404).json({ success: false, message: "Invitation not found." });
    return;
  }

  if (invitation.status !== "PENDING") {
    res.status(400).json({ success: false, message: `Cannot resend an invitation with status '${invitation.status}'.` });
    return;
  }

  // Refresh token & expiry
  invitation.token = crypto.randomBytes(32).toString("hex");
  invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  invitation.updatedAt = new Date().toISOString();
  await dbStore.saveInvitation(invitation);

  await emailService.sendTeamInvitationEmail(invitation.email, invitation.token, invitation.role, actor.fullName);

  await dbStore.recordAudit(
    actor.id,
    "TEAM_INVITATION_RESENT",
    null,
    null,
    `${actor.fullName} resent invitation to ${invitation.email}`
  );

  res.json({ success: true, message: `Invitation resent to ${invitation.email}.` });
}

export async function revokeInvitation(req: Request, res: Response): Promise<void> {
  const actor = req.user!;
  const { id } = req.params;

  const invitation = dbStore.getInvitations().find((i) => i.id === id);
  if (!invitation) {
    res.status(404).json({ success: false, message: "Invitation not found." });
    return;
  }

  invitation.status = "REVOKED";
  invitation.updatedAt = new Date().toISOString();
  await dbStore.saveInvitation(invitation);

  await dbStore.recordAudit(
    actor.id,
    "TEAM_INVITATION_REVOKED",
    null,
    null,
    `${actor.fullName} revoked invitation for ${invitation.email}`
  );

  res.json({ success: true, message: `Invitation for ${invitation.email} has been revoked.` });
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const { token, fullName, password } = req.body;

  if (!token || !fullName || !password) {
    res.status(400).json({ success: false, message: "Token, full name, and password are required." });
    return;
  }

  const invitation = dbStore.getInvitations().find((i) => i.token === token);
  if (!invitation) {
    res.status(404).json({ success: false, message: "Invalid or nonexistent invitation." });
    return;
  }

  if (invitation.status !== "PENDING") {
    res.status(400).json({ success: false, message: `This invitation has already been ${invitation.status.toLowerCase()}.` });
    return;
  }

  if (new Date() > new Date(invitation.expiresAt)) {
    invitation.status = "EXPIRED";
    await dbStore.saveInvitation(invitation);
    res.status(400).json({ success: false, message: "This invitation has expired. Please request a new invite." });
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const newUser = {
    id: `usr-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    fullName: fullName.trim(),
    email: invitation.email.toLowerCase(),
    passwordHash: bcrypt.hashSync(password, salt),
    role: invitation.role,
    organizationId: invitation.organizationId || "org-apex-01",
    department: invitation.department || "General Operations",
    status: "ACTIVE",
    emailVerified: true,
    lastLogin: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dbStore.saveUser(newUser);

  invitation.status = "ACCEPTED";
  invitation.updatedAt = new Date().toISOString();
  await dbStore.saveInvitation(invitation);

  await dbStore.recordAudit(
    newUser.id,
    "TEAM_INVITATION_ACCEPTED",
    null,
    null,
    `${newUser.fullName} accepted invitation and activated account as ${newUser.role}`
  );

  res.status(201).json({
    success: true,
    message: "Invitation accepted successfully. You may now log in.",
    user: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      role: newUser.role,
    },
  });
}
