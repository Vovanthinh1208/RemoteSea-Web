import { useState } from "react";
import { createRoot } from "react-dom/client";
import { SkillTagEditor } from "@/components/shared/SkillTagEditor";
import { MatchCard } from "@/features/jobs/pages/job-detail/MatchCard";
import "@/styles/globals.css";
function QA() {
  const [skills, setSkills] = useState<string[]>([]);
  return (
    <main className="mx-auto max-w-[640px] space-y-5 px-6 py-10">
      <label htmlFor="qa-skills">Required skills</label>
      <SkillTagEditor
        id="qa-skills"
        skills={skills}
        setSkills={setSkills}
        suggestions={["React", "Redis", "Python", "React Native"]}
      />
      <output data-testid="selected">{JSON.stringify(skills)}</output>
      <MatchCard
        match={{
          score: 85,
          reasons: [],
          missingSkills: [
            {
              id: "long-skill",
              name: "Distributed systems with long Unicode descriptions – tiếng Việt",
              isRequired: true,
            },
          ],
        }}
      />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<QA />);
