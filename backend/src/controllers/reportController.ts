import { Request, Response } from "express";
import { dbStore } from "../services/dbStore.js";
import PDFDocument from "pdfkit";

export async function getReportData(req: Request, res: Response): Promise<void> {
  const { type = "assets" } = req.params;
  const { status, storageType } = req.query;

  let records: any[] = [];
  switch (type.toLowerCase()) {
    case "assets":
      records = dbStore.getAssets();
      if (status) records = records.filter((r) => r.status === status);
      if (storageType) records = records.filter((r) => r.storageType === storageType);
      break;
    case "wipes":
      records = dbStore.getWipeJobs();
      if (status) records = records.filter((r) => r.status === status);
      break;
    case "verifications":
      records = dbStore.getVerifications();
      if (status) records = records.filter((r) => r.status === status);
      break;
    case "certificates":
      records = dbStore.getCertificates();
      if (status) records = records.filter((r) => r.status === status);
      break;
    case "audit":
      records = dbStore.getAuditLogs();
      break;
    case "recycling":
      records = dbStore.getRecyclingApprovals();
      break;
    default:
      records = dbStore.getAssets();
  }

  res.json({
    success: true,
    reportType: type,
    generatedAt: new Date().toISOString(),
    count: records.length,
    data: records,
  });
}

export async function exportCsv(req: Request, res: Response): Promise<void> {
  const { type = "assets" } = req.params;
  let records: any[] = [];

  switch (type.toLowerCase()) {
    case "assets":
      records = dbStore.getAssets();
      break;
    case "wipes":
      records = dbStore.getWipeJobs();
      break;
    case "verifications":
      records = dbStore.getVerifications();
      break;
    case "certificates":
      records = dbStore.getCertificates();
      break;
    case "audit":
      records = dbStore.getAuditLogs();
      break;
    case "recycling":
      records = dbStore.getRecyclingApprovals();
      break;
    default:
      records = dbStore.getAssets();
  }

  if (records.length === 0) {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${type}_report.csv"`);
    res.send("No records found");
    return;
  }

  const keys = Object.keys(records[0]).filter((k) => typeof records[0][k] !== "object");
  const headerLine = keys.join(",");
  const lines = records.map((r) =>
    keys
      .map((k) => {
        const val = r[k] !== undefined && r[k] !== null ? String(r[k]) : "";
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  const csvContent = [headerLine, ...lines].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="ZEROTrace_${type.toUpperCase()}_Report_${Date.now()}.csv"`);
  res.send(csvContent);
}

export async function exportPdf(req: Request, res: Response): Promise<void> {
  const { type = "assets" } = req.params;
  const assets = dbStore.getAssets();

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  const buffers: Buffer[] = [];

  doc.on("data", (chunk) => buffers.push(chunk));
  doc.on("end", () => {
    const pdf = Buffer.concat(buffers);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ZEROTrace_${type.toUpperCase()}_Report.pdf"`);
    res.send(pdf);
  });

  // Header
  doc.rect(40, 40, 515, 60).fill("#0a1628");
  doc.fillColor("#22d3ee").fontSize(20).font("Helvetica-Bold").text("ZEROTrace AI", 55, 55);
  doc.fillColor("#94a3b8").fontSize(10).font("Helvetica").text("Enterprise Compliance & Sanitization Report", 55, 80);
  doc.fillColor("#ffffff").fontSize(11).font("Helvetica-Bold").text(`${type.toUpperCase()} SUMMARY`, 360, 65, { align: "right" });

  doc.moveDown(4);
  doc.fillColor("#0f172a").fontSize(12).font("Helvetica-Bold").text(`Report Type: ${type.toUpperCase()}`, 40, 120);
  doc.fillColor("#64748b").fontSize(9).font("Helvetica").text(`Generated: ${new Date().toUTCString()} • Total Records: ${assets.length}`, 40, 138);

  let y = 165;
  doc.rect(40, y, 515, 20).fill("#f1f5f9");
  doc.fillColor("#1e293b").fontSize(9).font("Helvetica-Bold").text("Asset ID", 50, y + 5);
  doc.text("Model", 140, y + 5);
  doc.text("Storage", 260, y + 5);
  doc.text("Status", 370, y + 5);
  doc.text("Date", 460, y + 5);

  y += 24;
  assets.slice(0, 20).forEach((a) => {
    doc.fillColor("#0f172a").fontSize(8).font("Helvetica").text(a.assetId, 50, y);
    doc.text(`${a.manufacturer} ${a.model}`.slice(0, 22), 140, y);
    doc.text(`${a.storageType} (${a.storageCapacity}GB)`, 260, y);
    doc.text(a.status, 370, y);
    doc.text(new Date(a.createdAt).toLocaleDateString(), 460, y);
    y += 18;
  });

  doc.end();
}
