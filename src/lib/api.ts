import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "@/lib/auth";

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || ""
).replace(/\/+$/, "");

let refreshPromise: Promise<string> | null = null;

function normalizePath(path: string): string {
  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  if (path.startsWith("/api/")) {
    return path;
  }

  return `/api${
    path.startsWith("/") ? path : `/${path}`
  }`;
}

// function buildApiUrl(path: string): string {
//   const normalizedPath = normalizePath(path);

//   if (
//     normalizedPath.startsWith("http://") ||
//     normalizedPath.startsWith("https://")
//   ) {
//     return normalizedPath;
//   }

//   return `${API_URL}${normalizedPath}`;
// }

function buildApiUrl(path: string): string {
  const normalizedPath = normalizePath(path);

  const url =
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
      ? normalizedPath
      : `${API_URL}${normalizedPath}`;

  console.log("MEBABL API:", {
    path,
    normalizedPath,
    url,
  });

  return url;
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await fetch(
    buildApiUrl("/developers/refresh-token"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    },
  );

  if (!response.ok) {
    clearAuthTokens();

    throw new Error(
      `Refresh token failed (${response.status})`,
    );
  }

  const data = await response.json();

  if (
    !data ||
    typeof data.accessToken !== "string" ||
    typeof data.refreshToken !== "string"
  ) {
    clearAuthTokens();

    throw new Error("Invalid refresh response");
  }

  setAuthTokens(
    data.accessToken,
    data.refreshToken,
  );

  return data.accessToken;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  let accessToken = getAccessToken();

  async function sendRequest(
    token: string | null,
  ): Promise<Response> {
    const headers = new Headers(options.headers);

    if (
      options.body &&
      !headers.has("Content-Type")
    ) {
      headers.set(
        "Content-Type",
        "application/json",
      );
    }

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`,
      );
    } else {
      headers.delete("Authorization");
    }

    return fetch(buildApiUrl(path), {
      ...options,
      headers,
    });
  }

  let response = await sendRequest(accessToken);

  if (response.status === 401) {
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      accessToken = await refreshPromise;

      response = await sendRequest(accessToken);

      return response;
    } catch (error) {
      clearAuthTokens();

      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }

      throw error;
    }
  }

  return response;
}