"use client";

import { FaTools, FaUserFriends } from "react-icons/fa";
import { MdOutlineQueryStats } from "react-icons/md";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import ToolsMenu from "./ToolsMenu";

export default function Navbar() {
  const [openTools, setOpenTools] = useState(false);
  const pathname = usePathname();


  // genialny zapis xd
  useEffect(() => {
    setOpenTools(false);
  }, [pathname]);

  return (
    <>
    <div className="flex justify-evenly items-center gap-6 p-8 text-3xl ">
      <button onClick={() => setOpenTools(!openTools)}>
        <FaTools />
      </button>
      <button>
        <MdOutlineQueryStats />
      </button>
      <button>
        <FaUserFriends />
      </button>
    </div>
    {openTools && <ToolsMenu onClose={() => setOpenTools(false)} />}
    </>
  );
}
