import React from "react";

type Props = {
  safePage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function ToDoPagination({
  safePage,
  totalPages,
  onPrev,
  onNext,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-4 pt-2 text-sm">
      <button
        onClick={onPrev}
        className="text-lg dark:text-[var(--color-button-text)]"
        disabled={safePage === 1}
      >
        &lt;
      </button>
      <span>
        {safePage} / {totalPages}
      </span>
      <button
        onClick={onNext}
        className="text-lg dark:text-[var(--color-button-text)]"
        disabled={safePage === totalPages}
      >
        &gt;
      </button>
    </div>
  );
}
