export const DURATION_OPTIONS = [15, 30, 45, 60, 90];
export const MAX_SLOTS = 2;

export const formatSlot = (iso: string) =>
  new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

// <input type="datetime-local"> works in local time with no timezone info —
// this converts an ISO-UTC string (from the API) into the local
// "YYYY-MM-DDTHH:mm" shape that input expects as a pre-filled value.
export const toLocalInputValue = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};
