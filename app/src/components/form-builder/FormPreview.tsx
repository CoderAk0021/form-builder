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
  Shield,
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

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
        toast.success("Identity verified successfully", {
          icon: <Shield className="w-4 h-4" />,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify submission status");
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
          toast.error(`Please fill out: "${question.title}"`, {
            icon: <AlertCircle className="w-4 h-4" />,
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!googleToken && !form.settings.allowMultipleResponses) {
      toast.error("Please sign in first");
      return;
    }
    if (onSubmit) {
      onSubmit(answers, googleToken);
    }
    setSubmitted(true);
  };

  const progress =
    form.questions.length > 0
      ? (Object.keys(answers).length / form.questions.length) * 100
      : 0;

  // Success State
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="min-h-[500px] flex flex-col items-center justify-center text-center p-4 md:p-8 relative overflow-hidden"
      >
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10 pointer-events-none" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="relative w-20 h-20 md:w-24 md:h-24 mb-6 md:mb-8"
        >
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/25">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
          </div>
        </motion.div>

        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4 px-4"
        >
          {form.settings.confirmationMessage || "Thank you for your response!"}
        </motion.h3>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-base md:text-lg max-w-md px-4"
        >
          Your submission has been recorded successfully.
        </motion.p>
      </motion.div>
    );
  }

  // Already Responded State
  if (alreadyResponded && !form.settings.allowMultipleResponses) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto mt-6 md:mt-10 p-6 md:p-8 relative overflow-hidden rounded-2xl border border-red-500/20 bg-red-950/10 backdrop-blur-sm mx-4"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 pointer-events-none" />

        <div className="relative text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20 rotate-3 hover:rotate-0 transition-transform duration-300">
            <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
            Response Already Received
          </h2>

          <p className="text-gray-400 text-base md:text-lg mb-2">
            The email{" "}
            <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded break-all">
              {displayEmail || "associated with your account"}
            </span>{" "}
            has already submitted a response.
          </p>

          <p className="text-sm text-gray-500 mt-6 border-t border-white/10 pt-4">
            This form is limited to one response per person.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-gray-100 font-sans selection:bg-indigo-500/30">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.form
        onSubmit={handleSubmit}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6 md:space-y-8"
      >

        {/* Progress Bar */}
        {form.settings.showProgressBar && form.questions.length > 0 && (
          <motion.div variants={itemVariants} className="space-y-3 px-1">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Progress</span>
              <span className="font-medium text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
              />
            </div>
            <p className="text-xs text-gray-500 text-right">
              {Object.keys(answers).length} of {form.questions.length} answered
            </p>
          </motion.div>
        )}

        {/* Verification Block */}
        <AnimatePresence mode="wait">
          {form.settings.limitOneResponse && !googleToken && (
            <motion.div
              key="verification"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              variants={itemVariants}
            >
              <GoogleVerification onVerified={handleVerification} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Verified Badge */}
        <AnimatePresence>
          {googleToken && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-300">
                  Identity Verified
                </p>
                <p className="text-xs text-emerald-400/70 truncate">
                  Responding as{" "}
                  <span className="text-emerald-300 font-semibold">
                    {displayEmail}
                  </span>
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions */}
        <div className="space-y-6">
          {form.questions.map((question, index) => (
            <QuestionPreview
              key={question.id}
              question={question}
              value={answers[question.id]}
              onChange={(value) => handleAnswerChange(question.id, value)}
              index={index + 1}
              setUploading={setIsUploading}
              uploading={isUploading}
              googleToken={googleToken}
            />
          ))}
        </div>

        {/* Submit Button */}
        {form.questions.length > 0 && (
          <motion.div variants={itemVariants} className="pt-4 md:pt-8 pb-10">
            <Button
              type="submit"
              disabled={
                (form.settings.limitOneResponse && !googleToken) || isUploading
              }
              className="group relative w-full h-12 md:h-14 text-base md:text-lg font-semibold rounded-xl overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {/* Button gradient background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] group-hover:bg-[position:100%_0] transition-all duration-500" />

              {/* Glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_70%)]" />

              {/* Content */}
              <span className="relative flex items-center justify-center gap-2 text-white">
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : form.settings.limitOneResponse && !googleToken ? (
                  <>
                    <Shield className="w-5 h-5" />
                    Verify to Submit
                  </>
                ) : (
                  <>
                    Submit Response
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      className="inline-block"
                    >
                      →
                    </motion.span>
                  </>
                )}
              </span>
            </Button>

            <p className="text-center text-xs text-gray-500 mt-4 hidden md:block">
              Press Enter ↵ to submit
            </p>
          </motion.div>
        )}
      </motion.form>
    </div>
  );
}

