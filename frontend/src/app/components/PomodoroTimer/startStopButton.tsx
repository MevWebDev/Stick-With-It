export default function StartStopButton({
  onStart,
  onStop,
  onReset,
  timerStatus,
}: {
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  timerStatus: "idle" | "running" | "paused";
}) {
  return (
    <>
      {timerStatus === "running" && (
        <button
          className="text-4xl mt-[3vh] font-semibold tracking-wide rounded-lg text-[#bf2424] hover:text-[#9c1e1e] text-shadow-lg"
          onClick={onStop}
        >
          Pause
        </button>
      )}

      {timerStatus === "idle" && (
        <button
          className="text-4xl font-semibold tracking-wide rounded-lg text-gray-600 hover:text-black text-shadow-lg"
          onClick={onStart}
        >
          Start!
        </button>
      )}

      {timerStatus === "paused" && (
        <div className="mt-[1vh] flex flex-col">
          <button
            className="text-4xl font-semibold tracking-wide rounded-lg text-[#677381] hover:text-black text-shadow-lg"
            onClick={onStart}
          >
            Resume
          </button>

          <button
            className="text-2xl mt-[1vh] tracking-wide rounded-lg text-[#677381] hover:text-black"
            onClick={onReset}
          >
            Reset
          </button>
        </div>
      )}
    </>
  );
}
