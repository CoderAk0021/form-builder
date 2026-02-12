import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  AlertCircle, 
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { FormPreview } from '@/components/form-builder/FormPreview';
import { Spinner } from '@/components/ui/spinner';
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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner className="size-5 text-zinc-400" />
            <h2 className="text-zinc-300 text-sm font-medium tracking-tight">Loading form</h2>
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full border border-zinc-800 bg-zinc-900 p-8 md:p-10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 border border-zinc-700 bg-zinc-950 mb-6">
              <AlertCircle className="w-6 h-6 text-zinc-400" />
            </div>
            
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-zinc-800 bg-zinc-950 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-4">
              <span className="w-1.5 h-1.5 bg-zinc-500" />
              Error
            </div>
            
            <h2 className="text-xl font-semibold text-zinc-100 mb-3 tracking-tight">{error}</h2>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed">
              Unable to access the requested form. Please verify the URL or contact the administrator.
            </p>
            
            <button 
              onClick={() => window.location.reload()}
              className="group w-full py-3 px-6 border border-zinc-700 bg-zinc-950 text-zinc-300 text-sm font-medium hover:bg-zinc-900 hover:border-zinc-600 transition-colors"
            >
              <span className="flex items-center justify-center gap-2">
                Try Again
                <ArrowRight className="w-4 h-4 text-zinc-500" />
              </span>
            </button>
          </div>
          
          <p className="text-center mt-6 text-zinc-700 text-xs font-mono uppercase">
            Ref: {formId ? formId.substring(0, 8).toUpperCase() : 'NULL'}
          </p>
        </div>
      </div>
    );
  }

  if (!form) return null;

  // --- Success State ---
  return (
    <div className="min-h-screen bg-zinc-950 selection:bg-zinc-700 selection:text-zinc-100">
      <div className="">
        <div className="w-full mx-auto ">
          <div className="">
            {/* Top Accent Line */}
            <div className="h-[1px] bg-zinc-700" />
            
            {/* Form Content */}
            <div className="">
              <FormPreview form={form} onSubmit={handleSubmit} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}