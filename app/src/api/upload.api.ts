import { API_BASE_URL } from "./client";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json();
};

export async function checkSubmissionStatus(formId: string, email: string) {
  const response = await fetch(
    `${API_BASE_URL}/forms/${formId}/check-status?email=${encodeURIComponent(email)}`,
    { credentials: "include" },
  );

  if (!response.ok) {
    throw new Error("Failed to check submission status");
  }

  const data = await response.json();
  return data.submitted;
}
