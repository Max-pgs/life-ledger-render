/* Uses the deployed API URL when available and falls back to local Django during development. */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    Authorization: `Token ${token}`,
  };
}

/* Parses successful responses and forwards backend validation errors unchanged. */
async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw data;
  }

  return data;
}

export async function getCommitments() {
  const response = await fetch(`${API_BASE_URL}/commitments/`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function getCommitmentGroups() {
  const response = await fetch(`${API_BASE_URL}/commitments/groups/`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function getCommitmentStatuses() {
  const response = await fetch(`${API_BASE_URL}/commitments/statuses/`, {
    headers: getAuthHeaders(),
  });

  return parseResponse(response);
}

export async function createCommitment(commitmentData) {
  const response = await fetch(`${API_BASE_URL}/commitments/`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(commitmentData),
  });

  return parseResponse(response);
}

export async function getCommitment(commitmentId) {
  const response = await fetch(
    `${API_BASE_URL}/commitments/${commitmentId}/`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseResponse(response);
}

export async function updateCommitment(
  commitmentId,
  commitmentData,
) {
  const response = await fetch(
    `${API_BASE_URL}/commitments/${commitmentId}/`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(commitmentData),
    },
  );

  return parseResponse(response);
}