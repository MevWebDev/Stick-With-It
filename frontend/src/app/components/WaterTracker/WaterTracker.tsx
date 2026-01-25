"use client";
import { useState, useRef } from "react";


// potem będzie pobierane z backendu
export default function WaterTracker({ initialGoal = 2000, initialCurrent = 0 }) {
    const [currentWater, setCurrentWater] = useState(initialCurrent);
    const [goal, setGoal] = useState(initialGoal);

    // referencje do interakcji
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isHoldRef = useRef(false);


    const percentage = Math.min(100, Math.round((currentWater / goal) * 100));
    const goalInLiters = goal / 1000;

    // stałe wymiary butelki
    const BOTTLE_BODY_HEIGHT = 250; 
    const BOTTLE_BOTTOM_Y = 290;
    
    // obliczanie wysokości wody
    const waterHeight = (BOTTLE_BODY_HEIGHT * Math.min(percentage, 100)) / 100;
    const waterY = BOTTLE_BOTTOM_Y - waterHeight;


    // obsługa interakcji

    const handleStart = (e: React.PointerEvent<HTMLButtonElement>, amount: number) => {
        e.preventDefault();
        
        // blokujemy wskaźnik na przycisku
        e.currentTarget.setPointerCapture(e.pointerId);

        // czyszczenie timerów
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);

        isHoldRef.current = false;
        
        // czekamy 500ms na przytrzymanie
        timeoutRef.current = setTimeout(() => {
            isHoldRef.current = true;
            // ciągła zmiana co 1ml
            intervalRef.current = setInterval(() => {
                setCurrentWater(prev => Math.max(0, prev + (amount > 0 ? 1 : -1))); 
            }, 10);
        }, 500); 
    };

    const handleStop = (e: React.PointerEvent<HTMLButtonElement>, amount: number) => {
        e.preventDefault();
        
        try {
             e.currentTarget.releasePointerCapture(e.pointerId);
        } catch (err) {
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

        if (!isHoldRef.current) {
            // krótkie kliknięcie -> duży skok
            setCurrentWater(prev => Math.max(0, prev + amount));
        } else {
            // po przytrzymaniu -> zaokrąglanie
            setCurrentWater(prev => {
                if (amount > 0) {
                     return Math.ceil(prev / 10) * 10;
                } else {
                     return Math.floor(prev / 10) * 10;
                }
            });
        }
        
        isHoldRef.current = false;
    };

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
                         
                        className="text-3xl font-bold  w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center text-black dark:text-white select-none active:scale-95 touch-none"
                    >
                        +
                    </button>
                    <button 
                         onPointerDown={(e) => handleStart(e, -250)}
                         onPointerUp={(e) => handleStop(e, -250)}
                         
                        className="text-3xl font-bold  w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center text-black dark:text-white select-none active:scale-95 touch-none"
                    >
                        -
                    </button>
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold mt-5 text-black dark:text-white">Goal: {goalInLiters}L</h1>
            </div>
        </div>
    );
}