"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

export default function CredentialsPage() {
  const params = useParams();
  const applicationId = params.id as string;

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [createdCredential, setCreatedCredential] =
    useState<CreatedCredential | null>(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function loadCredentials() {
    try {
      setLoading(true);

      const response = await apiFetch(
        `/Applications/${applicationId}/credentials`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load credentials (${response.status})`
        );
      }

      const data = await response.json();

      setCredentials(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createCredential() {
    try {
      setCreating(true);
      setError("");
      setCreatedCredential(null);

      const response = await apiFetch(
        `/Applications/${applicationId}/credentials`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message ||
            `Failed to create credential (${response.status})`
        );
      }

      const data =
        (await response.json()) as CreatedCredential;

      setCreatedCredential(data);

      await loadCredentials();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create credential."
      );
    } finally {
      setCreating(false);
    }
  }

  async function disableCredential(id: string) {
    try {
      const response = await apiFetch(
        `/Applications/${applicationId}/credentials/${id}/disable`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to disable credential.");
      }

      await loadCredentials();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to disable credential."
      );
    }
  }

  async function enableCredential(id: string) {
    try {
      const response = await apiFetch(
        `/Applications/${applicationId}/credentials/${id}/enable`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to enable credential.");
      }

      await loadCredentials();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to enable credential."
      );
    }
  }

  useEffect(() => {
    loadCredentials();
  }, [applicationId]);

  return (
    <main className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">
          Application Credentials
        </h1>

        <p className="mt-1 text-sm text-zinc-500">
          Manage API credentials for this application.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950">
          {error}
        </div>
      )}

      {createdCredential && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950">
          <h2 className="font-semibold text-green-800 dark:text-green-300">
            Credential Created
          </h2>

          <p className="mt-2 text-sm text-green-700 dark:text-green-400">
            Save the API Secret now. It will not be shown again.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <p className="mb-1 text-xs text-zinc-500">
                API Key
              </p>

              <code className="block rounded-lg bg-white p-3 text-sm dark:bg-zinc-900">
                {createdCredential.apiKey}
              </code>
            </div>

            <div>
              <p className="mb-1 text-xs text-zinc-500">
                API Secret
              </p>

              <code className="block rounded-lg bg-white p-3 text-sm dark:bg-zinc-900">
                {createdCredential.apiSecret}
              </code>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Credentials
        </h2>

        <button
          onClick={createCredential}
          disabled={creating}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-zinc-900"
        >
          {creating
            ? "Creating..."
            : "+ Create Credential"}
        </button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
          Loading credentials...
        </div>
      ) : credentials.length === 0 ? (
        <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-semibold">
            No credentials
          </h2>

          <p className="mt-2 text-sm text-zinc-500">
            Create a credential to access this application.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {credentials.map((credential) => (
              <div
                key={credential.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium">
                    {credential.apiKey}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Created{" "}
                    {new Date(
                      credential.createdAt
                    ).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      credential.isActive
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800"
                    }`}
                  >
                    {credential.isActive
                      ? "Active"
                      : "Disabled"}
                  </span>

                  {credential.isActive ? (
                    <button
                      onClick={() =>
                        disableCredential(
                          credential.id
                        )
                      }
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                    >
                      Disable
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        enableCredential(
                          credential.id
                        )
                      }
                      className="rounded-lg border border-green-200 px-3 py-2 text-xs font-medium text-green-600 hover:bg-green-50 dark:border-green-900 dark:hover:bg-green-950"
                    >
                      Enable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}