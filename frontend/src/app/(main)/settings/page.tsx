"use client";
import { useAuth } from "@/app/lib/auth/authContext";
import { authService } from "@/app/lib/auth/authService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ChangeSettingPopup from "@/app/components/ChangeSettingPopup";
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
} from "react-icons/fa";
import { IoIosSettings } from "react-icons/io";
import { motion } from "framer-motion";

function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [openPopup, setOpenPopup] = useState(false);
  const [setting, setSetting] = useState("username");

  const closePopup = () => setOpenPopup(false);

  const openSetting = (type: string) => {
    setSetting(type);
    setOpenPopup(true);
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

  return (
    <>
      {openPopup && (
        <ChangeSettingPopup
          setting={setting}
          onSubmit={async (value) => {
            try {
              let response;
              if (setting === "password") {
                response = await authService.changePassword(
                  value as ChangePasswordCredentials,
                );
              } else if (setting === "email") {
                response = await authService.changeEmail(
                  value as ChangeEmailCredentials,
                );
              } else if (setting === "username") {
                response = await authService.changeUsername(
                  value as ChangeUsernameCredentials,
                );
              } else if (setting === "avatar") {
                closePopup();
                return;
              }

              if (response && response.success) {
                closePopup();
                if (setting !== "password") {
                  window.location.reload();
                }
              } else if (response) {
                // Handle error without toast (maybe console or simple alert if needed, but keeping it clean as per user edit)
                console.error(
                  "Failed to update setting:",
                  response.errors || response.message,
                );
              }
            } catch (error: unknown) {
              console.error(error);
            }
          }}
          onClose={closePopup}
        />
      )}

      <div className=" bg-gray-50">
        <motion.div
          className="px-4 py-6 space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Account Section */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Account
            </h2>
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              variants={itemVariants}
            >
              <SettingItem
                icon={<FaUser />}
                label="Username"
                value={user?.username}
                onClick={() => openSetting("username")}
                // className="rounded-none"
              />
              <SettingItem
                icon={<FaEnvelope />}
                label="Email"
                value={user?.email}
                onClick={() => openSetting("email")}
                // className="rounded-none"
              />
              <SettingItem
                icon={<FaLock />}
                label="Password"
                onClick={() => openSetting("password")}
                // className="rounded-none"
              />
              <SettingItem
                icon={<FaCamera />}
                label="Avatar"
                last={true}
                onClick={() => openSetting("avatar")}
              />
            </motion.div>
          </section>

          {/* General Section */}
          <section>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">
              General
            </h2>
            <motion.div
              className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              variants={itemVariants}
            >
              <SettingItem
                icon={<FaMusic />}
                label="Music"
                onClick={() => {}}
              />
              <SettingItem
                icon={<FaPalette />}
                label="Theme"
                onClick={() => {}}
              />
              <SettingItem
                icon={<FaBell />}
                label="Notifications"
                onClick={() => {}}
              />
              <SettingItem
                icon={<FaShieldAlt />}
                label="Privacy"
                last={true}
                onClick={() => {}}
              />
              <SettingItem
                icon={<IoIosSettings />}
                label="Other"
                last={true}
                onClick={() => {}}
              />
            </motion.div>
          </section>

          {/* Logout Button */}
          <motion.button
            variants={itemVariants}
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="w-full bg-white rounded-2xl p-4 shadow-sm border border-red-100 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-50 active:scale-[0.98] transition-all"
          >
            <FaSignOutAlt />
            Log Out
          </motion.button>

          <p className="text-center text-xs text-gray-400 mt-8">
            Version 1.0.0 • Stick With It
          </p>
        </motion.div>
      </div>
    </>
  );
}

function SettingItem({
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
      className={`w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 text-sm">
          {icon}
        </div>
        <div className="text-left">
          <span className="block text-gray-900 font-medium font-figtree">
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

export default SettingsPage;
