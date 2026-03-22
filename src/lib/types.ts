export interface SkillEntry {
  id: string;
  skillName: string;
  filename: string;
  description: string;
  uploaderName: string;
  uploadedAt: string;
  blobUrl: string;
  safetyStatus: "safe" | "unsafe" | "reviewing" | "error";
  safetyReasoning: string;
}
