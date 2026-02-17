import type { Form, FormResponse } from "@/types/form";

export interface UseFormsReturn {
  forms: Form[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createForm: (form: Omit<Form, "_id">) => Promise<Form | null>;
  updateForm: (id: string, form: Partial<Form>) => Promise<Form | null>;
  deleteForm: (id: string) => Promise<boolean>;
  getForm: (id: string, options?: { suppressToast?: boolean }) => Promise<Form | null>;
  submitResponse: (
    id: string,
    data: { answers: FormResponse["answers"]; googleToken?: string },
  ) => Promise<FormResponse | null>;
  getResponses: (id: string) => Promise<FormResponse[]>;
}

export interface UseFormsOptions {
  autoFetch?: boolean;
}
