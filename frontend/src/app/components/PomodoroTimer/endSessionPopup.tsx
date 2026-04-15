"use client";

type Props = {
  onContinue: () => void;
  onClose: () => void;
};

export default function EndSessionPopup({ onContinue, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center dark:bg-[var(--color-primary)] dark:text-[var(--color-foreground)] dark:border dark:border-[var(--color-border)]">
        <h2 className="font-semibold">Session Ended!</h2>
        <p>Do you want to keep going?</p>
        <div className="flex justify-between w-[80%]">
          <button
            onClick={onContinue}
            className="mt-[1vh] px-4 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition-colors dark:bg-red-700 dark:hover:bg-red-800"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="mt-[1vh] px-4 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors dark:bg-[var(--color-button-bg)] dark:text-[var(--color-button-text)] dark:hover:bg-[var(--color-button-bg-hover)]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
