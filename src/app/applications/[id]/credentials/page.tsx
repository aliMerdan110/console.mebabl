"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Breadcrumb from "@/components/layout/Breadcrumb";
import Footer from "@/components/layout/Footer";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import { apiFetch } from "@/lib/api";

type Credential = {
  id: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
};

type CreatedCredential = {
  credentialId: string;
  apiKey: string;
  apiSecret: string;
};

type CredentialsResponse =
  | Credential[]
  | {
      items?: Credential[];
      data?: Credential[];
    };

type ApiError = {
  message?: string;
  title?: string;
  detail?: string;
};

function getErrorMessage(
  data: unknown,
  fallback: string,
) {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (
    data &&
    typeof data === "object" &&
    !Array.isArray(data)
  ) {
    const errorData = data as ApiError;

    return (
      errorData.message ||
      errorData.detail ||
      errorData.title ||
      fallback
    );
  }

  return fallback;
}

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export default function CredentialsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const applicationId = String(params.id);

  const [credentials, setCredentials] = useState<
    Credential[]
  >([]);

  const [createdCredential, setCreatedCredential] =
    useState<CreatedCredential | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(
    null,
  );
  const [error, setError] = useState("");
  const [copiedValue, setCopiedValue] = useState("");

  const loadCredentials = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/credentials`,
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const data = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Failed to load credentials (${response.status}).`,
          ),
        );
      }

      if (Array.isArray(data)) {
        setCredentials(data as Credential[]);
        return;
      }

      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data)
      ) {
        const responseData =
          data as CredentialsResponse & {
            items?: Credential[];
            data?: Credential[];
          };

        setCredentials(
          responseData.items ||
            responseData.data ||
            [],
        );

        return;
      }

      setCredentials([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load credentials.",
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId, router]);

  useEffect(() => {
    void loadCredentials();
  }, [loadCredentials]);

  async function createCredential() {
    if (creating) {
      return;
    }

    try {
      setCreating(true);
      setError("");
      setCreatedCredential(null);

      const response = await apiFetch(
        `/applications/${applicationId}/credentials`,
        {
          method: "POST",
        },
      );

      const data = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Failed to create credential (${response.status}).`,
          ),
        );
      }

      if (
        !data ||
        typeof data !== "object" ||
        Array.isArray(data)
      ) {
        throw new Error(
          "Credential was created, but no credential data was returned.",
        );
      }

      const credential =
        data as Partial<CreatedCredential>;

      if (
        !credential.credentialId ||
        !credential.apiKey ||
        !credential.apiSecret
      ) {
        throw new Error(
          "Credential was created, but the API credentials were not returned.",
        );
      }

      setCreatedCredential({
        credentialId: credential.credentialId,
        apiKey: credential.apiKey,
        apiSecret: credential.apiSecret,
      });

      await loadCredentials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create credential.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function disableCredential(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to disable this credential?",
    );

    if (!confirmed || actionId) {
      return;
    }

    try {
      setActionId(id);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/credentials/${id}/disable`,
        {
          method: "POST",
        },
      );

      const data = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Failed to disable credential (${response.status}).`,
          ),
        );
      }

      await loadCredentials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to disable credential.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function enableCredential(id: string) {
    if (actionId) {
      return;
    }

    try {
      setActionId(id);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/credentials/${id}/enable`,
        {
          method: "POST",
        },
      );

      const data = await readResponseBody(response);

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `Failed to enable credential (${response.status}).`,
          ),
        );
      }

      await loadCredentials();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to enable credential.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function copyToClipboard(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);

      window.setTimeout(() => {
        setCopiedValue("");
      }, 1800);
    } catch {
      setError("Failed to copy value to clipboard.");
    }
  }

  function downloadMebablJson() {
    if (!createdCredential) {
      return;
    }

    const config = {
      mebabl: {
        applicationId,
        apiKey: createdCredential.apiKey,
        apiSecret: createdCredential.apiSecret,
        baseUrl: "https://api.mebabl.com",
      },
    };

    const blob = new Blob(
      [JSON.stringify(config, null, 2)],
      {
        type: "application/json",
      },
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mebabl.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function closeCreatedCredential() {
    // API Secret لن يظهر مرة أخرى بعد إغلاق الرسالة
    setCreatedCredential(null);
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
                  `/applications/${applicationId}`,
                )
              }
              className="mb-4 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
            >
              ← Back to Application
            </button>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Application Credentials
            </h1>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Secure API credentials for your application.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400"
            >
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="font-medium hover:underline"
              >
                Close
              </button>
            </div>
          )}

          {createdCredential && (
            <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-emerald-800 dark:text-emerald-300">
                    Credential Created
                  </h2>

                  <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">
                    Save your API Secret now. It will not be
                    displayed again after closing this message.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeCreatedCredential}
                  className="rounded-lg border border-emerald-300 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-900"
                >
                  Close
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300">
                <strong>Important:</strong> Keep your API
                Secret secure. It will not be shown again.
              </div>

              <CredentialValue
                label="API Key"
                value={createdCredential.apiKey}
                copied={copiedValue === createdCredential.apiKey}
                onCopy={copyToClipboard}
              />

              <CredentialValue
                label="API Secret"
                value={createdCredential.apiSecret}
                copied={
                  copiedValue === createdCredential.apiSecret
                }
                onCopy={copyToClipboard}
                secret
              />

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={downloadMebablJson}
                  className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  Download mebabl.json
                </button>

                <button
                  type="button"
                  onClick={closeCreatedCredential}
                  className="rounded-lg border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  I&apos;ve saved it
                </button>
              </div>
            </div>
          )}

          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Credentials
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                API keys used by your application to connect
                with Mebabl.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void createCredential()}
              disabled={creating}
              className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {creating
                ? "Creating..."
                : "+ Create Credential"}
            </button>
          </div>

          {loading && (
            <div className="rounded-xl border border-zinc-200 bg-white p-8 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              Loading credentials...
            </div>
          )}

          {!loading && credentials.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                No credentials
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                Create an API credential to connect your
                application with Mebabl services.
              </p>

              <button
                type="button"
                onClick={() => void createCredential()}
                disabled={creating}
                className="mt-6 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-zinc-900"
              >
                {creating
                  ? "Creating..."
                  : "Create Credential"}
              </button>
            </div>
          )}

          {!loading && credentials.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {credentials.map((credential) => {
                  const isBusy =
                    actionId === credential.id;

                  return (
                    <div
                      key={credential.id}
                      className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${
                              credential.isActive
                                ? "bg-emerald-500"
                                : "bg-zinc-400"
                            }`}
                          />

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                              credential.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                            }`}
                          >
                            {credential.isActive
                              ? "Active"
                              : "Disabled"}
                          </span>
                        </div>

                        <div className="mt-3 max-w-full overflow-x-auto">
                          <code className="font-mono text-sm text-zinc-700 dark:text-zinc-300">
                            {credential.apiKey}
                          </code>
                        </div>

                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                          Created{" "}
                          {formatDate(credential.createdAt)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void copyToClipboard(
                              credential.apiKey,
                            )
                          }
                          className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
                        >
                          {copiedValue ===
                          credential.apiKey
                            ? "Copied"
                            : "Copy Key"}
                        </button>

                        {credential.isActive ? (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void disableCredential(
                                credential.id,
                              )
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:hover:bg-red-950"
                          >
                            {isBusy
                              ? "Disabling..."
                              : "Disable"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() =>
                              void enableCredential(
                                credential.id,
                              )
                            }
                            className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-900 dark:hover:bg-emerald-950"
                          >
                            {isBusy
                              ? "Enabling..."
                              : "Enable"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

type CredentialValueProps = {
  label: string;
  value: string;
  copied: boolean;
  secret?: boolean;
  onCopy: (value: string) => Promise<void>;
};

function CredentialValue({
  label,
  value,
  copied,
  secret = false,
  onCopy,
}: CredentialValueProps) {
  return (
    <div className="mt-5">
      <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </label>

      <div className="flex gap-2">
        <code className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-zinc-200 bg-white p-3 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {secret ? value : value}
        </code>

        <button
          type="button"
          onClick={() => void onCopy(value)}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString();
}