"use client";
import { useAuth } from "../lib/auth/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RandomTask from "../components/RandomTask";

export default function Home() {
  const { user, logout } = useAuth();
  const router = useRouter();

  // Function to capitalize the first letter of the username
  const capitalizeFirstLetter = (username: string | undefined) => {
    if (!username) return "";
    return username.charAt(0).toUpperCase() + username.slice(1);
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-10 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-geologica my-2">
          Hi {capitalizeFirstLetter(user?.username)}! 👋
        </h1>
        <p className="text-gray-500 font-figtree text-lg">
          Ready for your daily task?
        </p>
      </div>

      <div className="w-full max-w-md">
        <RandomTask />
      </div>

      <button
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
        className="px-6 py-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors font-medium"
      >
        Logout
      </button>
    </div>
  );
}
