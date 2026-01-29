"use client";
import { useState, useEffect } from "react";
import HabitCard from "./HabitCard";
import { habitService, Habit } from "../../lib/habits/habitService";
import { FaPlus } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import { useToast } from "../../lib/toast/ToastContext";

// defaultowe taski
const availableHabitTemplates = [
  { name: "Drink 2L", icon_slug: "drink-2l" },
  { name: "Read", icon_slug: "read" },
  { name: "Exercise", icon_slug: "exercise" },
  { name: "Pray", icon_slug: "pray" },
  { name: "Sleep", icon_slug: "sleep" },
  { name: "No Alcohol", icon_slug: "no-alcohol" },
  { name: "No Weed", icon_slug: "no-weed" },
  { name: "Igloo", icon_slug: "igloo" },
  { name: "Smile", icon_slug: "smile" },
  { name: "Shower", icon_slug: "shower" },
];

export default function HabitTracker() {
  const [myTrackedHabits, setMyTrackedHabits] = useState<Habit[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [customHabitName, setCustomHabitName] = useState("");
  const [customHabitEmoji, setCustomHabitEmoji] = useState("✨");
  const [inputMode, setInputMode] = useState<"template" | "custom">("template");
  const [isLoading, setIsLoading] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [is_custom, setIs_custom] = useState(false);
  const { showXpToast, showBadgeToast } = useToast();

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const habits = await habitService.getHabits();
      setMyTrackedHabits(habits);
    } catch (error) {
      console.error("Failed to load habits:", error);
    }
  };

  const handleHabitClick = async (id: number) => {
    const habit = myTrackedHabits.find((h) => h.id === id);
    if (!habit) return;

    const originalHabits = [...myTrackedHabits];
    const isCompleting = !habit.completed_today;

    setMyTrackedHabits((current) =>
      current.map((h) => {
        if (h.id === id) {
          return {
            ...h,
            completed_today: isCompleting,
            current_streak: isCompleting
              ? h.current_streak + 1
              : Math.max(0, h.current_streak - 1),
          };
        }
        return h;
      }),
    );

    try {
      let response;
      if (isCompleting) {
        response = await habitService.checkHabit(id);

        // Show XP toast
        if (response.xp_earned && response.xp_earned > 0) {
          showXpToast(response.xp_earned, "Habit Complete!");
        }

        // Show badge toasts
        if (response.new_badges && response.new_badges.length > 0) {
          response.new_badges.forEach((badge, index) => {
            setTimeout(
              () => {
                showBadgeToast({
                  icon: badge.icon,
                  title: badge.title,
                  rarity: badge.rarity,
                });
              },
              (index + 1) * 600,
            );
          });
        }
      } else {
        response = await habitService.uncheckHabit(id);
      }

      // Update with actual server data
      setMyTrackedHabits((current) =>
        current.map((h) => {
          if (h.id === id) {
            return {
              ...h,
              completed_today: response.completed_today,
              current_streak: response.streak,
            };
          }
          return h;
        }),
      );
    } catch (error) {
      console.error("Failed to toggle habit:", error);
      setMyTrackedHabits(originalHabits);
    }
  };

  const addHabit = async () => {
    let name = "";
    let icon_slug = "";
    let is_custom = false;

    if (inputMode === "custom") {
      if (!customHabitName.trim()) return;
      name = customHabitName.trim();
      icon_slug = customHabitEmoji.trim() || "✨";
      is_custom = true;
    } else {
      const template = availableHabitTemplates[selectedTemplateIndex];
      if (!template) return;
      name = template.name;
      icon_slug = template.icon_slug;
      is_custom = false;
    }

    if (myTrackedHabits.some((h) => h.name === name)) {
      alert("You are already tracking this habit!");
      return;
    }

    setIsLoading(true);
    try {
      const newHabit = await habitService.createHabit({
        name,
        icon_slug,
        is_custom,
      });
      setMyTrackedHabits([...myTrackedHabits, newHabit]);
      setIsModalOpen(false);
      setCustomHabitName("");
      setCustomHabitEmoji("✨");
    } catch (error) {
      console.error("Failed to create habit:", error);
      alert("Failed to create habit. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableTemplates = availableHabitTemplates.filter(
    (t) => !myTrackedHabits.some((h) => h.name === t.name),
  );

  return (
    <div className="flex flex-col items-center p-6">
      <h1 className="text-5xl font-bold mb-10 dark:text-slate-400">
        Habit Tracker
      </h1>

      {/* nawyki */}
      <div className="grid grid-cols-2 gap-6">
        {myTrackedHabits.map((h) => (
          <HabitCard key={h.id} habit={h} onHabitClick={handleHabitClick} />
        ))}

        {/* Div z PLUSEM + */}
        <div
          onClick={() => {
            if (availableTemplates.length > 0) {
              // Find index in original array to set selected correctly
              const firstAvailable = availableTemplates[0];
              const index = availableHabitTemplates.findIndex(
                (t) => t.name === firstAvailable.name,
              );
              setSelectedTemplateIndex(index);
            }
            setIsModalOpen(true);
          }}
          className="transition-transform duration-300 bg-white rounded-2xl border-4 border-gray-700 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 hover:scale-105 dark:hover:bg-gray-700 flex flex-col items-center justify-center h-40 w-40 cursor-pointer hover:bg-gray-100 hover:scale-105"
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
        <div className="fixed inset-0 bg-white dark:bg-black dark:border-white bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-8 rounded-lg shadow-xl border-2  max-w-[330px] flex flex-col">
            <h2 className="text-2xl font-geologica font-bold mb-4">
              Add a New Habit
            </h2>

            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="template"
                  checked={inputMode === "template"}
                  onChange={() => setInputMode("template")}
                  className="accent-teal-500"
                />
                <span className="font-figtree">Template</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inputMode"
                  value="custom"
                  checked={inputMode === "custom"}
                  onChange={() => setInputMode("custom")}
                  className="accent-teal-500"
                />
                <span className="font-figtree">Custom</span>
              </label>
            </div>

            {inputMode === "template" ? (
              availableTemplates.length > 0 ? (
                <select
                  value={selectedTemplateIndex}
                  onChange={(e) =>
                    setSelectedTemplateIndex(Number(e.target.value))
                  }
                  className="w-full p-2 border rounded mb-4 border-black "
                >
                  {availableHabitTemplates.map((template, index) => {
                    const isTracked = myTrackedHabits.some(
                      (h) => h.name === template.name,
                    );
                    if (isTracked) return null;

                    return (
                      <option
                        key={index}
                        value={index}
                        className="font-figtree font-semibold rounded-md"
                      >
                        {template.name}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <p className="mb-4 text-gray-600 text-xs font-figtree">
                  You are tracking all available templates!
                </p>
              )
            ) : (
              <div className="flex gap-2 mb-4 relative">
                {isEmojiPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsEmojiPickerOpen(false)}
                    />
                    <div className="absolute top-full z-50">
                      <EmojiPicker
                        onEmojiClick={(emojiObject) => {
                          setCustomHabitEmoji(emojiObject.emoji);
                          setIsEmojiPickerOpen(false);
                        }}
                        width={300}
                        height={350}
                        skinTonesDisabled={true}
                      />
                    </div>
                  </>
                )}

                <input
                  type="text"
                  placeholder="Emoji"
                  value={customHabitEmoji}
                  readOnly
                  className="w-16 p-2 border rounded border-black font-figtree text-center text-2xl cursor-pointer hover:bg-gray-50"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                />

                <input
                  type="text"
                  placeholder="Custom habit name"
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  className="flex-1 p-2 border rounded border-black font-figtree text-xs w-20"
                />
              </div>
            )}

            <div className="flex justify-between gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className=" px-6 py-2 rounded-xl text-slate-600 font-medium font-figtree hover:bg-slate-200/50 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addHabit}
                disabled={
                  isLoading ||
                  (inputMode === "custom" && !customHabitName) ||
                  (inputMode === "template" && availableTemplates.length === 0)
                }
                className="px-6 py-2 rounded-xl font-figtree  text-white font-bold shadow-lg bg-teal-400 hover:scale-105 transition-transform  cursor-pointer duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
