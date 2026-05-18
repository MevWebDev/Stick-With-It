"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { waterService } from "@/app/lib/water/waterService";

export default function WaterTracker() {
    const [currentWater, setCurrentWater] = useState(0);
    const [goal, setGoal] = useState(2000);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // ref mirrors state so interval callbacks always see the latest value
    const waterRef = useRef(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isHoldRef = useRef(false);

    useEffect(() => {
        waterService.getToday()
            .then(data => {
                waterRef.current = data.current_amount;
                setCurrentWater(data.current_amount);
                setGoal(data.daily_goal);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const saveWater = useCallback(async (amount: number) => {
        setIsSaving(true);
        try {
            await waterService.logWater(amount);
        } finally {
            setIsSaving(false);
        }
    }, []);

    function updateWater(newValue: number) {
        waterRef.current = newValue;
        setCurrentWater(newValue);
    }

    const percentage = Math.min(100, Math.round((currentWater / goal) * 100));
    const goalInLiters = (goal / 1000).toFixed(1);

    const BOTTLE_BODY_HEIGHT = 250;
    const BOTTLE_BOTTOM_Y = 290;
    const waterHeight = (BOTTLE_BODY_HEIGHT * Math.min(percentage, 100)) / 100;
    const waterY = BOTTLE_BOTTOM_Y - waterHeight;

    const handleStart = (e: React.PointerEvent<HTMLButtonElement>, amount: number) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        isHoldRef.current = false;

        timeoutRef.current = setTimeout(() => {
            isHoldRef.current = true;
            intervalRef.current = setInterval(() => {
                const newVal = Math.max(0, waterRef.current + (amount > 0 ? 1 : -1));
                updateWater(newVal);
            }, 10);
        }, 500);
    };

    const handleStop = (e: React.PointerEvent<HTMLButtonElement>, amount: number) => {
        e.preventDefault();

        try {
            e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {
            // ignorujemy
        }

        if (!timeoutRef.current && !intervalRef.current && !isHoldRef.current) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        let newVal: number;
        if (!isHoldRef.current) {
            newVal = Math.max(0, waterRef.current + amount);
        } else {
            newVal = amount > 0
                ? Math.ceil(waterRef.current / 10) * 10
                : Math.floor(waterRef.current / 10) * 10;
        }

        isHoldRef.current = false;
        updateWater(newVal);
        saveWater(newVal);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center gap-3 py-10">
                <h1 className="text-5xl font-bold mb-10 text-black dark:text-white">Water Tracker</h1>
                <p className="text-gray-400">Ładowanie...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-3 py-10">
            <div>
                <h1 className="text-5xl font-bold mb-10 text-black dark:text-white">Water Tracker</h1>
            </div>

            <div className="grid grid-cols-3 items-center justify-center w-full max-w-lg">
                <div className="flex justify-end pr-6">
                    <p className="text-xl font-bold text-center text-black dark:text-white">
                        Current: <br/> {currentWater}ml
                    </p>
                </div>

                {/* butelka svg */}
                <div className="flex justify-center relative">
                    <svg
                        width="120"
                        height="300"
                        viewBox="0 0 120 300"
                        className="drop-shadow-xl"
                    >
                        <defs>
                            <mask id="waterMask">
                                <path
                                    d="M 40 40 L 80 40 Q 110 40 110 80 L 110 260 Q 110 290 80 290 L 40 290 Q 10 290 10 260 L 10 80 Q 10 40 40 40 Z"
                                    fill="white"
                                />
                            </mask>
                        </defs>

                        {/* woda */}
                        <rect
                            x="0"
                            y={waterY}
                            width="120"
                            height={waterHeight}
                            mask="url(#waterMask)"
                            className="fill-blue-500 transition-all duration-500 ease-out"
                        />

                        {/* tekst (zmienia kolor) */}
                        <text
                            x="60"
                            y="180"
                            textAnchor="middle"
                            className={`text-3xl font-bold font-figtree transition-colors duration-300 ${percentage >= 40 ? 'fill-white' : 'fill-blue-600 dark:fill-blue-400'}`}
                            stroke={percentage >= 40 ? "black" : "none"}
                            strokeWidth={percentage >= 40 ? "1" : "0"}
                            style={{ paintOrder: "stroke" }}
                        >
                            {percentage}%
                        </text>

                        {/* kontur butelki */}
                        <path
                            d="M 40 40 L 80 40 Q 110 40 110 80 L 110 260 Q 110 290 80 290 L 40 290 Q 10 290 10 260 L 10 80 Q 10 40 40 40 Z"
                            className="stroke-black dark:stroke-white"
                            strokeWidth="8"
                            fill="none"
                        />
                        {/* kontur zakrętki */}
                        <path
                            d="M 40 40 L 40 25 Q 40 15 60 15 Q 80 15 80 25 L 80 40"
                            className="stroke-black dark:stroke-white"
                            strokeWidth="8"
                            fill="none"
                        />
                    </svg>
                </div>

                <div className="flex flex-col items-start gap-1 pl-6">
                    <button
                        onPointerDown={(e) => handleStart(e, 250)}
                        onPointerUp={(e) => handleStop(e, 250)}
                        className="text-3xl font-bold w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center text-black dark:text-white select-none active:scale-95 touch-none"
                    >
                        +
                    </button>
                    <button
                        onPointerDown={(e) => handleStart(e, -250)}
                        onPointerUp={(e) => handleStop(e, -250)}
                        className="text-3xl font-bold w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center text-black dark:text-white select-none active:scale-95 touch-none"
                    >
                        -
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 mt-5">
                <h1 className="text-3xl font-bold text-black dark:text-white">Goal: {goalInLiters}L</h1>
                <span className="text-xs text-gray-400">
                    {isSaving ? "Zapisywanie..." : "Zapisano"}
                </span>
            </div>
        </div>
    );
}
