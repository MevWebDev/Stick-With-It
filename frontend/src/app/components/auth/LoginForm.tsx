"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/authContext";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaUser, FaLock } from "react-icons/fa";
import { motion } from "framer-motion";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({ username, password });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto dark:bg-[var(--color-background)]"
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 dark:bg-[var(--color-primary)] dark:border-[var(--color-border)]">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-geologica text-foreground dark:text-[var(--color-foreground)] mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-500 font-figtree dark:text-[var(--color-secondary)]">
            Please enter your details to sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
              </div>
              <input
                id="username"
                placeholder="Username or email"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree dark:bg-[var(--color-input-bg)] dark:text-[var(--color-foreground)] dark:border-[var(--color-input-border)] dark:focus:bg-[var(--color-button-bg-hover)]"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree dark:bg-[var(--color-input-bg)] dark:text-[var(--color-foreground)] dark:border-[var(--color-input-border)] dark:focus:bg-[var(--color-button-bg-hover)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors dark:text-[var(--color-secondary)] dark:hover:text-[var(--color-foreground)]"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-400 dark:text-[var(--color-secondary)]" />
                ) : (
                  <FaEye className="text-gray-400 dark:text-[var(--color-secondary)]" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg dark:bg-red-950 dark:text-red-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--color-primary)] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[var(--color-primary-dark)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--color-primary)]/20 dark:bg-[var(--color-button-bg)] dark:text-[var(--color-button-text)] dark:hover:bg-[var(--color-button-bg-hover)]"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <p className="text-center mt-6 text-gray-500 font-figtree dark:text-[var(--color-secondary)]">
        Don't have an account?{" "}
        <button
          onClick={() => router.push("/register")}
          className="text-[var(--color-secondary)] dark:text-[var(--color-foreground)] font-bold hover:underline"
        >
          Sign up
        </button>
      </p>
    </motion.div>
  );
}

// Helper to handle AnimatePresence import which might be missing in top imports
import { AnimatePresence } from "framer-motion";
