
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type Application = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  domain?: string | null;
  isActive?: boolean;
};

type ValidationErrors = Record<string, string[]>;

export default function EditApplicationPage() {
  const params = useParams();
  const router = useRouter();

  const applicationId = params.id as string;

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [errors, setErrors] =
    useState<ValidationErrors | null>(null);

  useEffect(() => {
    if (!applicationId) return;

    async function loadApplication() {
      try {
        setLoading(true);
        setError("");
        setErrors(null);

        const response = await apiFetch(
          `/Applications/${applicationId}`
        );

        const text = await response.text();

        let data: any = {};

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = {
              message: text,
            };
          }
        }

        if (!response.ok) {
          throw new Error(
            data.message ||
              `Failed to load application (${response.status}).`
          );
        }

        const application =
          data as Application;

        setName(application.name ?? "");
        setCode(application.code ?? "");
        setDescription(
          application.description ?? ""
        );
        setDomain(application.domain ?? "");
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load application."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplication();
  }, [applicationId]);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setErrors(null);

    const payload = {
      id: applicationId,
      name: name.trim(),
      code: code.trim(),
      description:
        description.trim() || null,
      domain: domain.trim() || null,
    };

    try {
      const response = await apiFetch(
        `/Applications/${applicationId}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();

      let data: any = {};

      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = {
            message: text,
          };
        }
      }

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setError(
            data.message ||
              `Failed to update application (${response.status}).`
          );
        }

        return;
      }

      router.push(
        `/applications/${applicationId}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Failed to update application:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update application."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <Sidebar />

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar />

          <main className="flex-1 p-6 lg:p-8">
            <Breadcrumb />

            <div className="max-w-2xl animate-pulse">
              <div className="h-8 w-56 rounded bg-zinc-200 dark:bg-zinc-800" />

              <div className="mt-2 h-4 w-80 rounded bg-zinc-200 dark:bg-zinc-800" />

              <div className="mt-8 space-y-5 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="h-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-12 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-24 rounded bg-zinc-200 dark:bg-zinc-800" />
                <div className="h-12 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="flex-1 p-6 lg:p-8">
          <Breadcrumb />

          <div className="mb-8">
            <button
              type="button"
              onClick={() =>
                router.push(
                  `/applications/${applicationId}`
                )
              }
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            >
              ← Back to Application
            </button>

            <h1 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Edit Application
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Update your application configuration.
            </p>
          </div>

          {error && (
            <div className="mb-6 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="max-w-2xl space-y-6"
          >
            <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium"
                  >
                    Application Name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    disabled={saving}
                    required
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  {errors?.Name && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.Name[0]}
                    </p>
                  )}
                </div>

                {/* Code */}
                <div>
                  <label
                    htmlFor="code"
                    className="mb-2 block text-sm font-medium"
                  >
                    Application Code
                  </label>

                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value)
                    }
                    disabled={saving}
                    required
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  <p className="mt-1 text-xs text-zinc-500">
                    The unique identifier of this application.
                  </p>

                  {errors?.Code && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.Code[0]}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="mb-2 block text-sm font-medium"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value
                      )
                    }
                    disabled={saving}
                    rows={4}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  {errors?.Description && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.Description[0]}
                    </p>
                  )}
                </div>

                {/* Domain */}
                <div>
                  <label
                    htmlFor="domain"
                    className="mb-2 block text-sm font-medium"
                  >
                    Domain
                  </label>

                  <input
                    id="domain"
                    type="text"
                    value={domain}
                    onChange={(event) =>
                      setDomain(event.target.value)
                    }
                    disabled={saving}
                    placeholder="example.mebabl.com"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800"
                  />

                  {errors?.Domain && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.Domain[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Application ID */}
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Application ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-zinc-700 dark:text-zinc-300">
                {applicationId}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() =>
                  router.push(
                    `/applications/${applicationId}`
                  )
                }
                className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </main>

        <Footer />
      </div>
    </div>
  );
}
