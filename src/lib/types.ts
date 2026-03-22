export interface SkillEntry {
  id: string;
  filename: string;
  uploaderName: string;
  uploadedAt: string;
  blobUrl: string;
  safetyStatus: "safe" | "unsafe" | "reviewing" | "error";
  safetyReasoning: string;
}
