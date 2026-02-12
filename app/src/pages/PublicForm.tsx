import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  AlertCircle,
  Loader,
} from 'lucide-react';
import { toast } from 'sonner';
import { FormPreview } from '@/components/form-builder/FormPreview';
import { useForms } from '@/hooks/useForms';
import type { Form, FormResponse } from '@/types/form';

const answerValueSchema = z.union([
  z.string(),
  z.number(),
  z.array(z.string()),
  z.null(),
]);

const createSubmissionSchema = (form: Form | null) =>
  z
    .object({
      answers: z.record(z.string(), answerValueSchema),
      googleToken: z.string().min(1, 'Authentication required before submitting'),
    })
    .superRefine((data, ctx) => {
      if (!form) return;
      for (const question of form.questions) {
        if (!question.required) continue;
        const value = data.answers[question.id];
        const isMissing =
          value === undefined ||
          value === null ||
          (typeof value === 'string' && value.trim() === '') ||
          (Array.isArray(value) && value.length === 0);
        if (isMissing) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['answers', question.id],
            message: `Required field: ${question.title}`,
          });
        }
      }
    });

type SubmissionPayload = {
  answers: Record<string, z.infer<typeof answerValueSchema>>;
  googleToken: string;
};

export function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const { getForm, submitResponse } = useForms({ autoFetch: false });
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const validationSchema = useMemo(() => createSubmissionSchema(form), [form]);
  
  const { setValue, handleSubmit: handleValidationSubmit } = useForm<SubmissionPayload>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      answers: {},
      googleToken: '',
    },
  });

  const loadForm = useCallback(async () => {
    if (!formId) return;
    try {
      const foundForm = await getForm(formId, { suppressToast: true });
      if (foundForm) {
        if (foundForm.isPublished) {
          setForm(foundForm);
        } else {
          setError('This form is currently unavailable');
        }
      } else {
        setError('Form not found');
      }
    } catch {
      setError('Connection failed');
    } finally {
      setLoading(false);
    }
  }, [formId, getForm]);

  useEffect(() => {
    if (formId) {
      loadForm();  
      return;
    }
    setError('Invalid form identifier');
    setLoading(false);
  }, [formId, loadForm]);

  const getFirstErrorMessage = (errors: FieldErrors<SubmissionPayload>) => {
    const answerErrors = errors.answers;
    if (answerErrors) {
      for (const answerError of Object.values(answerErrors)) {
        if (answerError && typeof answerError === 'object' && 'message' in answerError) {
          const message = answerError.message;
          if (typeof message === 'string') return message;
        }
      }
    }
    return errors.googleToken?.message || null;
  };

  const submitValidatedResponse = handleValidationSubmit(
    async (values) => {
      if (!formId) return;
      const responseData: FormResponse['answers'] = Object.entries(values.answers).map(
        ([questionId, value]) => ({
          questionId,
          value: value as FormResponse['answers'][number]['value'],
        })
      );
      await submitResponse(formId, {
        answers: responseData,
        googleToken: values.googleToken,
      });
    },
    (errors) => {
      const errorMessage =
        getFirstErrorMessage(errors) || 'Please complete all required fields';
      toast.error(errorMessage);
    }
  );

  const handleSubmit = async (answers: Record<string, unknown>, googleToken: string) => {
    setValue('answers', answers as SubmissionPayload['answers'], { shouldValidate: true });
    setValue('googleToken', googleToken, { shouldValidate: true });
    await submitValidatedResponse();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader className="h-4 w-4 animate-spin" />
          Loading form
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950">
            <AlertCircle className="h-6 w-6 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-100">{error}</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Unable to access the requested form. Please verify the URL or contact the administrator.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex h-10 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 px-4 text-sm text-zinc-300 hover:bg-zinc-900"
          >
            Try Again
          </button>
          <p className="mt-5 text-xs font-mono uppercase text-zinc-700">
            Ref: {formId ? formId.substring(0, 8).toUpperCase() : 'NULL'}
          </p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-8 selection:bg-zinc-700 selection:text-zinc-100 sm:px-6">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 sm:p-6">
          <FormPreview form={form} onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
