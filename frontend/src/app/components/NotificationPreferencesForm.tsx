"use client";

import { useState, useEffect } from "react";
import {
  notificationPreferencesService,
  ApiNotificationPreferences,
} from "@/app/lib/pushNotifications/notificationPreferencesService";
import { FaClock, FaToggleOn, FaToggleOff, FaBell } from "react-icons/fa";

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Warsaw", label: "Warsaw (CET/CEST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
];

interface NotificationPreferencesFormProps {
  onSaved?: () => void;
}

export function NotificationPreferencesForm({
  onSaved,
}: NotificationPreferencesFormProps) {
  const [preferences, setPreferences] =
    useState<ApiNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [simulatingHabits, setSimulatingHabits] = useState(false);
  const [simulatingChallenges, setSimulatingChallenges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      setError(null);
      const prefs = await notificationPreferencesService.getPreferences();
      setPreferences(prefs);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load preferences",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      await notificationPreferencesService.updatePreferences(preferences);
      setSuccessMessage("✓ Preferences saved successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
      onSaved?.();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save preferences",
      );
    } finally {
      setSaving(false);
    }
  };

  // const handleTestNotification = async () => {
  //   try {
  //     setTestingNotification(true);
  //     setError(null);
  //     await notificationPreferencesService.sendTestNotification();
  //     setSuccessMessage("Test notification sent!");
  //     setTimeout(() => setSuccessMessage(null), 3000);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to send test notification");
  //   } finally {
  //     setTestingNotification(false);
  //   }
  // };

  // const handleSimulateHabits = async () => {
  //   try {
  //     setSimulatingHabits(true);
  //     setError(null);
  //     const result = await notificationPreferencesService.testSimulateHabitNotifications();
  //     setSuccessMessage(`Simulated: Sent ${result.notifications_sent} habit notifications`);
  //     setTimeout(() => setSuccessMessage(null), 5000);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to simulate habit notifications");
  //   } finally {
  //     setSimulatingHabits(false);
  //   }
  // };

  // const handleSimulateChallenges = async () => {
  //   try {
  //     setSimulatingChallenges(true);
  //     setError(null);
  //     const result = await notificationPreferencesService.testSimulateChallengeNotifications();
  //     setSuccessMessage(`Simulated: Sent ${result.notifications_sent} challenge notifications`);
  //     setTimeout(() => setSuccessMessage(null), 5000);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : "Failed to simulate challenge notifications");
  //   } finally {
  //     setSimulatingChallenges(false);
  //   }
  // };

  const updatePreference = (
    key: keyof ApiNotificationPreferences,
    value: any,
  ) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: value,
      });
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-foreground/60">Loading preferences...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="p-4 text-center">
        <div className="text-sm text-foreground/60">
          Failed to load preferences
        </div>
      </div>
    );
  }

  return (
    <div className="pt-2 w-full space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
          <p className="text-sm text-primary">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-secondary/10 border border-secondary/30 rounded-lg">
          <p className="text-sm text-secondary">{successMessage}</p>
        </div>
      )}

      {/* Timezone Selection */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Timezone
        </label>
        <select
          value={preferences.timezone}
          onChange={(e) => updatePreference("timezone", e.target.value)}
          className="w-full px-3 py-2 border border-secondary/40 rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      {/* Habits Notification */}
      <div className="p-3 bg-background border border-secondary/40 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Habit Reminders
            </span>
          </div>
          <button
            onClick={() =>
              updatePreference(
                "is_enabled_habits",
                !preferences.is_enabled_habits,
              )
            }
            className="text-lg transition-colors"
            title="Toggle habit notifications"
          >
            {preferences.is_enabled_habits ? (
              <FaToggleOn className="text-secondary" />
            ) : (
              <FaToggleOff className="text-foreground/30" />
            )}
          </button>
        </div>

        {preferences.is_enabled_habits && (
          <div className="flex items-center gap-2 pl-2">
            <FaClock className="text-sm text-foreground/60" />
            <input
              type="time"
              value={preferences.notification_time_habits}
              onChange={(e) =>
                updatePreference("notification_time_habits", e.target.value)
              }
              className="px-3 py-2 border border-secondary/40 rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Challenges Notification */}
      <div className="p-3 bg-background border border-secondary/40 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Challenge Reminders
            </span>
          </div>
          <button
            onClick={() =>
              updatePreference(
                "is_enabled_challenges",
                !preferences.is_enabled_challenges,
              )
            }
            className="text-lg transition-colors"
            title="Toggle challenge notifications"
          >
            {preferences.is_enabled_challenges ? (
              <FaToggleOn className="text-secondary" />
            ) : (
              <FaToggleOff className="text-foreground/30" />
            )}
          </button>
        </div>

        {preferences.is_enabled_challenges && (
          <div className="flex items-center gap-2 pl-2">
            <FaClock className="text-sm text-foreground/60" />
            <input
              type="time"
              value={preferences.notification_time_challenges}
              onChange={(e) =>
                updatePreference("notification_time_challenges", e.target.value)
              }
              className="px-3 py-2 border border-secondary/40 rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      {/* Pomodoro Notification */}
      <div className="p-3 bg-background border border-secondary/40 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              Pomodoro Notifications
            </span>
          </div>
          <button
            onClick={() =>
              updatePreference(
                "is_enabled_pomodoro",
                !preferences.is_enabled_pomodoro,
              )
            }
            className="text-lg transition-colors"
            title="Toggle pomodoro notifications"
          >
            {preferences.is_enabled_pomodoro ? (
              <FaToggleOn className="text-secondary" />
            ) : (
              <FaToggleOff className="text-foreground/30" />
            )}
          </button>
        </div>
        <p className="text-xs text-foreground/60 pl-2">
          Get notified when your Pomodoro timer completes
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving || !!successMessage}
          className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm"
        >
          {saving
            ? "Saving..."
            : successMessage
              ? successMessage
              : "Save Preferences"}
        </button>
        {/* Test button commented out - feature is now automated via Celery
        <button
          onClick={handleTestNotification}
          disabled={testingNotification}
          className="px-4 py-2 border border-secondary bg-background text-foreground rounded-lg font-medium hover:bg-secondary/10 disabled:opacity-50 transition-colors text-sm"
        >
          {testingNotification ? "Sending..." : "Test"}
        </button>
        */}
      </div>

      {/* Debug/Simulation Section - commented out for production
      <div className="border-t border-secondary/40 pt-4 mt-4">
        <div className="text-xs font-semibold text-foreground/60 uppercase tracking-wide mb-3">
          Debug & Testing
        </div>
        <div className="space-y-2">
          <button
            onClick={handleSimulateHabits}
            disabled={simulatingHabits}
            className="w-full px-4 py-2 border border-primary/40 bg-primary/5 text-foreground rounded-lg font-medium hover:bg-primary/10 disabled:opacity-50 transition-colors text-sm"
          >
            {simulatingHabits ? "Simulating..." : "Simulate Habits"}
          </button>
          <button
            onClick={handleSimulateChallenges}
            disabled={simulatingChallenges}
            className="w-full px-4 py-2 border border-secondary/40 bg-secondary/5 text-foreground rounded-lg font-medium hover:bg-secondary/10 disabled:opacity-50 transition-colors text-sm"
          >
            {simulatingChallenges ? "Simulating..." : "Simulate Challenges"}
          </button>
          <p className="text-xs text-foreground/60 text-center mt-2">
            Send test notifications to all users
          </p>
        </div>
      </div>
      */}
    </div>
  );
}
