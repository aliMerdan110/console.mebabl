import {
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
  clearAuthTokens,
} from "@/lib/auth";

// طلب Refresh واحد فقط في نفس الوقت
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await fetch(
    "/api/platform/developers/refresh-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Refresh token failed");
  }

  const data = await response.json();

  if (!data.accessToken || !data.refreshToken) {
    throw new Error("Invalid refresh response");
  }

  // حفظ الـ Tokens الجديدة
  setAuthTokens(
    data.accessToken,
    data.refreshToken
  );

  return data.accessToken;
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  let accessToken = getAccessToken();

  const request = async (token: string | null) => {
    const headers = new Headers(options.headers);

    headers.set(
      "Content-Type",
      "application/json"
    );

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    console.log(
      "[apiFetch] request:",
      path
    );

    return fetch(
      `/api/platform${path}`,
      {
        ...options,
        headers,
      }
    );
  };

  // الطلب الأول
  let response = await request(accessToken);

  console.log(
    "[apiFetch] first response:",
    path,
    response.status
  );

  // Access Token منتهي
  if (response.status === 401) {
    try {
      /*
       * إذا كان هناك Refresh يعمل بالفعل،
       * ننتظر نفس العملية بدل إنشاء Refresh جديد.
       */
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken()
          .finally(() => {
            refreshPromise = null;
          });
      }

      accessToken = await refreshPromise;

      // إعادة الطلب بالتوكن الجديد
      response = await request(accessToken);

      console.log(
        "[apiFetch] retry response:",
        path,
        response.status
      );
    } catch (error) {
      clearAuthTokens();

      window.location.href = "/login";

      throw error;
    }
  }

  return response;
}