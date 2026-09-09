// حفظ Tokens
export function setAuthTokens(
  accessToken: string,
  refreshToken: string
) {
  localStorage.setItem(
    "mebabl_access_token",
    accessToken
  );

  localStorage.setItem(
    "mebabl_refresh_token",
    refreshToken
  );
}

// الحصول على Access Token
export function getAccessToken() {
  return localStorage.getItem(
    "mebabl_access_token"
  );
}

// الحصول على Refresh Token
export function getRefreshToken() {
  return localStorage.getItem(
    "mebabl_refresh_token"
  );
}

// مسح Tokens
export function clearAuthTokens() {
  localStorage.removeItem(
    "mebabl_access_token"
  );

  localStorage.removeItem(
    "mebabl_refresh_token"
  );
}

// Alias قديم للتوافق
export const clearAuth = clearAuthTokens;

// تسجيل الخروج من المنصة
export async function logout() {
  const refreshToken = getRefreshToken();

  try {
    if (refreshToken) {
      await fetch(
        "/api/developers/logout",
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
    }
  } finally {
    clearAuthTokens();
    window.location.href = "/login";
  }
}

// التحقق من وجود جلسة
export function isAuthenticated() {
  return !!getAccessToken();
}