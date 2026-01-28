"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth/authContext";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import { authService } from "@/app/lib/auth/authService";
import { motion, AnimatePresence } from "framer-motion";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // Step 1: email & passwords, Step 2: username
  const { register, isLoading, user } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleFirstStep = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authService.checkEmail(email);
      if (response.is_taken) {
        setError("Email is already taken");
        return;
      }
    } catch (error) {
      setError(`${error}`);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Username is required");
      return;
    }

    try {
      await register({ username, email, password });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 overflow-hidden relative min-h-[500px] flex flex-col justify-center">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-geologica text-gray-900 mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 font-figtree">
            {step === 1 ? "Start your journey today" : "One last thing!"}
          </p>
        </div>

        <div className="relative">
          <AnimatePresence mode="wait" custom={step}>
            {step === 1 ? (
              <motion.form
                key="step1"
                custom={1}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleFirstStep}
                className="space-y-5"
              >
                <div className="space-y-4">
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      placeholder="Email address"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block dark:text-primary w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree"
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
                      className="block dark:text-primary w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    >
                      {showPassword ? <FaEyeSlash style={{ color: '#9ca3af' }} /> : <FaEye style={{ color: '#9ca3af' }} />}
                    </button>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block dark:text-primary w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-0 inset-y-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                    >
                      {showConfirmPassword ? <FaEyeSlash style={{ color: '#9ca3af' }} /> : <FaEye style={{ color: '#9ca3af' }} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="w-full bg-[var(--color-primary)] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[var(--color-primary-dark)] active:scale-[0.98] transition-all shadow-lg shadow-[var(--color-primary)]/20"
                >
                  Continue
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="step2"
                custom={2}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="text-center pb-2">
                    <p className="font-figtree text-gray-600">
                      How should we call you?
                    </p>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaUser className="text-gray-400 group-focus-within:text-[var(--color-secondary)] transition-colors" />
                    </div>
                    <input
                      id="username"
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                      className="block w-full dark:text-primary pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all font-figtree"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 dark:bg-primary text-gray-600 font-bold text-lg py-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-[var(--color-primary)] text-white font-bold text-lg py-3.5 rounded-xl hover:bg-[var(--color-primary-dark)] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-lg shadow-[var(--color-primary)]/20"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="text-center mt-6 text-gray-500 font-figtree">
        Already have an account?{" "}
        <button
          onClick={() => router.push("/login")}
          className="text-[var(--color-secondary)]  dark:bg-primary font-bold hover:underline"
        >
          Sign in
        </button>
      </p>
    </motion.div>
  );
}
