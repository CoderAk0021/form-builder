import type { Form, FormResponse } from '@/types/form';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
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
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, error.message || 'Something went wrong');
  }

  return response.json();
}

// Forms API
export const formsApi = {
  getAll: async (): Promise<Form[]> => {
    const data = await fetchApi<any[]>('/forms');
    return data.map(transformForm);
  },
  
  getById: async (id: string): Promise<Form> => {
    const data = await fetchApi<any>(`/forms/${id}`);
    return transformForm(data);
  },
  
  create: async (form: Omit<Form, '_id'>): Promise<Form> => {
    const data = await fetchApi<any>('/forms', {
      method: 'POST',
      body: JSON.stringify(form),
    });
    return transformForm(data);
  },
  
  update: async (id: string, form: Partial<Form>): Promise<Form> => {
    const data = await fetchApi<any>(`/forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(form),
    });
    return transformForm(data);
  },
  
  delete: async (id: string): Promise<void> => {
    await fetchApi(`/forms/${id}`, {
      method: 'DELETE',
    });
  },
  
  getResponses: async (id: string): Promise<FormResponse[]> => {
    const data = await fetchApi<any[]>(`/forms/${id}/responses`);
    return data.map(transformResponse);
  },
  
  submitResponse: async (
    id: string,
    data: { answers: FormResponse['answers']; respondent?: FormResponse['respondent'] }
  ): Promise<FormResponse> => {
    const response = await fetchApi<any>(`/forms/${id}/responses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return transformResponse(response);
  },
};

export { ApiError };
