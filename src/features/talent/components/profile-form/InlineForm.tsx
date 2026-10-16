import type { ReactNode } from "react";

interface InlineFormProps {
  className?: string;
  onSubmit: () => void;
  children: ReactNode;
}

// The profile page is one big <form>, and the experience / highlight editors sit
// inside it. A <form> inside a <form> is invalid HTML: in the browser the inner
// form's submit slipped past React and fired a native GET (the page reloaded to
// /profile?company=…&title=…), so "Add role" / "Add" never saved anything.
// This keeps the editors as plain containers instead: the submit button is
// type="button" and Enter inside a text field submits, like a form would.
export const InlineForm = ({
  className,
  onSubmit,
  children,
}: InlineFormProps) => (
  <div
    className={className}
    role="group"
    onKeyDown={(e) => {
      if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
        e.preventDefault();
        onSubmit();
      }
    }}
  >
    {children}
  </div>
);
