// Single source of truth for a labeled filter-sidebar section — was defined
// byte-for-byte identically in both FilterSidebar.tsx (jobs board) and
// TalentFilterSidebar.tsx (employer talent search), the app's only two
// filter sidebars.
interface FilterGroupProps {
  label: string;
  children: React.ReactNode;
}

export const FilterGroup = ({ label, children }: FilterGroupProps) => (
  <div className="border-b border-neutral-100 py-4 last:border-0">
    <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-widest text-neutral-400">
      {label}
    </div>
    {children}
  </div>
);
