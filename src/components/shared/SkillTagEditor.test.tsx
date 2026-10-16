import { useState } from "react";
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SkillTagEditor } from "./SkillTagEditor";

function Editor() {
  const [skills, setSkills] = useState<string[]>([]);
  return (
    <>
      <SkillTagEditor
        skills={skills}
        setSkills={setSkills}
        suggestions={["React", "Python", "Redis", "React Native"]}
      />
      <output data-testid="skills">{JSON.stringify(skills)}</output>
    </>
  );
}
it("S3-PB52-UI01 typed case-insensitive substring filters suggestions", async () => {
  render(<Editor />);
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "rE");
  expect(screen.getByRole("button", { name: "React" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Redis" })).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: "Python" })
  ).not.toBeInTheDocument();
});
it("S3-PB52-UI02 selecting a canonical suggestion does not also add the typed prefix", async () => {
  render(<Editor />);
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox"), "re");
  await user.click(screen.getByRole("button", { name: "React" }));
  expect(screen.getByTestId("skills")).toHaveTextContent('["React"]');
  expect(screen.getByRole("textbox")).toHaveValue("");
});
