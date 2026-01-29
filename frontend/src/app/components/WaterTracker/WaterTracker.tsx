"use client";
import { useState } from "react";


//potem bedzie fetchowane z backendu >
export default function WaterTracker({ initialGoal = 2000, initialCurrent = 0 }) {
    const [currentWater, setCurrentWater] = useState(initialCurrent);
    const [goal, setGoal] = useState(initialGoal);


    const percentage = Math.min(100, Math.round((currentWater / goal) * 100));
    const goalInLiters = goal / 1000;

    return (
        <div className="flex flex-col items-center gap-3 py-10">
            <div>
                <h1 className="text-5xl font-bold mb-10">Water Tracker</h1>
            </div>

            
            <div className="grid grid-cols-3 items-center justify-center w-full max-w-lg">
                
                
                <div className="flex justify-end pr-6">
                    <p className="text-xl font-bold text-center">
                        Current: <br/> {currentWater}ml
                    </p>
                </div>

                
                {/* BUTLA */}
                <div className="flex justify-center">
                    <div className="relative h-[300px] w-[120px] border-[8px] border-black rounded-3xl overflow-hidden flex flex-col justify-end bg-white">
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <span className={`text-3xl font-bold font-figtree ${percentage > 50 ? 'text-white' : 'text-blue-600'}`}>
                                {percentage}%
                            </span>
                        </div>
                        <div 
                            style={{ height: `${percentage}%` }} 
                            className="bg-blue-500 w-full transition-all duration-500 ease-out"
                        ></div>
                    </div>
                </div>

                
                <div className="flex flex-col items-start gap-1 pl-6">

                
                    <button 
                        onClick={() => setCurrentWater(prev => prev + 250)}
                        className="text-3xl font-bold  w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center"
                    >
                        +
                    </button>
                    <button 
                        onClick={() => setCurrentWater(prev => Math.max(0, prev - 250))}
                        className="text-3xl font-bold  w-12 h-12 rounded-full hover:scale-105 transition-all duration-300 ease-out flex items-center justify-center"
                    >
                        -
                    </button>
                </div>
            </div>

            <div>
                <h1 className="text-3xl font-bold mt-5">Goal: {goalInLiters}L</h1>
            </div>
        </div>
    );
}