"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SkillEntry } from "@/lib/types";
import SafetyBadge from "./SafetyBadge";

export default function SkillCard({ skill }: { skill: SkillEntry }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reanalyzing, setReanalyzing] = useState(false);

  async function toggleExpand() {
    if (!expanded && content === null) {
      setLoading(true);
      const res = await fetch(`/api/skills/${skill.id}`);
      const text = await res.text();
      setContent(text);
      setLoading(false);
    }
    setExpanded(!expanded);
  }

  async function handleReanalyze() {
    setReanalyzing(true);
    try {
      await fetch("/api/skills", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: skill.id }),
      });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setReanalyzing(false);
    }
  }

  const isStuck = skill.safetyStatus === "reviewing" || skill.safetyStatus === "error";

  return (
    <div className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <button onClick={toggleExpand} className="text-left w-full">
            <h3 className="text-sm font-semibold text-gray-200">
              {skill.skillName}
            </h3>
            {skill.description && (
              <p className="text-xs text-gray-400 mt-1">{skill.description}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-mono">{skill.filename}</span>
              {" "}&middot; by {skill.uploaderName} &middot;{" "}
              {new Date(skill.uploadedAt).toLocaleDateString()}
            </p>
          </button>
        </div>
        <div className="flex items-center gap-2">
          {isStuck && (
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:text-gray-500"
            >
              {reanalyzing ? "Analyzing..." : "Re-analyze"}
            </button>
          )}
          <SafetyBadge status={skill.safetyStatus} />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2 italic">{skill.safetyReasoning}</p>

      {expanded && (
        <div className="mt-3 border-t border-gray-800 pt-3">
          {loading ? (
            <p className="text-xs text-gray-500">Loading content...</p>
          ) : (
            <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono bg-gray-900 rounded p-3 max-h-80 overflow-auto">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
