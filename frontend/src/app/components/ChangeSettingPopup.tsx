"use client";

import Image from "next/image";
import { useState, useRef } from "react";

interface ChangeSettingPopupProps {
  setting: string;
  onSubmit: (value: string | File) => void;
  onClose: () => void;
}

function ChangeSettingPopup({
  setting,
  onSubmit,
  onClose,
}: ChangeSettingPopupProps) {
  const [value, setValue] = useState("");
  const [confirmValue, setConfirmValue] = useState("");
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

  const handleSubmit = () => {
    setError("");

    if (setting === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setError("Please enter a valid email address");
        return;
      }
      onSubmit(value);
    } else if (setting === "password") {
      if (value.length < 6) {
        setError("Password must be at least 6 characters long");
        return;
      }
      if (value !== confirmValue) {
        setError("Passwords do not match");
        return;
      }
      onSubmit(value);
    } else if (setting === "avatar") {
      if (!file) {
        setError("Please select an image");
        return;
      }
      onSubmit(file);
    } else {
      // Username and others
      if (!value.trim()) {
        setError(`Please enter a valid ${setting}`);
        return;
      }
      onSubmit(value);
    }
  };

  const renderInputs = () => {
    switch (setting) {
      case "password":
        return (
          <div className="w-full space-y-3 mb-4">
            <input
              type="password"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="New password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
            />
            <input
              type="password"
              value={confirmValue}
              onChange={(e) => setConfirmValue(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
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
          <input
            type="email"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter new email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        );
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={`Enter new ${setting}`}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] mb-4"
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
        >
          ×
        </button>

        <h1 className="text-xl font-bold text-gray-900 mb-6 capitalize">
          Change {setting}
        </h1>

        {renderInputs()}

        <p className="text-red-500 text-sm mb-4 text-center ">{error}</p>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[var(--color-secondary)] text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangeSettingPopup;
