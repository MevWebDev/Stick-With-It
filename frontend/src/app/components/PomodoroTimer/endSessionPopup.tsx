"use client";

type Props = {
  onContinue: () => void;
  onClose: () => void;
};

export default function EndSessionPopup({ onContinue, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="font-semibold">Session Ended!</h2>
        <p>Do you want to keep going?</p>
        <button onClick={onContinue} className="px-4 py-2 text-gray-600">
          Yes
        </button>
        <button onClick={onClose} className="px-4 py-2 text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}
