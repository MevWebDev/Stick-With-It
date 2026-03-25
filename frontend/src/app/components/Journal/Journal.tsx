"use client";
import Object from "react";
import { useState, useEffect } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { format, isToday, isTomorrow, isYesterday } from "date-fns";
import { pl } from "date-fns/locale";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { FaCalendarAlt } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";

export default function Journal() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [noteContent, setNoteContent] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load from localStorage on date change
  useEffect(() => {
    if (!mounted) return;
    const key = `journal_note_${format(selectedDate, "yyyy-MM-dd")}`;
    const savedNote = localStorage.getItem(key);
    setNoteContent(savedNote || "");
  }, [selectedDate, mounted]);

  // Handle autosave
  useEffect(() => {
    if (!mounted) return;
    const timer = setTimeout(() => {
      const key = `journal_note_${format(selectedDate, "yyyy-MM-dd")}`;
      if (noteContent) {
        localStorage.setItem(key, noteContent);
      } else {
        localStorage.removeItem(key); // clear if empty
      }
      setIsSaving(false);
    }, 1000); // 1s debounce

    setIsSaving(true);
    return () => clearTimeout(timer);
  }, [noteContent, selectedDate, mounted]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setIsCalendarOpen(false);
    }
  };

  const getDayLabel = (date: Date) => {
    if (isToday(date)) return "Dzisiaj";
    if (isYesterday(date)) return "Wczoraj";
    if (isTomorrow(date)) return "Jutro";
    return format(date, "EEEE", { locale: pl }); // np. "środa"
  };

  const formattedDate = format(selectedDate, "d MMMM yyyy", { locale: pl });

  // Custom styles for tailwind react-day-picker
  const css = `
    .rdp {
      --rdp-color-focus-dark: var(--color-secondary);
      --rdp-color-focus-light: var(--color-secondary);
      --rdp-color-focus: var(--color-secondary);
      --rdp-accent-color: var(--color-secondary);
      --rdp-background-color-dark: transparent;
      --rdp-background-color-light: transparent;
      --rdp-outline: 2px solid var(--rdp-accent-color);
      --rdp-outline-selected: 2px solid var(--rdp-accent-color);
      margin: 0;
    }
    .rdp-day_selected, .rdp-day_selected:focus-visible, .rdp-day_selected:hover {
      background-color: var(--color-secondary);
      color: white;
    }
    .rdp-day_today {
      font-weight: bold;
      color: var(--color-secondary);
    }
    .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: rgba(0,0,0,0.05);
    }
    .dark .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: rgba(255,255,255,0.1);
    }
  `;

  if (!mounted) return null; // Uniknięcie hydration mismatch

  return (
    <div className="flex flex-col flex-1 h-full bg-white dark:bg-black rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 relative w-full overflow-hidden">
      <style>{css}</style>

      {/* HEADER */}
      <header className="px-8 py-8 flex items-center justify-between z-10 border-b border-gray-50 dark:border-gray-900">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white capitalize">
            {getDayLabel(selectedDate)}
          </h1>
          <p className="text-sm font-medium text-gray-500 capitalize mt-1">
            {formattedDate}
          </p>
        </div>

        <button
          onClick={() => setIsCalendarOpen(true)}
          className="ml-4 border-none flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-gray-600 dark:text-gray-300"
        >
          <FaCalendarAlt
            size={24}
            style={{ color: "var(--color-secondary, currentColor)" }}
          />
        </button>
      </header>

      {/* TEXT AREA */}
      <main className="flex-1 px-8 py-8 flex flex-col w-full relative overflow-y-auto">
        <TextareaAutosize
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="O czym dzisiaj myślisz?"
          className="w-full flex-1 resize-none bg-transparent outline-none text-gray-800 dark:text-gray-100 text-lg sm:text-xl font-figtree placeholder-gray-400 dark:placeholder-gray-600 leading-relaxed min-h-full pb-16"
        />

        {/* Autosave Indicator */}
        <div className="fixed bottom-10 right-10 md:absolute md:bottom-6 md:right-8 z-20 pointer-events-none">
          {" "}
          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium bg-white/90 dark:bg-black/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-800 opacity-80">
            {isSaving
              ? "Zapisywanie..."
              : noteContent
                ? "Zapisano lokalnie"
                : "Brak notatki"}
          </span>
        </div>
      </main>

      {/* CALENDAR POPUP */}
      <AnimatePresence>
        {isCalendarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCalendarOpen(false)}
              className="absolute inset-0 bg-black/40 dark:bg-black/60 z-20 backdrop-blur-sm rounded-2xl"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl shadow-2xl z-30 p-6 flex flex-col items-center max-h-[90%] overflow-y-auto"
            >
              <div
                className="w-12 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full mb-6 cursor-grab active:cursor-grabbing"
                onClick={() => setIsCalendarOpen(false)}
              />

              <div className="w-full flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Wybierz datę
                </h2>
                <button
                  onClick={() => setIsCalendarOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <IoIosClose size={24} />
                </button>
              </div>

              <div className="w-full flex justify-center pb-8 overflow-hidden scale-100 sm:scale-100 origin-top mt-2">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  locale={pl}
                  showOutsideDays
                  className="text-gray-800 dark:text-gray-200"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
