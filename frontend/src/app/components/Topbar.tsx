"use client";

import { IoIosSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";

export default function Topbar() {

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
