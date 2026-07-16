import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AVATAR_CLOUD = [
  { l: "L", c: "#2E9B52", x: 70, y: 8, s: 80 },
  { l: "M", c: "#F59E0B", x: 200, y: 38, s: 64 },
  { l: "H", c: "#2563EB", x: 32, y: 130, s: 70 },
  { l: "K", c: "#7C3AED", x: 154, y: 158, s: 88 },
  { l: "T", c: "#1F7A3D", x: 282, y: 130, s: 56 },
  { l: "P", c: "#0EA5E9", x: 88, y: 250, s: 60 },
  { l: "Đ", c: "#B45309", x: 220, y: 268, s: 72 },
  { l: "N", c: "#5C5954", x: 322, y: 240, s: 50 },
  { l: "V", c: "#16766F", x: 24, y: 330, s: 54 },
  { l: "S", c: "#DC2626", x: 168, y: 380, s: 64 },
  { l: "B", c: "#1D4ED8", x: 290, y: 360, s: 58 },
  { l: "Q", c: "#65A30D", x: 110, y: 70, s: 50 },
];

export const CommunityHeroSection = () => (
  <section className="relative overflow-hidden border-b border-neutral-100 bg-white py-20">
    <div className="mx-auto grid max-w-[1240px] items-center gap-16 px-6 lg:grid-cols-2">
      <div>
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-100 bg-white px-3 py-1.5 text-[13px] text-neutral-500 shadow-[0_1px_2px_rgba(26,25,23,0.06)]">
          <span className="h-2 w-2 rounded-full bg-brand-600" />
          Invite-only · 500+ members from 14 cities
        </div>
        <h1 className="mb-4 text-[44px] font-semibold leading-[1.1] tracking-tight text-neutral-900 lg:text-[52px]">
          500+ remote-working Vietnamese,{" "}
          <em className="font-serif text-brand-700" style={{ fontFamily: "var(--font-serif)" }}>
            one Slack
          </em>
          .
        </h1>
        <p className="mb-8 max-w-lg text-[17px] leading-relaxed text-neutral-500">
          Engineers, designers, marketers, ops people — all working remotely for companies abroad.
          We trade offer letters, debug async culture, and meet up in person when we&apos;re in the
          same city.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button className="rounded-12 px-6" size="xl">
            Request an invite <ArrowRight size={16} />
          </Button>
          <button className="inline-flex h-[52px] items-center gap-2 rounded-12 border border-neutral-200 bg-white px-6 text-[15px] font-medium text-neutral-700 transition-colors hover:bg-neutral-50">
            Watch the tour (2 min)
          </button>
        </div>
        <p className="mt-5 text-[13px] text-neutral-400">
          Vetted by current members. We look for senior craft and good-faith participation — not
          vibes.
        </p>
      </div>

      {/* Avatar cloud */}
      <div className="hidden lg:block">
        <div className="relative h-[460px] w-[380px]">
          <svg
            aria-hidden="true"
            className="absolute inset-0 h-full w-full"
            height="460"
            width="380"
          >
            <line stroke="#E5E5E3" strokeWidth="1" x1="110" x2="232" y1="48" y2="70" />
            <line stroke="#E5E5E3" strokeWidth="1" x1="232" x2="186" y1="70" y2="200" />
            <line stroke="#E5E5E3" strokeWidth="1" x1="186" x2="68" y1="200" y2="165" />
            <line stroke="#E5E5E3" strokeWidth="1" x1="186" x2="310" y1="200" y2="160" />
            <line stroke="#E5E5E3" strokeWidth="1" x1="186" x2="252" y1="200" y2="300" />
            <line stroke="#E5E5E3" strokeWidth="1" x1="186" x2="118" y1="200" y2="280" />
          </svg>
          {AVATAR_CLOUD.map((a, i) => (
            <div
              className="absolute grid place-items-center rounded-full font-semibold text-white shadow-card"
              key={i}
              style={{
                left: a.x,
                top: a.y,
                width: a.s,
                height: a.s,
                background: a.c,
                fontSize: a.s * 0.42,
              }}
            >
              {a.l}
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);
