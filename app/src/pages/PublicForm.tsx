import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { FormPreview } from '@/components/form-builder/FormPreview';
import { useForms } from '@/hooks/useForms';
import type { FormResponse } from '@/types/form';
import {uploadFile} from '../lib/api'

export function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const { getForm, submitResponse } = useForms();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (formId) {
      loadForm();
    }
  }, [formId]);

  const loadForm = async () => {
    if (!formId) return;
    try {
      const foundForm = await getForm(formId);
      if (foundForm) {
        if (foundForm.isPublished) {
          setForm(foundForm);
        } else {
          setError('This form is not currently accepting responses.');
        }
      } else {
        setError('Form not found.');
      }
    } catch (err) {
      setError('Failed to load form.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (answers: Record<string, any>) => {
    if (!formId) return;

    const responseData: FormResponse['answers'] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );

    await submitResponse(formId, { answers: responseData });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center"
        >
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
          <p className="text-gray-500">Loading form...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 max-w-md w-full text-center"
        >
          <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-500">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8">
          <FormPreview form={form} onSubmit={handleSubmit} />
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-400">
            Powered by{' '}
            <span className="font-semibold text-purple-600">FormCraft</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
