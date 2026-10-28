import QRCode from "qrcode";

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 256,
      color: {
        dark: "#0a1628",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR code data URL", err);
    throw err;
  }
}

export async function generateQrBuffer(text: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(text, {
      errorCorrectionLevel: "H",
      margin: 1,
      width: 256,
      color: {
        dark: "#0a1628",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("Failed to generate QR buffer", err);
    throw err;
  }
}
