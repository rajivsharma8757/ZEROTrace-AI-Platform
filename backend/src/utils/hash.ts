import crypto from "crypto";

export function computeSha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function generateEventHash(
  previousHash: string,
  action: string,
  entityId: string,
  details: string,
  timestamp: string
): string {
  const payload = `${previousHash}|${action}|${entityId}|${details}|${timestamp}`;
  return `ZT-SHA256-${computeSha256(payload).slice(0, 32)}`;
}

export function generateCertificateHash(
  assetId: string,
  serialNumber: string,
  wipeMethod: string,
  verificationId: string,
  timestamp: string
): string {
  const payload = `CERT|${assetId}|${serialNumber}|${wipeMethod}|${verificationId}|${timestamp}`;
  return `ZT-CERT-${computeSha256(payload).slice(0, 32).toUpperCase()}`;
}
