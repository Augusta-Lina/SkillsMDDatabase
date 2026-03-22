import { NextRequest, NextResponse } from "next/server";
import { getIndex } from "@/lib/blob-db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const entries = await getIndex();
  const entry = entries.find((e) => e.id === id);

  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = await fetch(entry.blobUrl);
  const content = await res.text();

  return new NextResponse(content, {
    headers: { "Content-Type": "text/markdown" },
  });
}
