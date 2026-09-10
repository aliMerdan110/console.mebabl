"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type VerifyState = "loading" | "success" | "error";

interface VerifyResponse {
  message?: string;
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();

  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setState("error");
      setMessage("Verification token is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/sdk/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token,
          }),
        });

        const data: VerifyResponse | null = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || "The verification link is invalid or has expired.",
          );
        }

        setState("success");
        setMessage(
          data?.message || "Email has been verified successfully.",
        );
      } catch (error) {
        setState("error");

        setMessage(
          error instanceof Error
            ? error.message
            : "Unable to verify your email.",
        );
      }
    };

    void verifyEmail();
  }, [searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        {state === "loading" && (
          <>
            <div className="mx-auto mb-6 h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

            <h1 className="text-2xl font-semibold">
              Verifying your email
            </h1>

            <p className="mt-3 text-muted-foreground">
              Please wait while we verify your email address.
            </p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600">
              ✓
            </div>

            <h1 className="text-2xl font-semibold">
              Email verified
            </h1>

            <p className="mt-3 text-muted-foreground">
              {message}
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
              You can now return to the application and sign in.
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl text-red-600">
              !
            </div>

            <h1 className="text-2xl font-semibold">
              Verification failed
            </h1>

            <p className="mt-3 text-muted-foreground">
              {message}
            </p>

            <p className="mt-6 text-sm text-muted-foreground">
              The link may have expired or already been used.
            </p>
          </>
        )}
      </div>
    </main>
  );
}