export interface DeviceAnalysisInput {
  storageType: string; // NVMe, SSD, HDD
  storageCapacity: number; // GB
  encryptionStatus: string; // Enabled, Disabled
  deviceHealth: string; // Excellent, Good, Attention
  operatingSystem: string;
  deviceType: string;
}

export interface RecommendationResult {
  recommendedMethod: string;
  securityLevel: "HIGH" | "ENHANCED" | "STANDARD";
  estimatedDurationMinutes: number;
  verificationStrategy: string;
  reason: string;
  confidenceScore: number;
  standardsCompliance: string[];
}

export function analyzeDevice(device: DeviceAnalysisInput): RecommendationResult {
  const isFlash = device.storageType === "SSD" || device.storageType === "NVMe";
  const isEncrypted = device.encryptionStatus.toLowerCase() === "enabled";
  const capacity = Number(device.storageCapacity) || 512;

  if (device.storageType === "NVMe") {
    if (isEncrypted) {
      return {
        recommendedMethod: "NIST 800-88 Purge (Cryptographic Erase)",
        securityLevel: "HIGH",
        estimatedDurationMinutes: Math.max(5, Math.ceil(capacity / 120)),
        verificationStrategy: "Cryptographic key disposition validation & sampled LBA read check",
        reason: "NVMe drive with hardware-level encryption detected. Cryptographic erase destroys encryption keys instantly rendering all stored blocks cryptographically unrecoverable.",
        confidenceScore: 96,
        standardsCompliance: ["NIST SP 800-88 Rev. 2 (Purge)", "IEEE 2883-2022", "DoD 5220.22-M (Superseded for SSD)"],
      };
    } else {
      return {
        recommendedMethod: "NIST 800-88 Purge (NVMe Format / Sanitize Block Erase)",
        securityLevel: "HIGH",
        estimatedDurationMinutes: Math.max(10, Math.ceil(capacity / 60)),
        verificationStrategy: "Full controller status check & 10% pseudo-random sector sampling",
        reason: "NVMe SSD without hardware encryption. Firmware-level block erase commands all flash blocks including over-provisioned and wear-leveled sectors.",
        confidenceScore: 92,
        standardsCompliance: ["NIST SP 800-88 Rev. 2 (Purge)", "IEEE 2883-2022"],
      };
    }
  }

  if (device.storageType === "SSD") {
    if (isEncrypted) {
      return {
        recommendedMethod: "NIST 800-88 Purge (Cryptographic Erase)",
        securityLevel: "HIGH",
        estimatedDurationMinutes: Math.max(8, Math.ceil(capacity / 90)),
        verificationStrategy: "TPM/SED key verification and sampled block validation",
        reason: "SATA/PCIe SSD with hardware encryption enabled. Cryptographic erase purges the media encryption key (MEK) with near-instant execution.",
        confidenceScore: 94,
        standardsCompliance: ["NIST SP 800-88 Rev. 2 (Purge)", "ISO/IEC 27040"],
      };
    } else {
      return {
        recommendedMethod: "NIST 800-88 Purge (ATA Enhanced Secure Erase)",
        securityLevel: "ENHANCED",
        estimatedDurationMinutes: Math.max(15, Math.ceil(capacity / 45)),
        verificationStrategy: "Drive controller firmware report & multi-pass sampled read check",
        reason: "Non-encrypted SSD. Standard multi-pass overwrite causes flash degradation; native ATA Secure Erase resets physical NAND blocks safely.",
        confidenceScore: 89,
        standardsCompliance: ["NIST SP 800-88 Rev. 2 (Purge)", "BSI GS-02"],
      };
    }
  }

  // Magnetic HDD
  const duration = Math.max(25, Math.ceil(capacity / 18));
  return {
    recommendedMethod: "NIST 800-88 Clear (Pseudo-Random Overwrite + Zero Fill)",
    securityLevel: "STANDARD",
    estimatedDurationMinutes: duration,
    verificationStrategy: "100% surface scan with sequential pattern verification across all addressable sectors",
    reason: "Magnetic storage media requires physical surface magnetic realignment. NIST Clear overwrites addressable storage locations with pseudo-random bits followed by zero-fill.",
    confidenceScore: 88,
    standardsCompliance: ["NIST SP 800-88 Rev. 2 (Clear)", "DoD 5220.22-M"],
  };
}
