import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getIndex, addEntry, updateEntry } from "@/lib/blob-db";
import { analyzeSkillSafety } from "@/lib/analyze";
import { SkillEntry } from "@/lib/types";

export const maxDuration = 60;

export async function GET() {
  const entries = await getIndex();
  return NextResponse.json(entries);
}

export async function PATCH(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: "No id provided" }, { status: 400 });
  }

  const entries = await getIndex();
  const entry = entries.find((e) => e.id === id);
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const res = await fetch(entry.blobUrl);
    const content = await res.text();
    const result = await analyzeSkillSafety(content);
    await updateEntry(id, {
      safetyStatus: result.status,
      safetyReasoning: result.reasoning,
      description: result.description,
    });
    return NextResponse.json({ ...entry, ...result });
  } catch (err) {
    console.error("Re-analysis error:", err);
    await updateEntry(id, {
      safetyStatus: "error",
      safetyReasoning: "Safety analysis failed.",
    });
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const skillName = (formData.get("skillName") as string) || "Untitled Skill";
  const uploaderName = (formData.get("uploaderName") as string) || "Anonymous";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!file.name.endsWith(".md")) {
    return NextResponse.json(
      { error: "Only .md files are accepted" },
      { status: 400 }
    );
  }

  if (file.size > 100 * 1024) {
    return NextResponse.json(
      { error: "File must be under 100KB" },
      { status: 400 }
    );
  }

  const content = await file.text();
  const id = crypto.randomUUID();

  const blob = await put(`skills/${id}/${file.name}`, content, {
    access: "public",
    contentType: "text/markdown",
  });

  const entry: SkillEntry = {
    id,
    skillName,
    filename: file.name,
    description: "",
    uploaderName,
    uploadedAt: new Date().toISOString(),
    blobUrl: blob.url,
    safetyStatus: "reviewing",
    safetyReasoning: "Analysis in progress...",
  };

  await addEntry(entry);

  try {
    const result = await analyzeSkillSafety(content);
    await updateEntry(id, {
      safetyStatus: result.status,
      safetyReasoning: result.reasoning,
      description: result.description,
    });
    entry.safetyStatus = result.status;
    entry.safetyReasoning = result.reasoning;
    entry.description = result.description;
  } catch (err) {
    await updateEntry(id, {
      safetyStatus: "error",
      safetyReasoning: "Safety analysis failed. Please try again later.",
    });
    entry.safetyStatus = "error";
    entry.safetyReasoning = "Safety analysis failed.";
    console.error("Analysis error:", err);
  }

  return NextResponse.json(entry, { status: 201 });
}
