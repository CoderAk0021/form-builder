import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
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
      googleToken: z.string().min(1, 'Please verify your identity before submitting'),
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
            message: `Please fill out: "${question.title}"`,
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
          setError('This form is currently offline');
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
    setError('Form not found');
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
        getFirstErrorMessage(errors) || 'Please complete all required fields before submitting';
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
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-sm rounded-2xl  p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col items-center gap-3 text-center">
            <Spinner className="size-6 text-indigo-400" />
            <h2 className="text-white/90 font-medium">Loading form</h2>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px]" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 overflow-hidden">
            {/* Animated border gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10 opacity-50" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-6 relative">
                <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                <AlertCircle className="w-8 h-8 text-red-400 relative z-10" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                Error
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-3">{error}</h2>
              <p className="text-white/40 mb-8 leading-relaxed">
                We couldn't access the requested form. Please check the URL or contact the form owner.
              </p>
              
              <button 
                onClick={() => window.location.reload()}
                className="group relative w-full py-3 px-6 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  Try Again
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </div>
          </div>
          
          <p className="text-center mt-6 text-white/20 text-xs font-mono">
            ERROR_CODE: {formId ? formId.substring(0, 8).toUpperCase() : 'UNKNOWN'}
          </p>
        </motion.div>
      </div>
    );
  }

  if (!form) return null;

  // --- Success State ---
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[150px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>
      
      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="relative z-10 py-8 sm:py-12 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mx-auto"
        >
          {/* Main Form Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/50 overflow-hidden"
          >
            {/* Top Accent Line with Animation */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-500 to-indigo-500 opacity-80" />
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent blur-sm" />
            
            {/* Corner Decorations */}
            <div className="absolute top-4 left-4 w-20 h-20 border-l border-t border-white/5 rounded-tl-2xl pointer-events-none" />
            <div className="absolute top-4 right-4 w-20 h-20 border-r border-t border-white/5 rounded-tr-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-20 h-20 border-l border-b border-white/5 rounded-bl-2xl pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-20 h-20 border-r border-b border-white/5 rounded-br-2xl pointer-events-none" />

            {/* Form Content */}
            <div className="relative p-6 sm:p-10">
              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4" />

              {/* Form Component */}
              <FormPreview form={form} onSubmit={handleSubmit} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
