"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type MobileAppLink = {
  id: string;
  androidPackageName: string | null;
  androidSha256CertificateFingerprint: string | null;
  iosBundleId: string | null;
  iosTeamId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function MobileAppLinksPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const basePath = `/applications/${applicationId}/authentication`;

  const [record, setRecord] = useState<MobileAppLink | null>(null);
  const [androidPackageName, setAndroidPackageName] = useState("");
  const [androidFingerprint, setAndroidFingerprint] = useState("");
  const [iosBundleId, setIosBundleId] = useState("");
  const [iosTeamId, setIosTeamId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        "/api/applications/mobile-app-links"
      );

      if (!response.ok) {
        throw new Error("Failed to load mobile app links.");
      }

      const data = await response.json();

      if (data) {
        setRecord(data);
        setAndroidPackageName(data.androidPackageName ?? "");
        setAndroidFingerprint(
          data.androidSha256CertificateFingerprint ?? ""
        );
        setIosBundleId(data.iosBundleId ?? "");
        setIosTeamId(data.iosTeamId ?? "");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load mobile app links."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    const body = {
      androidPackageName: androidPackageName.trim() || null,
      androidSha256CertificateFingerprint:
        androidFingerprint.trim() || null,
      iosBundleId: iosBundleId.trim() || null,
      iosTeamId: iosTeamId.trim() || null,
    };

    try {
      if (record) {
        const response = await apiFetch(
          `/api/applications/mobile-app-links/${record.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: record.id,
              ...body,
              isActive: true,
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update mobile app links.");
        }

        setMessage("Mobile app links updated successfully.");
      } else {
        const response = await apiFetch(
          "/api/applications/mobile-app-links",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save mobile app links.");
        }

        await load();
        setMessage("Mobile app links saved successfully.");
        return;
      }

      await load();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save mobile app links."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!record) return;

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      const response = await apiFetch(
        `/api/applications/mobile-app-links/${record.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete mobile app links.");
      }

      setRecord(null);
      setAndroidPackageName("");
      setAndroidFingerprint("");
      setIosBundleId("");
      setIosTeamId("");

      setMessage("Mobile app links removed successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete mobile app links."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
            <Link
              href={basePath}
              className="hover:text-zinc-900 dark:hover:text-white"
            >
              Authentication
            </Link>

            <span>/</span>

            <span className="text-zinc-900 dark:text-white">
              Mobile App Links
            </span>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              Mobile App Links
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Configure Android App Links and iOS Universal Links.
            </p>
          </div>
        </div>

        <div className="mb-6 overflow-x-auto border-b border-zinc-200 dark:border-zinc-800">
          <nav className="flex min-w-max gap-6">
            {[
              ["Overview", ""],
              ["Users", "/users"],
              ["Sign-in methods", "/sign-in-method"],
              ["Email templates", "/templates"],
              ["Mobile App Links", "/mobile-app-links"],
              ["Usage", "/usage"],
              ["Settings", "/settings"],
            ].map(([label, href]) => {
              const active = href === "/mobile-app-links";

              return (
                <Link
                  key={label}
                  href={`${basePath}${href}`}
                  className={`border-b-2 px-1 pb-3 text-sm font-medium ${
                    active
                      ? "border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>

        {loading ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            Loading...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  Android App Links
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  These values are used to generate Android asset links.
                </p>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <Field
                  label="Android Package Name"
                  value={androidPackageName}
                  onChange={setAndroidPackageName}
                  placeholder="com.example.myapp"
                />

                <Field
                  label="SHA-256 Certificate Fingerprint"
                  value={androidFingerprint}
                  onChange={setAndroidFingerprint}
                  placeholder="AA:BB:CC:DD:..."
                />
              </div>
            </section>

            <section className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="border-b border-zinc-200 px-6 py-5 dark:border-zinc-800">
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white">
                  iOS Universal Links
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  These values are used to generate Apple App Site
                  Association data.
                </p>
              </div>

              <div className="grid gap-6 p-6 md:grid-cols-2">
                <Field
                  label="iOS Bundle ID"
                  value={iosBundleId}
                  onChange={setIosBundleId}
                  placeholder="com.example.myapp"
                />

                <Field
                  label="Apple Team ID"
                  value={iosTeamId}
                  onChange={setIosTeamId}
                  placeholder="XXXXXXXXXX"
                />
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between">
              <div>
                {message && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {message}
                  </p>
                )}

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                {!message && !error && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Changes will be applied to your public mobile app link
                    configuration.
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                {record && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting || saving}
                    className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
                  >
                    {deleting ? "Removing..." : "Remove"}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || deleting}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  {saving
                    ? "Saving..."
                    : record
                      ? "Save changes"
                      : "Save configuration"}
                </button>
              </div>
            </section>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-600 dark:focus:border-zinc-500 dark:focus:ring-zinc-800"
      />
    </div>
  );
}