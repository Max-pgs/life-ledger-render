const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/auth";

/* Parses successful responses and forwards backend validation errors unchanged. */
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseResponse(response);
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return parseResponse(response);
}

export async function logoutUser() {
  const token = localStorage.getItem("authToken");

  /* Avoids an unnecessary API request when no local session exists. */
  if (!token) {
    return;
  }

  const response = await fetch(`${API_BASE_URL}/logout/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  /* Logout failures are handled by the layout, which still clears local auth data. */
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw data;
  }
}