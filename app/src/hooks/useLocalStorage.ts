import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
      }
    }
  }, [key]);

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue];
}

export function useForms() {
  const [forms, setForms] = useLocalStorage<Form[]>('formcraft_forms', []);
  const [responses, setResponses] = useLocalStorage<FormResponse[]>('formcraft_responses', []);

  const addForm = useCallback((form: Form) => {
    setForms(prev => [form, ...prev]);
  }, [setForms]);

  const updateForm = useCallback((formId: string, updates: Partial<Form>) => {
    setForms(prev => prev.map(form => 
      form.id === formId 
        ? { ...form, ...updates, updatedAt: new Date().toISOString() }
        : form
    ));
  }, [setForms]);

  const deleteForm = useCallback((formId: string) => {
    setForms(prev => prev.filter(form => form.id !== formId));
    setResponses(prev => prev.filter(response => response.formId !== formId));
  }, [setForms, setResponses]);

  const getForm = useCallback((formId: string) => {
    return forms.find(form => form.id === formId);
  }, [forms]);

  const addResponse = useCallback((response: FormResponse) => {
    setResponses(prev => [response, ...prev]);
    setForms(prev => prev.map(form => 
      form.id === response.formId 
        ? { ...form, responseCount: form.responseCount + 1 }
        : form
    ));
  }, [setForms, setResponses]);

  const getResponses = useCallback((formId: string) => {
    return responses.filter(response => response.formId === formId);
  }, [responses]);

  return {
    forms,
    addForm,
    updateForm,
    deleteForm,
    getForm,
    addResponse,
    getResponses,
  };
}

import type { Form, FormResponse } from '@/types/form';
