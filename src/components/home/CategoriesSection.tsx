import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";

const CATEGORIES = [
  { label: "Engineering", count: 31, color: "bg-brand-50 text-brand-700" },
  { label: "Design", count: 8, color: "bg-purple-50 text-purple-700" },
  { label: "Product", count: 5, color: "bg-blue-50 text-blue-700" },
  { label: "Data", count: 7, color: "bg-amber-50 text-amber-700" },
  { label: "Marketing", count: 4, color: "bg-rose-50 text-rose-700" },
  { label: "Operations", count: 2, color: "bg-neutral-100 text-neutral-700" },
];

export const CategoriesSection = () => (
  <section className="pb-16 [contain-intrinsic-size:auto_44rem] [content-visibility:auto]">
    <div className="mx-auto max-w-[1240px] px-6">
      <div className="mb-8">
        <Eyebrow className="mb-2">Categories</Eyebrow>
        <h2 className="text-[28px] font-semibold text-neutral-900">
          Find roles in{" "}
          <em className="font-serif" style={{ fontFamily: "var(--font-serif)" }}>
            your
          </em>{" "}
          field
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {CATEGORIES.map((cat) => (
          <Link
            className="group flex items-center justify-between rounded-12 border border-neutral-100 bg-white px-4 py-3 transition-all hover:border-neutral-200 hover:shadow-card"
            key={cat.label}
            to={`/jobs?category=${cat.label}`}
          >
            <span className="text-[13px] font-medium text-neutral-700 group-hover:text-neutral-900">
              {cat.label}
            </span>
            <span className="flex items-center gap-0.5 text-[12px] text-neutral-400">
              {cat.count}
              <ArrowRight size={11} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);
