"use client";

import Image from "next/image";
import { useState, useRef } from "react";

import {
  ChangeEmailCredentials,
  ChangePasswordCredentials,
  ChangeUsernameCredentials,
} from "@/app/lib/auth/types";

interface ChangeSettingPopupProps {
  setting: string;
  onSubmit: (
    value:
      | File
      | ChangeEmailCredentials
      | ChangePasswordCredentials
      | ChangeUsernameCredentials
  ) => void;
  onClose: () => void;
}

function ChangeSettingPopup({
  setting,
  onSubmit,
  onClose,
}: ChangeSettingPopupProps) {
  const [step, setStep] = useState(1);
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleNextStep = () => {
    setError("");

    if (setting === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Please enter a valid email address");
        return;
      }
    } else if (setting === "password") {
      if (value.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (value !== confirmValue) {
        setError("Passwords do not match");
        return;
      }
    } else if (setting === "avatar") {
      if (!file) {
        setError("Please select an image");
        return;
      }
      // Avatar might not need a second step for password, typically
      // But if user wants to change generic two step "smth then password"
      // we assume password confirmation is needed for these sensitive changes.
      // However, for avatar usually it's just upload.
      // The current implementation for avatar just submits the file.
      // Let's keep it 1 step for avatar unless backend enforces password.
      onSubmit(file);
      return;
    } else {
      // Username and others
      if (!value.trim()) {
        setError(`Please enter a valid ${setting}`);
        return;
      }
    }
    setStep(2);
  };

  const handleSubmit = () => {
    setError("");
    if (!currentPassword) {
      setError("Please enter your current password");
      return;
    }

    if (setting === "email") {
      onSubmit({
        new_email: value,
        password: currentPassword,
      } as ChangeEmailCredentials);
    } else if (setting === "password") {
      onSubmit({
        current_password: currentPassword,
        new_password: value,
      } as ChangePasswordCredentials);
    } else {
      onSubmit({ [`new_${setting}`]: value, password: currentPassword } as any); // Cast to any because shape is dynamic but compatible with specific change methods in usage
    }
  };

  const renderInputs = () => {
    const commonInputProps = {
      className:
        "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]",
    };

    if (step === 2) {
      return (
        <div className="w-full mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Please enter your current password to confirm changes.
          </p>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className={commonInputProps.className}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>
      );
    }

    switch (setting) {
      case "password":
        return (
          <div className="w-full space-y-3 mb-4">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="New password"
              className={commonInputProps.className}
            />
            <input
              type="password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Confirm new password"
              className={commonInputProps.className}
              onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
            />
          </div>
        );
      case "avatar":
        return (
          <div className="w-full flex flex-col items-center gap-4 mb-6">
            <div
              className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 cursor-pointer hover:border-[var(--color-secondary)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm p-4 text-center">
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
            <p className="text-xs text-gray-500">
              Supported formats: JPG, PNG, GIF
            </p>
          </div>
        );
      case "email":
        return (
          <div className="w-full mb-4">
            <input
              type="email"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter new email"
              className={commonInputProps.className}
              onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
            />
          </div>
        );
      default:
        return (
          <div className="w-full mb-4">
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Enter new ${setting}`}
              className={commonInputProps.className}
              onKeyDown={(e) => e.key === "Enter" && handleNextStep()}
            />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-black  rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:text-gray-200 dark:hover:text-gray-400 text-2xl font-bold"
        >
          
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 capitalize dark:text-white">
          Change {setting}
        </h1>

        {renderInputs()}

        <p className="text-red-500 text-sm mb-4 text-center ">{error}</p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-300 dark:bg-primary-secondary text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          {setting !== "avatar" ? (
            <button
              onClick={step === 1 ? handleNextStep : handleSubmit}
              className="flex-1 px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              {step === 1 ? "Next" : "Save"}
            </button>
          ) : (
            <button
              onClick={() => {
                if (file) onSubmit(file);
              }}
              className="flex-1 px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChangeSettingPopup;
