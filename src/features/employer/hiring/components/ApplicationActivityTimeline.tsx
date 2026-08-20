import { timeAgoLong } from "@/utils/time";
import type { ActivityEvent } from "@/features/employer/hiring/activity.utils";

interface ApplicationActivityTimelineProps {
  events: ActivityEvent[];
}

export const ApplicationActivityTimeline = ({
  events,
}: ApplicationActivityTimelineProps) => {
  if (events.length === 0) return null;

  return (
    <div>
      <h3 className="mb-2.5 text-[12px] font-medium uppercase tracking-wider text-neutral-400">
        Activity
      </h3>
      <ul className="space-y-2.5">
        {events.map((event) => (
          <li className="flex items-baseline gap-2.5" key={event.id}>
            <span className="h-1.5 w-1.5 flex-shrink-0 translate-y-[-2px] rounded-full bg-neutral-300" />
            <span className="min-w-0 flex-1 text-[12.5px] text-neutral-600">
              {event.label}
            </span>
            <span className="flex-shrink-0 text-[11px] text-neutral-400">
              {timeAgoLong(event.at)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
