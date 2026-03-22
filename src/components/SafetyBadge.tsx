import { SkillEntry } from "@/lib/types";

const badgeStyles: Record<SkillEntry["safetyStatus"], string> = {
  safe: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  unsafe: "bg-red-500/20 text-red-400 border-red-500/30",
  reviewing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  error: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const badgeLabels: Record<SkillEntry["safetyStatus"], string> = {
  safe: "Safe",
  unsafe: "Unsafe",
  reviewing: "Reviewing...",
  error: "Error",
};

export default function SafetyBadge({
  status,
}: {
  status: SkillEntry["safetyStatus"];
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyles[status]}`}
    >
      {badgeLabels[status]}
    </span>
  );
}
