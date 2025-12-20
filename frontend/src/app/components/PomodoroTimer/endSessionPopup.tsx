"use client";

type Props = {
  onContinue: () => void;
  onClose: () => void;
};

export default function EndSessionPopup({ onContinue, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <h2 className="font-semibold">Session Ended!</h2>
        <p>Do you want to keep going?</p>
        <button
          onClick={onContinue}
          className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
        >
          Yes
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
