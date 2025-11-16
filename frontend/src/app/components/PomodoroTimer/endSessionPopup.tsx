"use client";

export default function EndSessionPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2>Session Ended!</h2>
        <button onClick={onClose} className="px-4 py-2 text-gray-600">
          Ok
        </button>
      </div>
    </div>
  );
}
