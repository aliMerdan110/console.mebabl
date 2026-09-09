"use client";

import Link from "next/link";
import {
  FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface ResetPasswordResponse {
  message: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get("token");

    if (resetToken) {
      setToken(resetToken);
    } else {
      setError(
        "This password reset link is invalid or missing its token."
      );
    }
  }, [searchParams]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");
    setMessage("");

    if (!token) {
      setError(
        "This password reset link is invalid or missing its token."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/platform/developers/reset-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword,
          }),
        }
      );

      const contentType =
        response.headers.get("content-type");

      let data:
        | ResetPasswordResponse
        | { message?: string }
        | null = null;

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();

        if (text) {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        const errorMessage =
          data &&
          "message" in data &&
          typeof data.message === "string"
            ? data.message
            : "Unable to reset your password.";

        throw new Error(errorMessage);
      }

      setMessage(
        data &&
        "message" in data &&
        typeof data.message === "string"
          ? data.message
          : "Password has been reset successfully."
      );

      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        router.replace("/login");
      }, 2000);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Reset password
          </h1>

          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Enter your new password below.
          </p>
        </div>

        {message && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400"
          >
            {message}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="newPassword"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
            >
              New password
            </label>

            <input
              id="newPassword"
              name="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              autoComplete="new-password"
              required
              disabled={loading || !token}
              placeholder="Enter your new password"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white"
            >
              Confirm new password
            </label>

            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              autoComplete="new-password"
              required
              disabled={loading || !token}
              placeholder="Confirm your new password"
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={
              loading ||
              !token ||
              !!message
            }
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading
              ? "Resetting password..."
              : "Reset password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 hover:underline dark:text-white"
          >
            Back to sign in
          </Link>
        </div>

      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-zinc-50 p-6 dark:bg-zinc-950">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Loading...
          </div>
        </main>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}