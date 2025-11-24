"use client";
import { useState } from "react";
import HabitCard, { type Habit } from "./HabitCard";
import {
  FaTint,
  FaRunning,
  FaBook,
  FaPlus,
  FaPray,
  FaBed,
} from "react-icons/fa";

//TO BEDZIE POBIERANE Z BAZY
const allAvailableHabits = [
  { id: 1, name: "Drink 2L", icon: <FaTint /> },
  { id: 2, name: "Read", icon: <FaBook /> },
  { id: 3, name: "Exercise", icon: <FaRunning /> },
  { id: 4, name: "Pray", icon: <FaPray /> },
  { id: 5, name: "Sleep", icon: <FaBed /> },
];

export default function HabitTracker() {
  const [myTrackedHabits, setMyTrackedHabits] = useState<Habit[]>([
    { id: 1, name: "Drink 2L", icon: <FaTint />, streak: 7 },
    { id: 2, name: "Read", icon: <FaBook />, streak: 8 },
    { id: 3, name: "Exercise", icon: <FaRunning />, streak: 3 },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<number>(
    allAvailableHabits[0].id
  );

  // fejk dodawanie + 1 jak klikniesz
  const handleHabitClick = (id: number) => {
    setMyTrackedHabits((currentHabits) =>
      currentHabits.map((habit) =>
        habit.id === id ? { ...habit, streak: habit.streak + 1 } : habit
      )
    );
  };

  // dodanie do listy trackowanych
  const addHabit = () => {
    const habitToAdd = allAvailableHabits.find((h) => h.id === selectedHabitId);
    if (habitToAdd && !myTrackedHabits.some((h) => h.id === habitToAdd.id)) {
      setMyTrackedHabits([
        ...myTrackedHabits,
        { ...habitToAdd, streak: 0, id: Date.now() },
      ]);
    }
    setIsModalOpen(false);
  };

  return (
    //jeszcze tutaj sie zastanowic jak z height zrobic czy jakis scroll czy fixed height czy moze zwieksza sie grid 3x3 np
    <div className="flex flex-col items-center bg-white p-6">
      <h1 className="text-5xl font-bold rounded-md mb-10">Habit Tracker</h1>

      {/* nawyki */}
      <div className="grid grid-cols-2 gap-6">
        {myTrackedHabits.map((h) => (
          <HabitCard key={h.id} habit={h} onHabitClick={handleHabitClick} />
        ))}

        {/* Div z PLUSEM + */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="bg-white rounded-2xl border-4 border-gray-300 flex flex-col items-center justify-center h-40 w-40 cursor-pointer hover:bg-gray-100"
        >
          <div className="text-6xl mb-2">
            <FaPlus />
          </div>
          <div className="text-sm font-medium font-figtree text-center">
            Add Habit
          </div>
        </div>
      </div>

      {/* Menu do dodawania nawyku */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center border-3 border-black rounded-md">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-4">Add a New Habit</h2>
            <select
              onChange={(e) => setSelectedHabitId(Number(e.target.value))}
              className="w-full p-2 border rounded mb-4"
            >
              {allAvailableHabits.map((habit) => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
