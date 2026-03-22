import { getIndex } from "@/lib/blob-db";
import UploadForm from "@/components/UploadForm";
import SkillCard from "@/components/SkillCard";

export const dynamic = "force-dynamic";

export default async function Home() {
  const skills = await getIndex();

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          Skills.md Database
        </h1>
        <p className="text-gray-400 mt-2">
          Upload your skills.md file and get it analyzed for safety by Claude
          Sonnet 4.6. Browse community-submitted skill files below.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4">Upload a Skill File</h2>
        <UploadForm />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">
          Submitted Skills{" "}
          <span className="text-gray-500 font-normal">({skills.length})</span>
        </h2>

        {skills.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No skills uploaded yet. Be the first!
          </p>
        ) : (
          <div className="space-y-3">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
