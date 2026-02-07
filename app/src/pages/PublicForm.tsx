import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Fingerprint,
  Cpu,
  Wifi,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { FormPreview } from '@/components/form-builder/FormPreview';
import { useForms } from '@/hooks/useForms';
import type { FormResponse } from '@/types/form';

export function PublicForm() {
  const { formId } = useParams<{ formId: string }>();
  const { getForm, submitResponse } = useForms();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (formId) {
      loadForm();
      // Simulate progress for visual effect
      const interval = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 100 : prev + Math.random() * 15));
      }, 200);
      return () => clearInterval(interval);
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
          setError('This form is currently offline');
        }
      } else {
        setError('Form not found');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleSubmit = async (answers: Record<string, any>, googleToken: string) => {
    if (!formId) return;
    const responseData: FormResponse['answers'] = Object.entries(answers).map(
      ([questionId, value]) => ({
        questionId,
        value,
      })
    );
    await submitResponse(formId, { 
      answers: responseData, 
      googleToken: googleToken 
    });
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center relative overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a0f_100%)]" />
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px] animate-pulse delay-1000" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center max-w-md w-full px-6"
        >
          {/* Logo animation */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center backdrop-blur-sm">
              <Fingerprint className="w-10 h-10 text-indigo-400" />
            </div>
            
            {/* Orbiting dots */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-4"
            >
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            </motion.div>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 -m-8"
            >
              <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/50" />
            </motion.div>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-xs mb-6">
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-[10px] font-mono text-white/30 uppercase tracking-wider">
              <span>Initializing</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h2 className="text-white/90 font-medium mb-2">Secure Connection</h2>
            <p className="text-white/40 text-sm">Establishing encrypted channel...</p>
          </motion.div>

          {/* Loading indicators */}
          <div className="flex items-center gap-3 mt-8">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  delay: i * 0.2 
                }}
                className="w-2 h-2 rounded-full bg-indigo-500"
              />
            ))}
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
              {/* Form Header Info */}
              <div className="mb-0">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl sm:text-3xl font-bold text-white mb-2 leading-tight"
                >
                  {form.title}
                </motion.h1>
                
                {form.description && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-white/50 leading-relaxed"
                  >
                    {form.description}
                  </motion.p>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-4" />

              {/* Form Component */}
              <FormPreview form={form} onSubmit={handleSubmit} />
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30 font-mono"
          >
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Protected by reCAPTCHA
              </span>
              <span className="hidden sm:inline text-white/10">|</span>
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                ID: {formId?.substring(0, 8).toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span>Powered by</span>
              <span className="text-white/50 hover:text-indigo-400 transition-colors cursor-default font-semibold">
                FormCraft
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}