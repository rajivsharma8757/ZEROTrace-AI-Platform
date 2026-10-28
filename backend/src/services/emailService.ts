import nodemailer, { type Transporter } from "nodemailer";
import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const OUTBOX_FILE = path.join(DATA_DIR, "email_outbox.json");

export interface OutgoingEmailRecord {
  id: string;
  to: string;
  subject: string;
  token?: string;
  link: string;
  type: "PASSWORD_RESET" | "EMAIL_VERIFICATION" | "TEAM_INVITATION";
  deliveredViaSmtp: boolean;
  sentAt: string;
}

class EmailService {
  private transporter: Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initTransporter();
  }

  public initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
      });
      this.isConfigured = true;
    } else {
      this.transporter = null;
      this.isConfigured = false;
    }
  }

  public isSmtpAvailable(): boolean {
    return this.isConfigured;
  }

  private recordToOutbox(record: OutgoingEmailRecord) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      let records: OutgoingEmailRecord[] = [];
      if (fs.existsSync(OUTBOX_FILE)) {
        records = JSON.parse(fs.readFileSync(OUTBOX_FILE, "utf-8"));
      }
      records.unshift(record);
      // Keep last 100 emails in outbox
      fs.writeFileSync(OUTBOX_FILE, JSON.stringify(records.slice(0, 100), null, 2), "utf-8");
    } catch (err) {
      console.warn("Failed to record email to outbox file:", err);
    }
  }

  public getOutbox(): OutgoingEmailRecord[] {
    try {
      if (fs.existsSync(OUTBOX_FILE)) {
        return JSON.parse(fs.readFileSync(OUTBOX_FILE, "utf-8"));
      }
    } catch {}
    return [];
  }

  public async sendPasswordResetEmail(email: string, token: string): Promise<{ success: boolean; delivered: boolean; error?: string }> {
    const appUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const from = process.env.SMTP_FROM || '"ZEROTrace AI Security" <security@zerotrace.ai>';
    const subject = "ZEROTrace AI — Password Reset Request";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #06101e; color: #f1f5f9; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
        <div style="display: flex; align-items: center; margin-bottom: 24px;">
          <div style="width: 36px; height: 36px; background: linear-gradient(135deg, #22d3ee, #10b981); border-radius: 8px; margin-right: 12px;"></div>
          <h2 style="margin: 0; font-size: 20px; color: #ffffff;">ZEROTrace AI Security</h2>
        </div>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
          A password reset was requested for your account. Click the button below to establish a new password. This single-use link expires in 1 hour.
        </p>
        <div style="margin: 28px 0;">
          <a href="${resetLink}" style="display: inline-block; background: #06b6d4; color: #020617; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">Reset Password</a>
        </div>
        <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
          If the button does not work, copy and paste this URL into your browser:<br />
          <a href="${resetLink}" style="color: #38bdf8;">${resetLink}</a>
        </p>
        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="font-size: 11px; color: #64748b; margin: 0;">
          If you did not request this, please ignore this email. Your password remains safe.
        </p>
      </div>
    `;

    const record: OutgoingEmailRecord = {
      id: `mail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      to: email,
      subject,
      token,
      link: resetLink,
      type: "PASSWORD_RESET",
      deliveredViaSmtp: this.isConfigured,
      sentAt: new Date().toISOString(),
    };

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from,
          to: email,
          subject,
          html,
        });
        this.recordToOutbox(record);
        return { success: true, delivered: true };
      } catch (err: any) {
        console.error("SMTP Delivery Failed for password reset:", err.message);
        return { success: false, delivered: false, error: "SMTP delivery failed. Check mail server configuration." };
      }
    } else {
      // Local dev / test outbox record
      this.recordToOutbox(record);
      return { success: true, delivered: false };
    }
  }

  public async sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; delivered: boolean; error?: string }> {
    const appUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const verifyLink = `${appUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
    const from = process.env.SMTP_FROM || '"ZEROTrace AI Security" <security@zerotrace.ai>';
    const subject = "ZEROTrace AI — Verify Your Email Address";

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #06101e; color: #f1f5f9; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">Welcome to ZEROTrace AI</h2>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
          Thank you for registering. Please verify your email address to activate your account.
        </p>
        <div style="margin: 28px 0;">
          <a href="${verifyLink}" style="display: inline-block; background: #06b6d4; color: #020617; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">Verify Account</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Link: <a href="${verifyLink}" style="color: #38bdf8;">${verifyLink}</a>
        </p>
      </div>
    `;

    const record: OutgoingEmailRecord = {
      id: `mail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      to: email,
      subject,
      token,
      link: verifyLink,
      type: "EMAIL_VERIFICATION",
      deliveredViaSmtp: this.isConfigured,
      sentAt: new Date().toISOString(),
    };

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({ from, to: email, subject, html });
        this.recordToOutbox(record);
        return { success: true, delivered: true };
      } catch (err: any) {
        console.error("SMTP Delivery Failed for verification:", err.message);
        return { success: false, delivered: false, error: "SMTP delivery failed. Check mail server configuration." };
      }
    } else {
      this.recordToOutbox(record);
      return { success: true, delivered: false };
    }
  }

  public async sendTeamInvitationEmail(
    email: string,
    token: string,
    role: string,
    invitedByName: string
  ): Promise<{ success: boolean; delivered: boolean; error?: string }> {
    const appUrl = process.env.FRONTEND_URL || "http://localhost:8081";
    const inviteLink = `${appUrl}/accept-invitation?token=${token}`;
    const from = process.env.SMTP_FROM || '"ZEROTrace AI Team" <invitations@zerotrace.ai>';
    const subject = `ZEROTrace AI — You've been invited as ${role}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #06101e; color: #f1f5f9; padding: 32px; border-radius: 12px; border: 1px solid #1e293b;">
        <h2 style="margin: 0 0 16px; font-size: 20px; color: #ffffff;">Team Invitation — ZEROTrace AI</h2>
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
          <strong>${invitedByName}</strong> has invited you to join ZEROTrace AI with the role of <strong>${role}</strong>.
        </p>
        <div style="margin: 28px 0;">
          <a href="${inviteLink}" style="display: inline-block; background: #06b6d4; color: #020617; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px;">Accept Invitation</a>
        </div>
        <p style="font-size: 12px; color: #64748b;">
          Link: <a href="${inviteLink}" style="color: #38bdf8;">${inviteLink}</a>
        </p>
        <p style="font-size: 11px; color: #64748b;">This invitation expires in 7 days.</p>
      </div>
    `;

    const record: OutgoingEmailRecord = {
      id: `mail-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      to: email,
      subject,
      token,
      link: inviteLink,
      type: "TEAM_INVITATION",
      deliveredViaSmtp: this.isConfigured,
      sentAt: new Date().toISOString(),
    };

    if (this.isConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({ from, to: email, subject, html });
        this.recordToOutbox(record);
        return { success: true, delivered: true };
      } catch (err: any) {
        console.error("SMTP Delivery Failed for invitation:", err.message);
        return { success: false, delivered: false, error: "SMTP delivery failed. Check mail server configuration." };
      }
    } else {
      this.recordToOutbox(record);
      return { success: true, delivered: false };
    }
  }
}

export const emailService = new EmailService();
