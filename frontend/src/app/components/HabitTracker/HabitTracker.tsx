"use client";
import { useState, useEffect, useRef } from "react";
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

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { showXpToast, showBadgeToast } = useToast();

  //Ref for our custom dropdown
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadHabits();
  }, []);

  //Click outside listener for the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
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

        if (response.xp_earned && response.xp_earned > 0) {
          showXpToast(response.xp_earned, "Habit Complete!");
        }

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
      <h1 className="text-5xl font-bold mb-10">Habit Tracker</h1>

      {/* nawyki */}
      <div className="grid grid-cols-2 gap-6">
        {myTrackedHabits.map((h) => (
          <HabitCard key={h.id} habit={h} onHabitClick={handleHabitClick} />
        ))}

        {/* Div z PLUSEM + */}
        <div
          onClick={() => {
            if (availableTemplates.length > 0) {
              const firstAvailable = availableTemplates[0];
              const index = availableHabitTemplates.findIndex(
                (t) => t.name === firstAvailable.name,
              );
              setSelectedTemplateIndex(index);
            }
            setIsModalOpen(true);
            setIsDropdownOpen(false);
          }}
          className="transition-transform duration-300 bg-background rounded-2xl border-4 hover:scale-105 flex flex-col items-center justify-center h-40 w-40 cursor-pointer"
        >
          <div className="text-5xl mb-2">
            <FaPlus />
          </div>
          <div className="text-sm font-medium font-figtree text-center">
            Add Habit
          </div>
        </div>
      </div>

      {/* Menu do dodawania nawyku */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-50">
          <div className="p-6 rounded-2xl shadow-xl border border-foreground/20 max-w-[320px] w-full flex flex-col bg-background relative">
            <h2 className="text-2xl font-geologica font-bold mb-6 text-center">
              Add a New Habit
            </h2>

            {/* SYMMETRICAL SEGMENTED CONTROL */}
            <div className="flex w-full bg-foreground/5 p-1 rounded-lg mb-6 border border-foreground/10">
              <label
                className={`flex-1 text-center py-2 cursor-pointer rounded-md transition-all duration-200 text-sm font-figtree ${
                  inputMode === "template"
                    ? "bg-background shadow-sm text-foreground font-bold border border-foreground/10"
                    : "text-foreground/50 hover:text-foreground/80"
                }`}
              >
                <input
                  type="radio"
                  name="inputMode"
                  value="template"
                  checked={inputMode === "template"}
                  onChange={() => setInputMode("template")}
                  className="hidden"
                />
                Template
              </label>

              <label
                className={`flex-1 text-center py-2 cursor-pointer rounded-md transition-all duration-200 text-sm font-figtree ${
                  inputMode === "custom"
                    ? "bg-background shadow-sm text-foreground font-bold border border-foreground/10"
                    : "text-foreground/50 hover:text-foreground/80"
                }`}
              >
                <input
                  type="radio"
                  name="inputMode"
                  value="custom"
                  checked={inputMode === "custom"}
                  onChange={() => setInputMode("custom")}
                  className="hidden"
                />
                Custom
              </label>
            </div>

            {inputMode === "template" ? (
              availableTemplates.length > 0 ? (
                /* DROPDOWN WITH REF ATTACHED */
                <div className="relative w-full mb-6" ref={dropdownRef}>
                  <div
                    className="w-full p-3 border border-foreground/20 rounded-lg bg-background text-foreground font-figtree flex justify-between items-center cursor-pointer hover:border-foreground/50 transition-colors"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <span className="text-sm font-medium">
                      {availableHabitTemplates[selectedTemplateIndex]?.name ||
                        "Select a habit"}
                    </span>
                    <span
                      className={`text-[10px] transition-transform duration-200 ${
                        isDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </div>

                  {isDropdownOpen && (
                    <ul className="absolute z-50 w-full mt-2 bg-background border border-foreground/20 rounded-lg shadow-2xl max-h-48 overflow-y-auto py-1">
                      {availableHabitTemplates.map((template, index) => {
                        const isTracked = myTrackedHabits.some(
                          (h) => h.name === template.name,
                        );
                        if (isTracked) return null;

                        return (
                          <li
                            key={index}
                            className={`px-4 py-2 font-figtree text-sm cursor-pointer transition-colors duration-150 hover:bg-foreground/5 hover:text-foreground ${
                              selectedTemplateIndex === index
                                ? "bg-foreground/5 text-foreground font-bold"
                                : "text-foreground"
                            }`}
                            onClick={() => {
                              setSelectedTemplateIndex(index);
                              setIsDropdownOpen(false);
                            }}
                          >
                            {template.name}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              ) : (
                <p className="mb-6 text-foreground/60 text-sm text-center font-figtree w-full">
                  You are tracking all available templates!
                </p>
              )
            ) : (
              /* CUSTOM INPUTS */
              <div className="flex gap-2 w-full mb-6 relative">
                {isEmojiPickerOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsEmojiPickerOpen(false)}
                    />
                    <div className="absolute top-full left-0 z-50 mt-2">
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
                  className="w-14 p-3 border rounded-lg border-foreground/20 font-figtree text-center text-xl cursor-pointer hover:bg-foreground/5 bg-background transition-colors"
                  onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                />

                <input
                  type="text"
                  placeholder="Custom habit name..."
                  value={customHabitName}
                  onChange={(e) => setCustomHabitName(e.target.value)}
                  className="flex-1 p-3 border rounded-lg border-foreground/20 font-figtree text-sm bg-background focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            )}

            <div className="flex justify-between gap-3 w-full">
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsDropdownOpen(false);
                }}
                className="flex-1 py-3 rounded-lg border border-foreground/20 font-medium font-figtree transition-colors hover:bg-foreground/5 text-sm"
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
                className="flex-1 py-3 rounded-lg font-figtree text-background font-bold shadow-md bg-primary hover:opacity-90 transition-opacity cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
