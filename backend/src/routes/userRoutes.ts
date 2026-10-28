import { Router } from "express";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  inviteTeamMember,
  getInvitations,
  resendInvitation,
  revokeInvitation,
  acceptInvitation,
} from "../controllers/userController.js";
import { authMiddleware, roleMiddleware } from "../middleware/auth.js";

const router = Router();

// Public invitation acceptance
router.post("/accept-invitation", acceptInvitation);

// Privileged User and Team Management
router.use(authMiddleware);
router.use(roleMiddleware(["OWNER", "ADMINISTRATOR", "ADMIN"]));

router.get("/", getUsers);
router.post("/", createUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

// Team Invitations
router.post("/invite", inviteTeamMember);
router.get("/invitations/list", getInvitations);
router.post("/invitations/:id/resend", resendInvitation);
router.delete("/invitations/:id", revokeInvitation);

export default router;
