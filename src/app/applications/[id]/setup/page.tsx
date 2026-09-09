"use client";

import { apiFetch } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Platform =
  | "android"
  | "ios"
  | "web"
  | "flutter";

type Step = 1 | 2;

type ExistingPlatform = {
  id: string;
  applicationId: string;
  platform: Platform;
  nickname: string | null;
  packageName: string | null;
  bundleId: string | null;
  domain: string | null;
  isActive: boolean;
};

type CreatePlatformResponse = {
  id?: string;
  applicationId?: string;
  platform?: string;
  nickname?: string | null;
  packageName?: string | null;
  bundleId?: string | null;
  domain?: string | null;
  isActive?: boolean;
  message?: string;
  title?: string;
};

type PlatformConfigResponse = {
  applicationId?: string;
  platformId?: string;
  platform?: string;
  applicationIdValue?: string;
  packageName?: string | null;
  bundleId?: string | null;
  domain?: string | null;
  apiKey?: string;
  baseUrl?: string;
  [key: string]: unknown;
};

const platforms: {
  id: Platform;
  name: string;
  description: string;
  icon: string;
}[] = [
  {
    id: "android",
    name: "Android",
    description: "Add Mebabl to your Android app.",
    icon: "🤖",
  },
  {
    id: "ios",
    name: "iOS",
    description: "Add Mebabl to your iPhone or iPad app.",
    icon: "",
  },
  {
    id: "web",
    name: "Web",
    description: "Add Mebabl to your web application.",
    icon: "🌐",
  },
  {
    id: "flutter",
    name: "Flutter",
    description: "Add Mebabl to your Flutter application.",
    icon: "💙",
  },
];

