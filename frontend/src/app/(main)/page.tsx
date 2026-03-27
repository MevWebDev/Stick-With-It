"use client";
import { useAuth } from "../lib/auth/authContext";
import RandomTask from "../components/RandomTask";

export default function Home() {
  const { user } = useAuth();

  // Function to capitalize the first letter of the username
  const capitalizeFirstLetter = (username: string | undefined) => {
    if (!username) return "";
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-geologica my-2 text-white">
          Hi {capitalizeFirstLetter(user?.username)}! 👋
        </h1>
        <p className="font-figtree text-lg">Ready for your daily task?</p>
      </div>

      <div className="w-full max-w-md">
        <RandomTask />
      </div>
    </div>
  );
}
