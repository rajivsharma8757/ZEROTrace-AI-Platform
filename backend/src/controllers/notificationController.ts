import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";

export async function getNotifications(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const notifs = dbStore.getNotifications(user.id);
  res.json({ success: true, count: notifs.length, data: notifs });
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const notif = dbStore.getNotifications().find((n) => n.id === id);

  if (!notif) {
    res.status(404).json({ success: false, message: "Notification not found." });
    return;
  }

  notif.read = true;
  dbStore.saveChanges();

  res.json({ success: true, data: notif });
}

export async function markAllRead(req: Request, res: Response): Promise<void> {
  const user = req.user!;
  const notifs = dbStore.getNotifications(user.id);
  notifs.forEach((n) => (n.read = true));
  dbStore.saveChanges();

  res.json({ success: true, message: "All notifications marked as read." });
}
