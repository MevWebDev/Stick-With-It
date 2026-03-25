"use client";
import { useAuth } from "@/app/lib/auth/authContext";
import { authService } from "@/app/lib/auth/authService";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import {
  ChangeEmailCredentials,
  ChangePasswordCredentials,
  ChangeUsernameCredentials,
} from "@/app/lib/auth/types";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaCamera,
  FaMusic,
  FaPalette,
  FaBell,
  FaShieldAlt,
  FaSignOutAlt,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { useTheme } from "next-themes";
import { IoIosSettings } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const [expandedSetting, setExpandedSetting] = useState<string | null>(null);

  const toggleSetting = (setting: string) => {
    if (expandedSetting === setting) {
      setExpandedSetting(null);
    } else {
      setExpandedSetting(setting);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleUpdate = async (settingType: string, data: any) => {
    try {
      let response;
      if (settingType === "password") {
        response = await authService.changePassword(
          data as ChangePasswordCredentials,
        );
      } else if (settingType === "email") {
        response = await authService.changeEmail(
          data as ChangeEmailCredentials,
        );
      } else if (settingType === "username") {
        response = await authService.changeUsername(
          data as ChangeUsernameCredentials,
        );
      } else if (settingType === "avatar") {
        setExpandedSetting(null);
        return true;
      }

      if (response && response.success) {
        setExpandedSetting(null);
        if (settingType !== "password") {
          window.location.reload();
        }
        return true;
      } else if (response) {
        return (
          response.errors ||
          response.errors ||
          response.message ||
          "Failed to update setting"
        );
      }
    } catch (error: any) {
      console.error(error);
      return error.message || "An error occurred";
    }
    return false;
  };

  return (
    <div className="">
      <motion.div
        className="px-4 py-6 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Account Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-500 dark:text-gray-200 uppercase tracking-wider mb-3 px-2">
            Account
          </h2>
          <motion.div
            className="rounded-2xl shadow-sm border text-gray-500 border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-black"
            variants={itemVariants}
          >
            <ExpandableSettingItem
              icon={<FaUser />}
              label="Username"
              value={user?.username}
              isExpanded={expandedSetting === "username"}
              onToggle={() => toggleSetting("username")}
            >
              <SettingForm
                settingType="username"
                onSubmit={(data) => handleUpdate("username", data)}
              />
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaEnvelope />}
              label="Email"
              value={user?.email}
              isExpanded={expandedSetting === "email"}
              onToggle={() => toggleSetting("email")}
            >
              <SettingForm
                settingType="email"
                onSubmit={(data) => handleUpdate("email", data)}
              />
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaLock />}
              label="Password"
              isExpanded={expandedSetting === "password"}
              onToggle={() => toggleSetting("password")}
            >
              <SettingForm
                settingType="password"
                onSubmit={(data) => handleUpdate("password", data)}
              />
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaCamera />}
              label="Avatar"
              last={true}
              isExpanded={expandedSetting === "avatar"}
              onToggle={() => toggleSetting("avatar")}
            >
              <SettingForm
                settingType="avatar"
                onSubmit={(data) => handleUpdate("avatar", data)}
              />
            </ExpandableSettingItem>
          </motion.div>
        </section>

        {/* General Section */}
        <section>
          <h2 className="text-sm font-bold text-gray-200 uppercase tracking-wider mb-3 px-2">
            General
          </h2>
          <motion.div
            className="rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-black"
            variants={itemVariants}
          >
            <ExpandableSettingItem
              icon={<FaMusic />}
              label="Music"
              isExpanded={expandedSetting === "music"}
              onToggle={() => toggleSetting("music")}
            >
              <div className="pt-2 w-full space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent dark:border-gray-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Background Harmony
                  </span>
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center p-1 justify-start cursor-pointer transition-colors">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform" />
                  </div>
                </div>
                <div className="space-y-2 px-2 opacity-50 pointer-events-none">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
                    <span>Volume</span>
                    <span>50%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="w-1/2 h-full bg-secondary"></div>
                  </div>
                </div>
              </div>
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaPalette />}
              label="Theme"
              value={theme === "dark" ? "Dark" : "Light"}
              isExpanded={expandedSetting === "theme"}
              onToggle={() => toggleSetting("theme")}
            >
              <div className="pt-2 w-full space-y-3">
                <button
                  onClick={() => {
                    setTheme("light");
                    setExpandedSetting(null);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-colors ${theme === "light" ? "border-secondary bg-secondary/10 text-secondary font-bold" : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                >
                  Light Mode
                  {theme === "light" && (
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </button>
                <button
                  onClick={() => {
                    setTheme("dark");
                    setExpandedSetting(null);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-colors ${theme === "dark" ? "border-secondary bg-secondary/10 text-secondary font-bold" : "border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900"}`}
                >
                  Dark Mode
                  {theme === "dark" && (
                    <div className="w-2 h-2 rounded-full bg-secondary" />
                  )}
                </button>
              </div>
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaBell />}
              label="Notifications"
              isExpanded={expandedSetting === "notifications"}
              onToggle={() => toggleSetting("notifications")}
            >
              <div className="pt-2 w-full space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent dark:border-gray-800">
                  <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Push Notifications
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Receive alerts for reminders
                    </span>
                  </div>
                  <div className="w-12 h-6 bg-secondary rounded-full flex items-center p-1 justify-end cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-transparent dark:border-gray-800">
                  <div>
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Updates
                    </span>
                    <span className="block text-xs text-gray-500 mt-1">
                      Weekly digests & reports
                    </span>
                  </div>
                  <div className="w-12 h-6 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center p-1 justify-start cursor-pointer">
                    <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
                <p className="text-xs text-center text-gray-400 mt-2">
                  Mock preferences
                </p>
              </div>
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<FaShieldAlt />}
              label="Privacy"
              isExpanded={expandedSetting === "privacy"}
              onToggle={() => toggleSetting("privacy")}
            >
              <div className="pt-2 w-full flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-6 text-center px-2">
                  Control your data visibility and learn how we manage your
                  personal information.
                </p>
                <button className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors rounded-xl text-sm w-full font-medium flex justify-between items-center group">
                  <span>Export User Data</span>
                  <FaChevronRight className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
                </button>
                <button className="px-4 py-3 mt-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors rounded-xl text-sm w-full font-bold flex justify-center items-center">
                  Delete Account
                </button>
              </div>
            </ExpandableSettingItem>

            <ExpandableSettingItem
              icon={<IoIosSettings />}
              label="Other"
              last={true}
              isExpanded={expandedSetting === "other"}
              onToggle={() => toggleSetting("other")}
            >
              <div className="pt-2 w-full pb-2">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl">
                  <span className="block text-sm font-bold text-gray-700 dark:text-gray-200 mb-1">
                    Developer Mode
                  </span>
                  <span className="block text-xs text-gray-500">
                    Enable advanced debugging tools and experimental features.
                    (Mock)
                  </span>
                  <button className="mt-4 w-full py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed">
                    Activate
                  </button>
                </div>
              </div>
            </ExpandableSettingItem>
          </motion.div>
        </section>

        {/* Logout Button */}
        <motion.button
          variants={itemVariants}
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="w-full bg-background rounded-2xl p-4 shadow-sm border border-red-100 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 active:scale-[0.98] transition-all"
        >
          <FaSignOutAlt />
          Log Out
        </motion.button>

        <p className="text-center text-xs text-gray-400 mt-8">
          Version 1.0.0 • Stick With It
        </p>
      </motion.div>
    </div>
  );
}

function ExpandableSettingItem({
  icon,
  label,
  value,
  isExpanded,
  onToggle,
  children,
  last = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={`w-full overflow-hidden ${!last ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
            {icon}
          </div>
          <div className="text-left">
            <span className="block text-gray-900 dark:text-gray-200 font-medium font-figtree">
              {label}
            </span>
            {value && (
              <span className="block text-xs text-gray-400">{value}</span>
            )}
          </div>
        </div>
        {isExpanded ? (
          <FaChevronDown className="text-gray-300 text-xs" />
        ) : (
          <FaChevronRight className="text-gray-300 text-xs" />
        )}
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SimpleSettingItem({
  icon,
  label,
  value,
  last = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  last?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors rounded-none ${
        !last ? "border-b border-gray-100 dark:border-gray-800" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 text-sm">
          {icon}
        </div>
        <div className="text-left">
          <span className="block text-gray-900 dark:text-gray-200 font-medium font-figtree">
            {label}
          </span>
          {value && (
            <span className="block text-xs text-gray-400">{value}</span>
          )}
        </div>
      </div>
      <FaChevronRight className="text-gray-300 text-xs" />
    </button>
  );
}

function SettingForm({
  settingType,
  onSubmit,
}: {
  settingType: "username" | "email" | "password" | "avatar";
  onSubmit: (data: any) => Promise<boolean | string>;
}) {
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const commonInputProps = {
    className:
      "w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] bg-transparent text-gray-900 dark:text-white placeholder-gray-400",
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setError("");
    }
  };

  const handleSubmit = async () => {
    setError("");

    // Validation
    if (settingType === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Please enter a valid email address");
        return;
      }
      if (!currentPassword) {
        setError("Please enter your current password");
        return;
      }
    } else if (settingType === "password") {
      if (!currentPassword) {
        setError("Please enter your current password");
        return;
      }
      if (value.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (value !== confirmValue) {
        setError("Passwords do not match");
        return;
      }
    } else if (settingType === "avatar") {
      if (!file) {
        setError("Please select an image");
        return;
      }
    } else {
      // Username and others
      if (!value.trim()) {
        setError(`Please enter a valid ${settingType}`);
        return;
      }
      if (!currentPassword) {
        setError("Please enter your current password");
        return;
      }
    }

    setIsLoading(true);
    let payload;

    if (settingType === "email") {
      payload = {
        new_email: value,
        password: currentPassword,
      } as ChangeEmailCredentials;
    } else if (settingType === "password") {
      payload = {
        current_password: currentPassword,
        new_password: value,
      } as ChangePasswordCredentials;
    } else if (settingType === "username") {
      payload = {
        new_username: value,
        password: currentPassword,
      } as ChangeUsernameCredentials;
    } else {
      payload = file;
    }

    const result = await onSubmit(payload);
    setIsLoading(false);

    if (result !== true && typeof result === "string") {
      setError(result);
    } else if (result !== true && typeof result === "object") {
      // if errors object
      const errObj = result as any;
      const firstErr = Object.values(errObj)[0] as string[];
      if (firstErr && firstErr.length > 0) {
        setError(firstErr[0]);
      } else {
        setError("An error occurred");
      }
    } else {
      // success, clear form
      setValue("");
      setConfirmValue("");
      setCurrentPassword("");
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const renderInputs = () => {
    switch (settingType) {
      case "password":
        return (
          <div className="w-full space-y-3">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
              {...commonInputProps}
            />
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="New password"
              {...commonInputProps}
            />
            <input
              type="password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Confirm new password"
              {...commonInputProps}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        );
      case "avatar":
        return (
          <div className="w-full flex flex-col items-center gap-4">
            <div
              className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700 cursor-pointer hover:border-secondary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-xs p-2 text-center">
                  Click to upload
                </span>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="text-[10px] text-gray-500">
              Supported formats: JPG, PNG, GIF
            </p>
          </div>
        );
      case "email":
        return (
          <div className="w-full space-y-3">
            <input
              type="email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter new email"
              {...commonInputProps}
            />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password to confirm"
              {...commonInputProps}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        );
      default:
        return (
          <div className="w-full space-y-3">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter new ${settingType}`}
              {...commonInputProps}
            />
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password to confirm"
              {...commonInputProps}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        );
    }
  };

  return (
    <div className="pt-2 w-full">
      {renderInputs()}
      {error && (
        <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full mt-4 px-4 py-2 bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50"
      >
        {isLoading ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}

export default SettingsPage;
