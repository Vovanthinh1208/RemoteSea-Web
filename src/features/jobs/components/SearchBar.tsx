import { Search, X } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar = ({ value, onChange }: SearchBarProps) => (
  <div className="relative mb-6 flex h-12 items-center rounded-12 border border-neutral-200 bg-white px-4 shadow-[0_1px_2px_rgba(26,25,23,0.06)] focus-within:border-brand-600 focus-within:shadow-focus">
    <Search className="flex-shrink-0 text-neutral-400" size={17} />
    <input
      aria-label="Search jobs"
      className="flex-1 bg-transparent px-3 text-sm text-neutral-900 outline-none placeholder:text-neutral-400"
      placeholder='Search by title, skill, or company — e.g. "React developer"'
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && (
      <button
        aria-label="Clear search"
        className="grid h-7 w-7 place-items-center rounded-8 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 focus-visible:shadow-focus focus-visible:outline-none"
        onClick={() => onChange("")}
      >
        <X size={14} />
      </button>
    )}
  </div>
);
