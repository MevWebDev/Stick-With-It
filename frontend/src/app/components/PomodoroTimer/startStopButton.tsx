export default function StartStopButton({
  onStart,
  onStop,
  isRunning,
}: {
  onStart: () => void;
  onStop: () => void;
  isRunning: boolean;
}) {
  return (
    <>
      {isRunning ? (
        <button
          className="w-full text-3xl font-semibold tracking-wide rounded-lg text-[#bf2424]"
          onClick={onStop}
        >
          Stop
        </button>
      ) : (
        <button
          className="w-full text-3xl font-semibold tracking-wide rounded-lg text-[#677381]"
          onClick={onStart}
        >
          Start!
        </button>
      )}
    </>
  );
}
