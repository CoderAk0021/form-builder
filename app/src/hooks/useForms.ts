import { useState, useEffect, useCallback } from 'react';
import { formsApi, ApiError } from '@/lib/api';
import type { Form, FormResponse } from '@/types/form';
import { toast } from 'sonner';

interface UseFormsReturn {
  forms: Form[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createForm: (form: Omit<Form, '_id'>) => Promise<Form | null>;
  updateForm: (id: string, form: Partial<Form>) => Promise<Form | null>;
  deleteForm: (id: string) => Promise<boolean>;
  getForm: (id: string) => Promise<Form | null>;
  submitResponse: (
    id: string,
    data: { answers: FormResponse['answers']; googleToken?: string }
  ) => Promise<FormResponse | null>;
  getResponses: (id: string) => Promise<FormResponse[]>;
}

export function useForms(): UseFormsReturn {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await formsApi.getAll();
      setForms(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch forms';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const createForm = useCallback(async (form: Omit<Form, '_id'>) => {
    try {
      const newForm = await formsApi.create(form);
      setForms((prev) => [newForm, ...prev]);
      toast.success('Form created successfully!');
      return newForm;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create form';
      toast.error(message);
      return null;
    }
  }, []);

  const updateForm = useCallback(async (id: string, formData: Partial<Form>) => {
    try {
      const updatedForm = await formsApi.update(id, formData);
      setForms((prev) =>
        prev.map((f) => (f.id === id ? updatedForm : f))
      );
      toast.success('Form updated successfully!');
      return updatedForm;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update form';
      toast.error(message);
      return null;
    }
  }, []);

  const deleteForm = useCallback(async (id: string) => {
    try {
      await formsApi.delete(id);
      setForms((prev) => prev.filter((f) => f.id !== id));
      toast.success('Form deleted successfully!');
      return true;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete form';
      toast.error(message);
      return false;
    }
  }, []);

  const getForm = useCallback(async (id: string) => {
    try {
      const form = await formsApi.getById(id);
      return form;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch form';
      toast.error(message);
      return null;
    }
  }, []);

  const submitResponse = useCallback(
    async (
      id: string,
      data: { answers: FormResponse['answers']; googleToken?: string }
    ) => {
      try {
        const response = await formsApi.submitResponse(id, data);
        setForms((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, responseCount: f.responseCount + 1 } : f
          )
        );
        toast.success('Response submitted successfully!');
        return response;
      } catch (err) {
        const message = err instanceof ApiError ? err.message : 'Failed to submit response';
        toast.error(message);
        return null;
      }
    },
    []
  );

  const getResponses = useCallback(async (id: string) => {
    try {
      const responses = await formsApi.getResponses(id);
      return responses;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch responses';
      toast.error(message);
      return [];
    }
  }, []);

  return {
    forms,
    loading,
    error,
    refetch: fetchForms,
    createForm,
    updateForm,
    deleteForm,
    getForm,
    submitResponse,
    getResponses,
  };
}
