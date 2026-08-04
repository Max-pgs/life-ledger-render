const API_BASE_URL = "http://127.0.0.1:8000/api/auth";

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

