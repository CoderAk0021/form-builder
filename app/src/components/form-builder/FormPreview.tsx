import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Star, 
  X, 
  Loader2, 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Shield,
  ChevronRight,
  Paperclip,
  Trash2,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Form, Question } from "@/types/form";
import { checkSubmissionStatus, uploadFile } from "../../lib/api";
import { GoogleVerification } from "./GoogleVerification";

interface FormPreviewProps {
  form: Form;
  onSubmit?: (
    answers: Record<string, any>,
    googleToken: Record<string, any>,
  ) => void;
}

export function FormPreview({ form, onSubmit }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleVerification = async (token: string, email: string) => {
    setIsChecking(true);
    try {
      const hasSubmitted = await checkSubmissionStatus(form.id, email);
      if (hasSubmitted && !form.settings.allowMultipleResponses) {
        setAlreadyResponded(true);
      } else {
        setGoogleToken(token);
        setDisplayEmail(email);
        toast.success("Identity verified successfully");
      }
    } catch (error) {
      console.error(error);
      toast.error("Verification failed");
    } finally {
      setIsChecking(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateForm = () => {
    for (const question of form.questions) {
      if (question.required) {
        const value = answers[question.id];
        if (
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          value === ""
        ) {
          toast.error(`Please complete: "${question.title}"`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (form.settings.allowMultipleResponses && !googleToken) {
      toast.error("Please verify your identity first");
      return;
    }
    if (onSubmit) {
      onSubmit(answers, googleToken);
    }
    setSubmitted(true);
  };

  const progress = form.questions.length > 0 
    ? (Object.keys(answers).length / form.questions.length) * 100 
    : 0;

  // --- Submitted State ---
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 rounded-3xl" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="relative w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-6 border border-emerald-500/30"
        >
          <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
          <CheckCircle2 className="w-10 h-10 text-emerald-400 relative z-10" />
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-3 relative z-10">
          {form.settings.confirmationMessage || "Response Submitted"}
        </h3>
        <p className="text-white/50 relative z-10 max-w-md">
          Your response has been securely recorded and encrypted. Thank you for your participation.
        </p>
        
        <div className="mt-8 flex items-center gap-2 text-xs text-white/30 font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>SECURE_TRANSMISSION_COMPLETE</span>
        </div>
      </motion.div>
    );
  }

  // --- Already Responded State ---
  if (alreadyResponded && !form.settings.allowMultipleResponses) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-orange-500/10" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        
        <div className="relative">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono uppercase tracking-wider mb-4">
            Access Denied
          </div>
          
          <h2 className="text-xl font-bold text-white mb-2">Response Already Recorded</h2>
          <p className="text-white/50 mb-2">
            The email <span className="text-white/80 font-medium">{displayEmail}</span> has already submitted a response.
          </p>
          <p className="text-sm text-white/30">
            This form accepts only one response per user.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress Bar */}
      {form.settings.showProgressBar && form.questions.length > 0 && (
        <div className="sticky top-0 z-20 bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5 -mx-6 px-6 py-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Progress</span>
            <span className="text-xs font-mono text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      {/* Verification Block */}
      {form.settings.limitOneResponse && !googleToken && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Identity Verification Required</h3>
                <p className="text-sm text-white/50">Please sign in to continue</p>
              </div>
            </div>
            <GoogleVerification onVerified={handleVerification} />
          </div>
        </div>
      )}

      {/* Verified Status */}
      {googleToken && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white/80">Verified as <span className="text-white font-medium">{displayEmail}</span></p>
          </div>
          <div className="text-xs text-emerald-400/60 font-mono">SECURE</div>
        </motion.div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        <AnimatePresence>
          {form.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <QuestionPreview
                question={question}
                value={answers[question.id]}
                onChange={(value) => handleAnswerChange(question.id, value)}
                index={index + 1}
                setUploading={setIsUploading}
                uploading={isUploading}
                googleToken={googleToken}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Submit Button */}
      {form.questions.length > 0 && (
        <div className="pt-6 border-t border-white/10">
          <Button
            type="submit"
            disabled={(form.settings.limitOneResponse && !googleToken) || isUploading}
            className="w-full relative group bg-white text-black hover:bg-white/90 rounded-xl py-6 font-semibold text-lg transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center justify-center gap-2">
              {form.settings.limitOneResponse && !googleToken ? (
                <>
                  <Lock className="w-5 h-5" />
                  Verify to Submit
                </>
              ) : (
                <>
                  Submit Response
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </Button>
          
          <p className="text-center mt-4 text-xs text-white/30 flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5" />
            End-to-end encrypted • SSL secured
          </p>
        </div>
      )}
    </form>
  );
}

// ----------------------------------------------------------------------
// QUESTION COMPONENT
// ----------------------------------------------------------------------

interface QuestionPreviewProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  index: number;
  setUploading: any;
  uploading: boolean;
  googleToken: string;
}

function QuestionPreview({
  question,
  value,
  onChange,
  index,
  setUploading,
  uploading,
  googleToken,
}: QuestionPreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localFileName, setLocalFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const response = await uploadFile(file);
      onChange(response.url);
      setLocalFileName(file.name);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFileName(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayFileName = localFileName || (typeof value === "string" ? value.split("/").pop() : null);
  const isDisabled = uploading || !googleToken;

  // Input styling for dark theme
  const inputClasses = "w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all";
  const labelClasses = "text-base font-medium text-white flex items-center gap-2";

  return (
    <div className="relative group">
      {/* Question Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-all duration-300">
        {/* Subtle gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative">
          {/* Question Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-sm font-bold text-indigo-300">{index}</span>
            </div>
            <div className="flex-1 pt-1">
              <Label className={labelClasses}>
                {question.title}
                {question.required && <span className="text-red-400">*</span>}
              </Label>
              {question.description && (
                <p className="text-sm text-white/40 mt-1.5 leading-relaxed">{question.description}</p>
              )}
            </div>
          </div>

          {/* Input Area */}
          <div className="pl-12">
            {question.type === "short_text" && (
              <Input
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder || "Type your answer..."}
                required={question.required}
                className={inputClasses}
              />
            )}

            {question.type === "long_text" && (
              <Textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder || "Type your detailed answer..."}
                required={question.required}
                rows={4}
                className={`${inputClasses} resize-none`}
              />
            )}

            {question.type === "email" && (
              <Input
                type="email"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder || "your@email.com"}
                required={question.required}
                className={inputClasses}
              />
            )}

            {question.type === "number" && (
              <Input
                type="number"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                placeholder={question.placeholder || "0"}
                required={question.required}
                className={inputClasses}
              />
            )}

            {question.type === "date" && (
              <Input
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                required={question.required}
                className={`${inputClasses} [color-scheme:dark]`}
              />
            )}

            {question.type === "multiple_choice" && (
              <RadioGroup
                value={value || ""}
                onValueChange={onChange}
                required={question.required}
                className="space-y-3"
              >
                {question.options?.map((option) => (
                  <div 
                    key={option.id} 
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/option cursor-pointer"
                    onClick={() => onChange(option.value)}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.id}
                      className="border-white/20 text-indigo-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500/20"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm text-white/70 group-hover/option:text-white cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === "checkbox" && (
              <div className="space-y-3">
                {question.options?.map((option) => (
                  <div 
                    key={option.id} 
                    className="flex items-center space-x-3 p-3 rounded-xl hover:bg-white/5 transition-colors group/option cursor-pointer"
                    onClick={() => {
                      const currentValues = value || [];
                      if (currentValues.includes(option.value)) {
                        onChange(currentValues.filter((v: string) => v !== option.value));
                      } else {
                        onChange([...currentValues, option.value]);
                      }
                    }}
                  >
                    <Checkbox
                      id={option.id}
                      checked={(value || []).includes(option.value)}
                      className="border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                    />
                    <Label
                      htmlFor={option.id}
                      className="text-sm text-white/70 group-hover/option:text-white cursor-pointer flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            )}

            {question.type === "dropdown" && (
              <Select value={value || ""} onValueChange={onChange} required={question.required}>
                <SelectTrigger className={`${inputClasses} [&>span]:text-white/50`}>
                  <SelectValue placeholder="Select an option" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f14] border-white/10 text-white">
                  {question.options?.map((option) => (
                    <SelectItem 
                      key={option.id} 
                      value={option.value}
                      className="focus:bg-white/5 focus:text-white"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {question.type === "rating" && (
              <div className="flex items-center gap-2">
                {[...Array(question.maxRating || 5)].map((_, i) => (
                  <motion.button
                    key={i}
                    type="button"
                    onClick={() => onChange(i + 1)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="focus:outline-none p-1"
                  >
                    <Star
                      className={`w-8 h-8 transition-all duration-200 ${
                        (value || 0) > i
                          ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                          : "text-white/20 hover:text-white/40"
                      }`}
                    />
                  </motion.button>
                ))}
                {value > 0 && (
                  <span className="ml-3 text-sm font-medium text-amber-400">{value} / {question.maxRating || 5}</span>
                )}
              </div>
            )}

            {question.type === "file_upload" && (
              <div className="space-y-3">
                {value ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                          {displayFileName}
                        </p>
                        <p className="text-xs text-white/40">Ready to submit</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <div
                    onClick={() => !isDisabled && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (!isDisabled) setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (!isDisabled) {
                        const file = e.dataTransfer.files[0];
                        handleFileSelect(file);
                      }
                    }}
                    className={`
                      relative overflow-hidden border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                      ${isDisabled 
                        ? "bg-white/5 border-white/5 cursor-not-allowed opacity-50" 
                        : isDragOver
                          ? "bg-indigo-500/10 border-indigo-500/50 scale-[1.02]"
                          : "bg-white/[0.02] border-white/10 hover:border-indigo-500/30 hover:bg-indigo-500/5 cursor-pointer"
                      }
                    `}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept={question.acceptFileTypes || "*/*"}
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      disabled={isDisabled}
                    />
                    
                    {uploading ? (
                      <div className="flex flex-col items-center">
                        <div className="relative mb-3">
                          <div className="w-10 h-10 border-2 border-indigo-500/30 rounded-full" />
                          <div className="absolute inset-0 w-10 h-10 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                        </div>
                        <p className="text-sm font-medium text-white/60">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-indigo-400" />
                        </div>
                        <p className="text-sm font-medium text-white/70 mb-1">
                          {isDisabled ? "Sign in to upload files" : "Drop file here or click to browse"}
                        </p>
                        <p className="text-xs text-white/40">
                          Supports PDF, DOC, Images up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}