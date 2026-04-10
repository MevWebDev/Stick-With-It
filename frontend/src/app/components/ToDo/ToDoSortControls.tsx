import React from "react";
import { SortDirection, SortKey } from "./ToDoUtils";

type Props = {
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSortKeyChange: (value: SortKey) => void;
  onSortDirectionChange: (value: SortDirection) => void;
};

export default function ToDoSortControls({
  sortKey,
  sortDirection,
  onSortKeyChange,
  onSortDirectionChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm">Sort by</span>
        <select
          value={sortKey}
          onChange={(event) => {
            onSortKeyChange(event.target.value as SortKey);
          }}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:bg-[#3b3b3f] dark:text-white dark:border-gray-900"
        >
          <option value="title">Title</option>
          <option value="created">Created</option>
          <option value="deadline">Deadline</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Order</span>
        <select
          value={sortDirection}
          onChange={(event) => {
            onSortDirectionChange(event.target.value as SortDirection);
          }}
          className="rounded border border-gray-300 px-2 py-1 text-sm dark:bg-[#3b3b3f] dark:text-white dark:border-gray-900"
        >
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>
  );
}
