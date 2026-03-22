import { put, list } from "@vercel/blob";
import { SkillEntry } from "./types";

const INDEX_NAME = "_index.json";

export async function getIndex(): Promise<SkillEntry[]> {
  const { blobs } = await list({ prefix: INDEX_NAME });
  const indexBlob = blobs.find((b) => b.pathname === INDEX_NAME);
  if (!indexBlob) return [];

  const res = await fetch(indexBlob.url);
  return res.json();
}

export async function saveIndex(entries: SkillEntry[]): Promise<void> {
  await put(INDEX_NAME, JSON.stringify(entries, null, 2), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
}

export async function addEntry(entry: SkillEntry): Promise<void> {
  const entries = await getIndex();
  entries.unshift(entry);
  await saveIndex(entries);
}

export async function updateEntry(
  id: string,
  updates: Partial<SkillEntry>
): Promise<void> {
  const entries = await getIndex();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx !== -1) {
    entries[idx] = { ...entries[idx], ...updates };
    await saveIndex(entries);
  }
}