export default function SetupPage() {
  const router = useRouter();
  const params = useParams();

  const applicationId = String(params.id);

  const [existingPlatforms, setExistingPlatforms] =
    useState<ExistingPlatform[]>([]);

  const [loadingPlatforms, setLoadingPlatforms] =
    useState(true);

  const [selectedPlatform, setSelectedPlatform] =
    useState<Platform | null>(null);

  const [platformId, setPlatformId] =
    useState<string | null>(null);

  const [step, setStep] = useState<Step>(1);

  const [nickname, setNickname] = useState("");
  const [packageName, setPackageName] = useState("");
  const [bundleId, setBundleId] = useState("");
  const [domain, setDomain] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selected = platforms.find(
    (platform) => platform.id === selectedPlatform
  );

  // ------------------------------------------------------------
  // Load existing application platforms
  // ------------------------------------------------------------

  async function loadPlatforms() {
    try {
      setLoadingPlatforms(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/platforms`
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          text ||
            `Failed to load application platforms (${response.status}).`
        );
      }

      const data =
        (await response.json()) as ExistingPlatform[];

      setExistingPlatforms(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load application platforms."
      );
    } finally {
      setLoadingPlatforms(false);
    }
  }

  useEffect(() => {
    if (applicationId) {
      void loadPlatforms();
    }
  }, [applicationId]);

  // ------------------------------------------------------------
  // Helpers
  // ------------------------------------------------------------

  function isPlatformAdded(platform: Platform) {
    return existingPlatforms.some(
      (item) => item.platform === platform
    );
  }

  function getExistingPlatform(platform: Platform) {
    return existingPlatforms.find(
      (item) => item.platform === platform
    );
  }

  function resetFields() {
    setNickname("");
    setPackageName("");
    setBundleId("");
    setDomain("");
    setError("");
    setPlatformId(null);
  }

  function selectPlatform(platform: Platform) {
    if (isPlatformAdded(platform)) {
      return;
    }

    setSelectedPlatform(platform);
    resetFields();
  }

  // ------------------------------------------------------------
  // Validation
  // ------------------------------------------------------------

  function validate(): boolean {
    if (!selectedPlatform) {
      setError("Please select a platform.");
      return false;
    }

    if (isPlatformAdded(selectedPlatform)) {
      setError(
        `The ${selectedPlatform} platform has already been added to this application.`
      );
      return false;
    }

    if (
      selectedPlatform === "android" &&
      !packageName.trim()
    ) {
      setError("Android package name is required.");
      return false;
    }

    if (
      selectedPlatform === "ios" &&
      !bundleId.trim()
    ) {
      setError("iOS Bundle ID is required.");
      return false;
    }

    if (
      selectedPlatform === "web" &&
      !domain.trim()
    ) {
      setError("Web domain is required.");
      return false;
    }

    return true;
  }

  // ------------------------------------------------------------
  // Add Platform
  // ------------------------------------------------------------

  async function handleAddPlatform() {
    if (!validate() || !selectedPlatform) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/platforms`,
        {
          method: "POST",
          body: JSON.stringify({
            platform: selectedPlatform,

            nickname:
              nickname.trim() || null,

            packageName:
              selectedPlatform === "android"
                ? packageName.trim()
                : null,

            bundleId:
              selectedPlatform === "ios"
                ? bundleId.trim()
                : null,

            domain:
              selectedPlatform === "web"
                ? domain.trim()
                : null,
          }),
        }
      );

      const text = await response.text();

      let data: CreatePlatformResponse = {};

      if (text) {
        try {
          data =
            JSON.parse(text) as CreatePlatformResponse;
        } catch {
          data = {
            message: text,
          };
        }
      }

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        setError(
          data.message ||
            data.title ||
            `Failed to add ${selectedPlatform} platform.`
        );

        return;
      }

      // --------------------------------------------------------
      // Save newly created platform ID
      // --------------------------------------------------------

      if (!data.id) {
        setError(
          "Platform was created, but the platform ID was not returned."
        );
        return;
      }

      setPlatformId(data.id);

      // --------------------------------------------------------
      // Refresh platforms
      // --------------------------------------------------------

      await loadPlatforms();

      // --------------------------------------------------------
      // Move to Step 2
      // --------------------------------------------------------

      setStep(2);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // Step 2
  // ------------------------------------------------------------

  function getStep2Title() {
    switch (selectedPlatform) {
      case "android":
        return "Download and then add config file";

      case "ios":
        return "Download and then add config file";

      case "web":
        return "Add Mebabl SDK";

      case "flutter":
        return "Install and run the Mebabl CLI";

      default:
        return "Next steps";
    }
  }

  function getStep2Description() {
    switch (selectedPlatform) {
      case "android":
        return "Download your Android configuration file and add it to your Android project.";

      case "ios":
        return "Download your iOS configuration file and add it to your Xcode project.";

      case "web":
        return "Add the Mebabl SDK to your web application and initialize it with your application configuration.";

      case "flutter":
        return "Install the Mebabl CLI and initialize your Flutter project.";

      default:
        return "";
    }
  }

  // ------------------------------------------------------------
  // Download Platform Configuration
  // ------------------------------------------------------------

  async function handleDownloadConfig() {
    if (!platformId) {
      setError(
        "Platform configuration is not available."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiFetch(
        `/applications/${applicationId}/platforms/${platformId}/config`
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      const text = await response.text();

      let data: PlatformConfigResponse = {};

      if (text) {
        try {
          data =
            JSON.parse(text) as PlatformConfigResponse;
        } catch {
          data = {
            message: text,
          } as PlatformConfigResponse;
        }
      }

      if (!response.ok) {
        const errorData = data as PlatformConfigResponse & {
          message?: string;
          title?: string;
        };

        setError(
          errorData.message ||
            errorData.title ||
            "Failed to load platform configuration."
        );

        return;
      }

      // --------------------------------------------------------
      // Generate mebabl.json
      // --------------------------------------------------------

      const json = JSON.stringify(
        data,
        null,
        2
      );

      const blob = new Blob(
        [json],
        {
          type: "application/json",
        }
      );

      const url =
        URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;
      link.download = "mebabl.json";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download configuration."
      );
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // Render
  // ------------------------------------------------------------

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-10 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">

        {/* Back */}
        <button
          type="button"
          onClick={() =>
            step === 2
              ? setStep(1)
              : router.push(
                  `/applications/${applicationId}`
                )
          }
          className="mb-8 text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-zinc-500">
            Application setup
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Add Mebabl to your app
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            Choose the platform you want to connect to this
            application.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-3">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              step >= 1
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
            }`}
          >
            1
          </div>

          <div
            className={`h-px flex-1 ${
              step >= 2
                ? "bg-zinc-900 dark:bg-white"
                : "bg-zinc-200 dark:bg-zinc-800"
            }`}
          />

          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
              step >= 2
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "bg-zinc-200 text-zinc-500 dark:bg-zinc-800"
            }`}
          >
            2
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 1 */}
        {/* ==================================================== */}

        {step === 1 && (
          <>
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Select a platform
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Choose where your application will run.
              </p>
            </div>

            {/* Loading platforms */}
            {loadingPlatforms ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map(
                  (_, index) => (
                    <div
                      key={index}
                      className="h-48 animate-pulse rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
                    />
                  )
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {platforms.map((platform) => {
                  const active =
                    selectedPlatform === platform.id;

                  const alreadyAdded =
                    isPlatformAdded(platform.id);

                  const existing =
                    getExistingPlatform(platform.id);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      disabled={
                        alreadyAdded || loading
                      }
                      onClick={() =>
                        selectPlatform(platform.id)
                      }
                      className={`group rounded-2xl border p-6 text-left transition ${
                        alreadyAdded
                          ? "cursor-not-allowed border-zinc-200 bg-zinc-50 opacity-70 dark:border-zinc-800 dark:bg-zinc-900/50"
                          : active
                          ? "border-zinc-900 bg-white shadow-md dark:border-white dark:bg-zinc-900"
                          : "border-zinc-200 bg-white hover:border-zinc-400 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                          {platform.icon}
                        </div>

                        {alreadyAdded ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
                            ✓ Added
                          </span>
                        ) : (
                          <div
                            className={`h-5 w-5 rounded-full border ${
                              active
                                ? "border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white"
                                : "border-zinc-300 dark:border-zinc-600"
                            }`}
                          />
                        )}
                      </div>

                      <h3 className="mt-5 text-lg font-semibold text-zinc-900 dark:text-white">
                        {platform.name}
                      </h3>

                      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        {platform.description}
                      </p>

                      {alreadyAdded && existing && (
                        <div className="mt-4 rounded-lg bg-zinc-100 px-3 py-2 dark:bg-zinc-800">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {existing.nickname ||
                              existing.packageName ||
                              existing.bundleId ||
                              existing.domain ||
                              "Platform already configured"}
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Registration */}
            {selectedPlatform && (
              <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Step 1
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-white">
                    Add your {selected?.name} app
                  </h2>
                </div>

                <div className="space-y-5">

                  {/* Nickname */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                      App nickname{" "}
                      <span className="text-zinc-400">
                        (optional)
                      </span>
                    </label>

                    <input
                      value={nickname}
                      onChange={(e) =>
                        setNickname(e.target.value)
                      }
                      disabled={loading}
                      placeholder={`My ${selected?.name} App`}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                  </div>

                  {/* Android */}
                  {selectedPlatform === "android" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                        Android package name
                      </label>

                      <input
                        value={packageName}
                        onChange={(e) =>
                          setPackageName(e.target.value)
                        }
                        disabled={loading}
                        required
                        placeholder="com.company.appname"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />

                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        The package name must match your Android
                        application's package.
                      </p>
                    </div>
                  )}

                  {/* iOS */}
                  {selectedPlatform === "ios" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                        Bundle ID
                      </label>

                      <input
                        value={bundleId}
                        onChange={(e) =>
                          setBundleId(e.target.value)
                        }
                        disabled={loading}
                        required
                        placeholder="com.company.appname"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />

                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        The Bundle ID must match your iOS
                        application's bundle identifier.
                      </p>
                    </div>
                  )}

                  {/* Web */}
                  {selectedPlatform === "web" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-white">
                        App domain
                      </label>

                      <input
                        value={domain}
                        onChange={(e) =>
                          setDomain(e.target.value)
                        }
                        disabled={loading}
                        required
                        placeholder="example.com"
                        className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                      />

                      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        You can configure additional domains later.
                      </p>
                    </div>
                  )}

                  {/* Flutter */}
                  {selectedPlatform === "flutter" && (
                    <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/60">
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">
                        Flutter projects use the platform
                        configuration from your Flutter project.
                      </p>
                    </div>
                  )}
                </div>

                {/* Add button */}
                <div className="mt-8 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddPlatform}
                    disabled={loading}
                    className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {loading
                      ? "Adding..."
                      : "Add app"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ==================================================== */}
        {/* STEP 2 */}
        {/* ==================================================== */}

        {step === 2 && selectedPlatform && (
          <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">

            {/* Header */}
            <div className="border-b border-zinc-200 p-8 dark:border-zinc-800">
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
                  {selected?.icon}
                </div>

                <div>
                  <p className="text-sm text-zinc-500">
                    {selected?.name}
                  </p>

                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                    {getStep2Title()}
                  </h2>
                </div>
              </div>
            </div>

            <div className="p-8">

              <p className="max-w-2xl text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                {getStep2Description()}
              </p>

              {/* Android */}
              {selectedPlatform === "android" && (
                <div className="mt-8 space-y-4">

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      2. Download configuration
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Download your Android configuration file.
                    </p>

                    <button
                      type="button"
                      onClick={handleDownloadConfig}
                      disabled={
                        loading || !platformId
                      }
                      className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {loading
                        ? "Preparing config..."
                        : "Download mebabl.json"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      3. Add Mebabl SDK
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Add the Mebabl Android SDK to your project.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      4. Next steps
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Continue configuring Authentication,
                      Database, Storage and other Mebabl services.
                    </p>
                  </div>

                </div>
              )}

              {/* iOS */}
              {selectedPlatform === "ios" && (
                <div className="mt-8 space-y-4">

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      2. Download configuration
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Download your iOS configuration file.
                    </p>

                    <button
                      type="button"
                      onClick={handleDownloadConfig}
                      disabled={
                        loading || !platformId
                      }
                      className="mt-4 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                    >
                      {loading
                        ? "Preparing config..."
                        : "Download mebabl.json"}
                    </button>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      3. Add Mebabl SDK
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Add the Mebabl SDK using your preferred
                      package manager.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      4. Next steps
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Configure the Mebabl services you need.
                    </p>
                  </div>

                </div>
              )}

              {/* Web */}
              {selectedPlatform === "web" && (
                <div className="mt-8 space-y-4">

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      2. Add Mebabl SDK
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Install and initialize the Mebabl SDK in
                      your web application.
                    </p>

                    <div className="mt-4 rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-200">
                      npm install @mebabl/web
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      3. Initialize Mebabl
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Use your application configuration to
                      initialize the SDK.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      4. Next steps
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Start using Authentication, Database,
                      Storage and Realtime.
                    </p>
                  </div>

                </div>
              )}

              {/* Flutter */}
              {selectedPlatform === "flutter" && (
                <div className="mt-8 space-y-4">

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      2. Prepare your workspace
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Make sure Flutter and the Mebabl CLI are
                      installed.
                    </p>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      3. Initialize Mebabl
                    </h3>

                    <div className="mt-4 rounded-lg bg-zinc-950 p-4 font-mono text-sm text-zinc-200">
                      mebabl init
                    </div>
                  </div>

                  <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">
                      4. Next steps
                    </h3>

                    <p className="mt-2 text-sm text-zinc-500">
                      Configure the Mebabl services required by
                      your Flutter application.
                    </p>
                  </div>

                </div>
              )}

              {/* Finish */}
              <div className="mt-8 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/applications/${applicationId}`
                    )
                  }
                  className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
                >
                  Go to Application
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </main>
  );
}