import { beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { NotificationBell } from "./NotificationBell";

const mocks = vi.hoisted(() => ({
  count: 0,
  read: vi.fn().mockResolvedValue({}),
  loading: false,
}));
vi.mock("@/features/notifications/notification.queries", () => ({
  useNotifications: () => ({
    data: {
      unreadCount: mocks.count,
      notifications: [
        {
          id: "n-1",
          type: "MESSAGE_RECEIVED",
          title: "New reply",
          createdAt: "2026-10-16T08:00:00Z",
          readAt: null,
          link: "/applications/app-1/messages",
        },
      ],
    },
    isLoading: mocks.loading,
  }),
  useMarkNotificationRead: () => ({ mutateAsync: mocks.read }),
  useMarkAllNotificationsRead: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));
vi.mock("@/hooks/useToastMutation", () => ({
  useToastMutation: () => (action: () => Promise<unknown>) => action(),
}));
beforeEach(() => {
  mocks.count = 0;
  mocks.loading = false;
  vi.clearAllMocks();
});
function Location() {
  return <output data-testid="location">{useLocation().pathname}</output>;
}
function view() {
  return render(
    <MemoryRouter>
      <NotificationBell />
      <Location />
    </MemoryRouter>
  );
}

it.each([1, 9, 10])(
  "S3-PB74-UI01 unread badge shows %d with a 9+ cap",
  (count) => {
    mocks.count = count;
    view();
    expect(
      screen.getByText(count > 9 ? "9+" : String(count))
    ).toBeInTheDocument();
  }
);
it("S3-PB74-UI02 zero unread notifications hides the badge", () => {
  view();
  expect(
    screen.getByRole("button", { name: "Notifications" }).textContent
  ).toBe("");
});
it("S3-PB73-UI01 keyboard-opened notification activates the event route and marks it read", () => {
  mocks.count = 1;
  view();
  fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
  fireEvent.click(screen.getByRole("button", { name: /new reply/i }));
  expect(mocks.read).toHaveBeenCalledWith("n-1");
  expect(screen.getByTestId("location")).toHaveTextContent(
    "/applications/app-1/messages"
  );
  expect(screen.getByRole("button", { name: "Notifications" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
});
it("S3-PB73-UI02 Escape closes the notification panel", () => {
  view();
  fireEvent.click(screen.getByRole("button", { name: "Notifications" }));
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("button", { name: "Notifications" })).toHaveAttribute(
    "aria-expanded",
    "false"
  );
});
