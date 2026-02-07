import type { Form, FormResponse } from "@/types/form";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

// Transform MongoDB _id to id for frontend
function transformForm(data: any): Form {
  return {
    ...data,
    id: data._id || data.id,
  };
}

function transformResponse(data: any): FormResponse {
  return {
    ...data,
    id: data._id || data.id,
  };
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await response.json();
  if (data && data.success === false) {
    throw new ApiError(response.status, data.message || "Action failed");
  }

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Something went wrong");
  }

  return data;
}

export const authApi = {
  login: async (credentials: { username: string; password: string }) => {
    // Assuming your auth routes are mounted at /auth or /admin
    // Adjust '/auth/admin/login' based on your server.js routes
    return fetchApi<any>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  verify: async () => {
    return fetchApi<any>('/auth/verify');
  },
  
  logout: async () => {
    // Ideally, call a backend logout endpoint to clear cookies. 
    // For now, we can just reload or clear local state.
  }
};

// Forms API
export const formsApi = {
  getAll: async (): Promise<Form[]> => {
    const data = await fetchApi<any[]>("/forms");
    return data.map(transformForm);
  },

  getById: async (id: string): Promise<Form> => {
    const data = await fetchApi<any>(`/forms/${id}`);
    return transformForm(data);
  },

  create: async (form: Omit<Form, "_id">): Promise<Form> => {
    const data = await fetchApi<any>("/forms", {
      method: "POST",
      body: JSON.stringify(form),
    });
    return transformForm(data);
  },

  update: async (id: string, form: Partial<Form>): Promise<Form> => {
    const data = await fetchApi<any>(`/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
    return transformForm(data);
  },

  delete: async (id: string): Promise<void> => {
    await fetchApi(`/forms/${id}`, {
      method: "DELETE",
    });
  },

  getResponses: async (id: string): Promise<FormResponse[]> => {
    const data = await fetchApi<any[]>(`/forms/${id}/responses`);
    return data.map(transformResponse);
  },

  submitResponse: async (
    id: string,
    data: { answers: FormResponse["answers"]; respondent?: string },
  ): Promise<FormResponse> => {
    const response = await fetchApi<any>(`/forms/${id}/responses`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return transformResponse(response);
  },
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Network response was not ok");
  }
  return response.json();
};

export const getFormResponses = async (formId: string) => {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}/responses`);
  return handleResponse(response);
};

export const getFormById = async (formId: string) => {
  const response = await fetch(`${API_BASE_URL}/forms/${formId}`);
  return handleResponse(response);
};

// File Upload

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    body: formData,
    // Note: Do NOT set Content-Type header here; fetch sets it automatically for FormData
  });

  if (!response.ok) {
    throw new Error("File upload failed");
  }

  return response.json(); // Returns { url: "...", filename: "..." }
};

export async function checkSubmissionStatus(formId: string, email: string) {
  const response = await fetch(
    `${API_BASE_URL}/forms/${formId}/check-status?email=${encodeURIComponent(email)}`,
  );
  const data = await response.json();
  return data.submitted; // Expected boolean from backend
}

export { ApiError };
