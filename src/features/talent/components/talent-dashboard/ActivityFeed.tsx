import { Bell, Bookmark, User } from "lucide-react";
import { cn } from "@/utils/cn";

// Static placeholder feed — no activity/notifications backend exists yet.
// Mirrors the remotesea design reference 1:1 pending a real activity log.
const FEED = [
  {
    kind: "amber",
    body: (
      <>
        Canva moved your application to the <strong>final round</strong>.
        Schedule with their hiring team.
      </>
    ),
    time: "2h ago",
  },
  {
    kind: "brand",
    body: (
      <>
        Finch Labs viewed your profile. <strong>4 views this week.</strong>
      </>
    ),
    time: "yesterday",
  },
  {
    kind: "plain",
    body: (
      <>
        3 new jobs matched <strong>Senior Frontend, SG hours</strong>.
      </>
    ),
    time: "2d ago",
  },
  {
    kind: "brand",
    body: (
      <>
        You added <strong>Postgres</strong> and <strong>WebGL</strong> to your
        skills.
      </>
    ),
    time: "3d ago",
  },
  {
    kind: "plain",
    body: (
      <>
        Stripe reached out about <strong>Support Engineer — APAC</strong>.
      </>
    ),
    time: "5d ago",
  },
] as const;

const BULLET_CLS = {
  amber: "bg-amber-50 text-amber-600 border border-amber-100",
  brand: "bg-brand-50 text-brand-600 border border-brand-100",
  plain: "bg-neutral-100 text-neutral-400",
};

export const ActivityFeed = () => (
  <div className="overflow-hidden rounded-16 border border-neutral-100 bg-white shadow-card">
    <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
      <h3 className="text-[14px] font-semibold text-neutral-900">Activity</h3>
    </div>
    <div className="p-3">
      {FEED.map((f, i) => {
        const FeedIcon =
          f.kind === "amber" ? Bell : f.kind === "brand" ? User : Bookmark;
        return (
          <div className="flex gap-3 rounded-8 px-2 py-2.5" key={i}>
            <span
              className={cn(
                "mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-full",
                BULLET_CLS[f.kind]
              )}
            >
              <FeedIcon size={10} />
            </span>
            <div>
              <p className="text-[12.5px] leading-relaxed text-neutral-700">
                {f.body}
              </p>
              <span className="text-[11px] text-neutral-400">{f.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
