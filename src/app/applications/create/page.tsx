"use client";

import { apiFetch } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";

type CreateApplicationResponse = {
  id: string;
  name: string;
  code: string;
  apiKey: string;
  apiSecret: string;
};

type ValidationErrors = Record<string, string[]>;

export default function CreateApplicationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<ValidationErrors | null>(null);
  const [loading, setLoading] = useState(false);

  // توليد Code تلقائياً من اسم التطبيق
  const handleNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newName = event.target.value;
    setName(newName);

    const generatedCode = newName
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      .replace(/[^\w-]/g, "");

    setCode(generatedCode);
  };

  // إنشاء ملف mebabl.json وتنزيله
  const downloadMebablConfig = (
    application: CreateApplicationResponse
  ) => {
    const config = {
      mebabl: {
        applicationId: application.id,
        name: application.name,
        code: application.code,
        apiKey: application.apiKey,
        apiSecret: application.apiSecret,
        baseUrl: "https://api.mebabl.com",
      },
    };

    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mebabl.json";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrors(null);
    setLoading(true);

    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || null,
    };

    console.log("Creating application:", payload);

    try {
      const response = await apiFetch("/applications", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await response.text();

      console.log("Response status:", response.status);
      console.log("Response body:", text);

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({
            General: [
              data.message ||
                `Failed to create application (${response.status})`,
            ],
          });
        }
        return;
      }

      const application = data as CreateApplicationResponse;

      if (
        !application.id ||
        !application.apiKey ||
        !application.apiSecret
      ) {
        setErrors({
          General: [
            "Application was created, but the credentials were not returned.",
          ],
        });
        return;
      }

      // إنشاء وتنزيل ملف mebabl.json
      // downloadMebablConfig(application);

      // الانتقال إلى Applications
      router.push(`/applications/${application.id}/setup`);
    } catch (error) {
      console.error("Failed to create application", error);
      setErrors({
        General: ["Failed to connect to the server."],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="p-6">
      <div className="mb-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-4 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
        >
          ← Back
        </button>

        <h1 className="text-2xl font-bold">Create Application</h1>

        <p className="mt-1 text-sm text-zinc-500">
          Create a new application for your Mebabl project.
        </p>
      </div>

      <div className="max-w-xl rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        {errors?.General && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
            {errors.General[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Application Name */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Application Name
            </label>

            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              required
              disabled={loading}
              placeholder="My App"
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            />

            {errors?.Name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.Name[0]}
              </p>
            )}
          </div>

          {/* Application Code */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Application Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              required
              disabled={loading}
              placeholder="my-app"
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            />

            <p className="mt-1 text-xs text-zinc-500">
              A unique identifier for your application.
            </p>

            {errors?.Code && (
              <p className="mt-1 text-sm text-red-500">
                {errors.Code[0]}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={loading}
              rows={4}
              placeholder="Optional description..."
              className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
            />

            {errors?.Description && (
              <p className="mt-1 text-sm text-red-500">
                {errors.Description[0]}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900"
            >
              {loading ? "Creating..." : "Create Application"}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/applications")}
              className="rounded-lg border border-zinc-200 px-4 py-3 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}