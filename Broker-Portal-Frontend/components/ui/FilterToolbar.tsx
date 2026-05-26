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
}

export default function FilterToolbar({
  search,
  onSearch,
  filters = [],
  searchPlaceholder = "Search...",
}: FilterToolbarProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        marginBottom: "26px",
      }}
    >
      <SearchInput
        value={search}
        onChange={onSearch}
        placeholder={searchPlaceholder}
      />

      {filters.map((filter, index) => (
        <FilterDropdown
          key={`${filter.placeholder}-${index}`}
          {...filter}
        />
      ))}
    </div>
  );
}