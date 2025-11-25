"use client";

import { IoIosSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import Streak from "./Streak";

export default function Topbar() {

  return (
    <div className="flex justify-between items-center gap-6 p-8 text-3xl ">
      <button>
        <FaUser />
      </button>
      <Streak />
      <button>
        <IoIosSettings />
      </button>
    </div>
  );
}
