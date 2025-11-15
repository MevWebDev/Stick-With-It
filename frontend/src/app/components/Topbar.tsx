"use client";

import { IoIosSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import { useAuth } from "../lib/auth/authContext";

export default function Topbar() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }
  return (
    <div className="flex justify-between items-center gap-6 p-8 text-3xl ">
      <button>
        <FaUser />
      </button>
      <button>
        <IoIosSettings />
      </button>
    </div>
  );
}
