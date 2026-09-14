// Single source of truth for a form field's validation error message —
// found independently re-implemented (with three slightly different visual
// treatments) across ScorecardForm, CreateAlertForm, InviteMemberSection,
// and the talent profile form's Basics/About/WorkExperience/Highlight
// sections. Matches TextField.tsx's built-in error styling, the most
// accessible of the pre-existing versions (role="alert" so screen readers
// announce it as soon as it appears).
export const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p className="mt-1 text-[12px] text-red-600" role="alert">
      {message}
    </p>
  ) : null;
