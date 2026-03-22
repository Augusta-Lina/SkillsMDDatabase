"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<string | null>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const input = folderInputRef.current;
    if (!input?.files?.length) {
      setError("Please select a folder containing a .md file.");
      return;
    }

    // Find the .md file in the uploaded folder
    const files = Array.from(input.files);
    const mdFile = files.find((f) => f.name.endsWith(".md"));
    if (!mdFile) {
      setError("No .md file found in the selected folder.");
      return;
    }

    // Extract skill name from the folder path
    // webkitRelativePath is like "my-skill/skills.md"
    const pathParts = mdFile.webkitRelativePath.split("/");
    const folderName = pathParts.length > 1 ? pathParts[0] : mdFile.name.replace(".md", "");

    setUploading(true);

    const formData = new FormData();
    formData.append("file", mdFile);
    formData.append("skillName", folderName);
    formData.append("uploaderName", (e.currentTarget.elements.namedItem("uploaderName") as HTMLInputElement)?.value || "");

    try {
      const res = await fetch("/api/skills", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Upload failed";
        try {
          const data = JSON.parse(text);
          message = data.error || message;
        } catch {
          message = text || `Server error (${res.status})`;
        }
        throw new Error(message);
      }

      e.currentTarget.reset();
      setSelectedFiles(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFolderSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) {
      setSelectedFiles(null);
      return;
    }
    const fileList = Array.from(files);
    const mdFile = fileList.find((f) => f.name.endsWith(".md"));
    const folderName = fileList[0]?.webkitRelativePath.split("/")[0] || "Unknown";
    setSelectedFiles(
      mdFile
        ? `Folder: ${folderName} (found ${mdFile.name})`
        : `Folder: ${folderName} (no .md file found)`
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-lg p-6 text-center transition-colors">
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error webkitdirectory is not in React types
          webkitdirectory=""
          directory=""
          onChange={handleFolderSelect}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700 file:cursor-pointer"
        />
        <p className="text-xs text-gray-500 mt-2">
          Select a folder containing your skills.md file. The folder name will be used as the skill name.
        </p>
        {selectedFiles && (
          <p className="text-xs text-blue-400 mt-2">{selectedFiles}</p>
        )}
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          name="uploaderName"
          placeholder="Your name (optional)"
          className="flex-1 bg-gray-900 border border-gray-700 rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          disabled={uploading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium rounded-md transition-colors"
        >
          {uploading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}
    </form>
  );
}
