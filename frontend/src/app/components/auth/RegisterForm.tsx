"use client";

import { useState } from "react";
import { useAuth } from "../../lib/auth/authContext";
import { useRouter } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // Step 1: email & passwords, Step 2: username
  const { register, isLoading } = useAuth();
  const router = useRouter();

  const handleFirstStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

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
      router.push("/dashboard");
    } catch (err) {
      console.log(err);
      setError(err instanceof Error ? err.message : "Registration failed");
    }
  };

  return (
    <>
      {step === 1 ? (
        <form
          onSubmit={handleFirstStep}
          className="space-y-4 w-full flex flex-col      max-w-md "
        >
          <p className="text-xl">Get started and create accounts</p>
          <div>
            <input
              id="email"
              type="email"
              placeholder="Email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border px-3 py-2"
            />
          </div>

          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 "
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full text-xl font-bold bg-primary   rounded-xl hover:bg-primary-dark transition-colors"
          >
            Sign up
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full flex flex-col gap-4 max-w-md"
        >
          <p className="text-xl">How should we call you?</p>
          <div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full rounded-xl border px-3 py-2"
            />
          </div>

          {error && <p className="text-error text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary font-bold text-xl py-2 rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}
    </>
  );
}
