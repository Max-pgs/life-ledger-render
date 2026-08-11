/* Uses the deployed API URL when available and falls back to local Django during development. */
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("authToken");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Token ${token}` }),
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

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  return parseResponse(response);
}

export function getCommitments() {
  return apiRequest("/commitments/");
}

export function getCommitmentGroups() {
  return apiRequest("/commitments/groups/");
}

export function getCommitmentStatuses() {
  return apiRequest("/commitments/statuses/");
}

export function getCommitmentTemplates() {
  return apiRequest("/commitments/templates/");
}

export function getGuidedSetup() {
  return apiRequest("/commitments/guided_setup/");
}

export function createCommitment(commitmentData) {
  return apiRequest("/commitments/", {
    method: "POST",
    body: JSON.stringify(commitmentData),
  });
}

export function getCommitment(commitmentId) {
  return apiRequest(`/commitments/${commitmentId}/`);
}

export function updateCommitment(commitmentId, commitmentData) {
  return apiRequest(`/commitments/${commitmentId}/`, {
    method: "PUT",
    body: JSON.stringify(commitmentData),
  });
}

export function archiveCommitment(commitmentId) {
  return apiRequest(`/commitments/${commitmentId}/archive/`, {
    method: "POST",
  });
}

export function getArchivedCommitments() {
  return apiRequest("/commitments/archived/");
}

export function restoreCommitment(commitmentId) {
  return apiRequest(`/commitments/${commitmentId}/restore/`, {
    method: "POST",
  });
}

export function deleteCommitment(commitmentId) {
  return apiRequest(`/commitments/${commitmentId}/`, {
    method: "DELETE",
  });
}

export async function getUpcomingCommitments() {
  const response = await fetch(
    `${API_BASE_URL}/commitments/upcoming/`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseResponse(response);
}

export async function getOverdueCommitments() {
  const response = await fetch(
    `${API_BASE_URL}/commitments/overdue/`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseResponse(response);
}

export async function getHighPriorityCommitments() {
  const response = await fetch(
    `${API_BASE_URL}/commitments/high-priority/`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseResponse(response);
}

export async function getReviewSoonCommitments() {
  const response = await fetch(
    `${API_BASE_URL}/commitments/review-soon/`,
    {
      headers: getAuthHeaders(),
    },
  );

  return parseResponse(response);
}