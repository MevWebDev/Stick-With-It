"use client";

import { FaTools, FaUserFriends } from "react-icons/fa";
import { MdOutlineQueryStats } from "react-icons/md";
import { useAuth } from "../lib/auth/authContext";

export default function Navbar() {
  const { user } = useAuth();

  console.log(user);

  if (!user) {
    return null;
  }
  return (
    <div className="flex justify-evenly items-center gap-6 p-8 text-3xl ">
      <button>
        <FaTools />
      </button>
      <button>
        <MdOutlineQueryStats />
      </button>
      <button>
        <FaUserFriends />
      </button>
    </div>
  );
}
