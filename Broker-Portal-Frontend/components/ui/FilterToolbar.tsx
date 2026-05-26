"use client";

import FilterDropdown from "./FilterDropdown";
import SearchInput from "./SearchInput";

interface Filter {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
}

interface FilterToolbarProps {
  search: string;
  onSearch: (value: string) => void;
  filters?: Filter[];
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export default function FilterToolbar({
  search,
  onSearch,
  filters = [],
  searchPlaceholder = "Search...",
  children,
}: FilterToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        marginBottom: "26px",
      }}
    >
      <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
        <div style={{ minWidth: "300px", maxWidth: "480px", flex: 1 }}>
          <SearchInput
            value={search}
            onChange={onSearch}
            placeholder={searchPlaceholder}
          />
        </div>
        {filters.map((filter, index) => (
          <FilterDropdown
            key={`${filter.placeholder}-${index}`}
            {...filter}
          />
        ))}
      </div>

      {children && (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {children}
        </div>
      )}
    </div>
  );
}