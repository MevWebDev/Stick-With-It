"use client";

import { IoIosSettings } from "react-icons/io";
import { FaUser } from "react-icons/fa";
import Streak from "./Streak";
import { useRouter } from "next/navigation";

export default function Topbar() {
  const router = useRouter();

  return (
    <div className="flex justify-between items-center gap-6 p-8 text-3xl ">
      <button
        onClick={() => {
          router.push("/profile");
        }}
      >
        <FaUser />
      </button>
      <Streak />
      <button onClick={() => {}}>
        <IoIosSettings />
      </button>
    </div>
  );
}
