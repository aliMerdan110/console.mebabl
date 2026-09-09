"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function CreateApplicationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await apiFetch(
        "/applications",
        {
          method: "POST",
          body: JSON.stringify({
            name,
            code,
            description,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to create application (${response.status})`
        );
      }

      router.push("/applications");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create application."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">
          Create Application
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create a new application for your platform.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              required
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Code
            </label>

            <input
              value={code}
              onChange={(event) =>
                setCode(event.target.value)
              }
              required
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
          >
            {loading
              ? "Creating..."
              : "Create Application"}
          </button>
        </form>
      </div>
    </main>
  );
}