// ---------------------------------------------------------------------
// QUESTION PREVIEW COMPONENT
// ---------------------------------------------------------------------

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

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;
    try {
      setUploading(true);
      const response = await uploadFile(file);
      onChange(response.url);
      setLocalFileName(file.name);
      toast.success("File uploaded successfully");
    } catch (error: any) {
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

  const displayFileName =
    localFileName ||
    (typeof value === "string" ? value.split("/").pop() : null);
  const isDisabled = uploading || !googleToken;

  return (
    <motion.div
      variants={itemVariants}
      className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-5 md:p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative">
        {/* Question Header */}
        <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-5">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 flex items-center justify-center text-xs md:text-sm font-bold text-indigo-300 mt-0.5 md:mt-0">
            {index}
          </div>

          <div className="flex-1 pt-0.5 md:pt-1 min-w-0">
            <Label className="text-base md:text-lg font-semibold text-gray-100 flex items-center gap-2 flex-wrap break-words">
              {question.title}
              {question.required && (
                <span className="text-red-400 text-sm font-medium">*</span>
              )}
            </Label>

            {question.description && (
              <p className="text-xs md:text-sm text-gray-500 mt-1 leading-relaxed break-words">
                {question.description}
              </p>
            )}
          </div>
        </div>

        {/* Input Area */}
        {/* On mobile: full width (ml-0), On desktop: indented (ml-12) */}
        <div className="ml-0 md:ml-12 mt-3 md:mt-0 space-y-3">
          {question.type === "short_text" && (
            <Input
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || "Type your answer..."}
              required={question.required}
              className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all"
            />
          )}

          {question.type === "long_text" && (
            <Textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || "Type your answer..."}
              required={question.required}
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl resize-none transition-all"
            />
          )}

          {question.type === "email" && (
            <Input
              type="email"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || "name@example.com"}
              required={question.required}
              className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all"
            />
          )}

          {question.type === "number" && (
            <Input
              type="number"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={question.placeholder || "0"}
              required={question.required}
              className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all"
            />
          )}

          {question.type === "date" && (
            <Input
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              required={question.required}
              className="h-11 md:h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl transition-all [color-scheme:dark]"
            />
          )}

          {question.type === "multiple_choice" && (
            <RadioGroup
              value={value || ""}
              onValueChange={onChange}
              required={question.required}
              className="space-y-2 md:space-y-3"
            >
              {question.options?.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start md:items-center gap-3 p-3 md:p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 cursor-pointer transition-all group/item"
                >
                  <RadioGroupItem
                    value={option.value}
                    id={option.id}
                    className="mt-0.5 md:mt-0 border-white/20 text-indigo-400 data-[state=checked]:border-indigo-500 data-[state=checked]:bg-indigo-500 flex-shrink-0"
                  />
                  <span className="text-sm md:text-base text-gray-300 group-hover/item:text-white transition-colors break-words flex-1">
                    {option.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          )}

          {question.type === "checkbox" && (
            <div className="space-y-2 md:space-y-3">
              {question.options?.map((option) => (
                <label
                  key={option.id}
                  className="flex items-start md:items-center gap-3 p-3 md:p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-indigo-500/30 cursor-pointer transition-all group/item"
                >
                  <Checkbox
                    id={option.id}
                    checked={(value || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentValues = value || [];
                      if (checked) {
                        onChange([...currentValues, option.value]);
                      } else {
                        onChange(
                          currentValues.filter(
                            (v: string) => v !== option.value,
                          ),
                        );
                      }
                    }}
                    className="mt-0.5 md:mt-0 border-white/20 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500 flex-shrink-0"
                  />
                  <span className="text-sm md:text-base text-gray-300 group-hover/item:text-white transition-colors break-words flex-1">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          )}

          {question.type === "dropdown" && (
            <Select
              value={value || ""}
              onValueChange={onChange}
              required={question.required}
            >
              <SelectTrigger className="h-11 md:h-12 bg-white/5 border-white/10 text-white hover:bg-white/[0.08] rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500/50">
                <SelectValue placeholder="Select an option..." />
              </SelectTrigger>
              <SelectContent className="bg-[#0f0f15] border-white/10 text-white rounded-xl">
                {question.options?.map((option) => (
                  <SelectItem
                    key={option.id}
                    value={option.value}
                    className="focus:bg-white/10 focus:text-white rounded-lg cursor-pointer"
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {question.type === "rating" && (
            <div className="flex items-center gap-1 md:gap-2 py-2 flex-wrap">
              {[...Array(question.maxRating || 5)].map((_, i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => onChange(i + 1)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="focus:outline-none p-1"
                >
                  <Star
                    className={`w-7 h-7 md:w-8 md:h-8 transition-all duration-200 ${
                      (value || 0) > i
                        ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                        : "text-gray-700 hover:text-gray-600"
                    }`}
                  />
                </motion.button>
              ))}
            </div>
          )}

          {question.type === "file_upload" && (
            <div className="space-y-3">
              {value ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {displayFileName || "Attached File"}
                      </p>
                      <p className="text-xs text-gray-500">Ready to submit</p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handleRemoveFile}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ) : (
                <div
                  onClick={() => !isDisabled && fileInputRef.current?.click()}
                  className={`
                    relative overflow-hidden rounded-xl border-2 border-dashed p-6 md:p-8 text-center transition-all duration-300
                    ${
                      isDisabled
                        ? "border-white/5 bg-white/[0.02] cursor-not-allowed opacity-50"
                        : "border-white/10 bg-white/[0.02] cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5"
                    }
                  `}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                      </div>
                      <p className="text-sm text-gray-400">
                        Uploading your file...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`
                        w-12 h-12 rounded-xl flex items-center justify-center transition-colors
                        ${isDisabled ? "bg-white/5" : "bg-indigo-500/10"}
                      `}
                      >
                        <Upload
                          className={`w-6 h-6 ${isDisabled ? "text-gray-600" : "text-indigo-400"}`}
                        />
                      </div>

                      <div>
                        <p
                          className={`text-sm font-medium ${isDisabled ? "text-gray-500" : "text-gray-300"}`}
                        >
                          {isDisabled
                            ? "Sign in to upload files"
                            : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          PDF, DOC, Images up to 5MB
                        </p>
                      </div>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept={question.acceptFileTypes || "*/*"}
                    onChange={(e) => handleFileSelect(e.target.files?.[0])}
                    disabled={isDisabled}
                    required={question.required && !value}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}