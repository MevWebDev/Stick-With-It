"use client";
import { useAuth } from "./lib/auth/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold font-geologica my-2">
        Hi {capitalizeFirstLetter(user?.username)}! 👋
      </h1>
      <button
        onClick={async () => {
          await logout();
          router.push("/login");
        }}
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
}
