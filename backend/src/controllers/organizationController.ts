import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function getOrganizations(req: Request, res: Response): Promise<void> {
  const orgs = dbStore.getOrganizations();
  res.json({ success: true, count: orgs.length, data: orgs });
}

export async function createOrganization(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const { name, address, contact } = req.body;

  if (!name) {
    res.status(400).json({ success: false, message: "Organization name is required." });
    return;
  }

  const newOrg = {
    id: `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    address: address || null,
    contact: contact || null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  dbStore.getOrganizations().push(newOrg);
  dbStore.saveChanges();

  dbStore.recordAudit(user.id, "ORGANIZATION_CREATED", null, null, `Created organization ${name}`);

  res.status(201).json({ success: true, data: newOrg });
}
