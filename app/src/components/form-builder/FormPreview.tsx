import { useState, useRef } from "react";
import {
  Star,
  X,
  Loader,
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
import type { Answer, Form, Question } from "@/types/form";
import { checkSubmissionStatus, uploadFile } from "../../lib/api";
import { GoogleVerification } from "./GoogleVerification";

interface FormPreviewProps {
  form: Form;
  onSubmit?: (
    answers: Record<string, unknown>,
    googleToken: string,
  ) => void | Promise<void>;
}

export function FormPreview({ form, onSubmit }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, Answer["value"]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [displayEmail, setDisplayEmail] = useState<string | null>(null);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleVerification = async (token: string, email: string) => {
    try {
      const hasSubmitted = await checkSubmissionStatus(form.id, email);
      if (hasSubmitted && !form.settings.allowMultipleResponses) {
        setAlreadyResponded(true);
      } else {
        setGoogleToken(token);
        setDisplayEmail(email);
        toast.success("Authentication successful", {
          icon: <Shield className="w-4 h-4" />,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Unable to verify submission status");
    }
  };

  const handleAnswerChange = (questionId: string, value: Answer["value"]) => {
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
          toast.error(`Required field: ${question.title}`, {
            icon: <AlertCircle className="w-4 h-4" />,
          });
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) return;
    if (!googleToken && form.settings.limitOneResponse) {
      toast.error("Authentication required");
      return;
    }
    try {
      setIsSubmitting(true);
      if (onSubmit && googleToken) {
        await onSubmit(answers, googleToken);
      }
      setSubmitted(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit form";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress =
    form.questions.length > 0
      ? (Object.keys(answers).length / form.questions.length) * 100
      : 0;

  // Success State
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 md:p-12 bg-zinc-950">
        <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2
            className="w-8 h-8 md:w-10 md:h-10 text-emerald-500"
            strokeWidth={1.5}
          />
        </div>

        <h3 className="text-xl md:text-2xl font-semibold text-zinc-100 mb-3 tracking-tight">
          {form.settings.confirmationMessage || "Submission Received"}
        </h3>

        <p className="text-zinc-400 text-sm md:text-base max-w-md">
          Your response has been securely recorded. Thank you for your
          participation.
        </p>
      </div>
    );
  }

  // Already Responded State
  if (alreadyResponded && !form.settings.allowMultipleResponses) {
    return (
      <div className="flex items-center justify-center w-full h-screen p-6">
        <div className="max-w-2xl mx-auto mt-8 md:mt-12 p-6 md:p-10 border border-zinc-800 bg-zinc-950 rounded-md">
          <div className="text-center">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle
                className="w-7 h-7 md:w-8 md:h-8 text-red-500"
                strokeWidth={1.5}
              />
            </div>

            <h2 className="text-lg md:text-xl font-semibold text-zinc-100 mb-3 tracking-tight">
              Response Limit Reached
            </h2>

            <p className="text-zinc-400 text-sm md:text-base mb-2">
              A submission has already been recorded for{" "}
              <span className="text-zinc-200 font-medium">
                {displayEmail || "this account"}
              </span>
            </p>

            <p className="text-xs text-zinc-500 mt-6 pt-4 border-t border-zinc-800">
              This form accepts only one response per verified identity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-700">
      <form onSubmit={handleSubmit} className="max-w-full p-6 lg:p-12 ">
        {/* Form Header */}
        <div className="mb-8 md:mb-12 border-b border-zinc-800 pb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-3 tracking-tight">
            {form.title}
          </h1>

          {form.description && (
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-2xl">
              {form.description}
            </p>
          )}
        </div>

        {/* Progress Bar */}
        {form.settings.showProgressBar && form.questions.length > 0 && (
          <div className="mb-8 md:mb-12 space-y-2">
            <div className="flex justify-between text-xs md:text-sm text-zinc-500">
              <span>Completion</span>
              <span className="font-medium text-zinc-300">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-100 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-zinc-600 text-right">
              {Object.keys(answers).length} of {form.questions.length} fields
              completed
            </p>
          </div>
        )}

        {/* Verification Block */}
        {form.settings.limitOneResponse && !googleToken && (
          <div className="mb-8 md:mb-12">
            <GoogleVerification onVerified={handleVerification} />
          </div>
        )}

        {/* Verified Badge */}
        {googleToken && (
          <div className="flex items-center gap-3 p-4 mb-8 md:mb-12 border border-zinc-800 bg-zinc-900/50 text-zinc-300 rounded-md">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">
                Identity Verified
              </p>
              <p className="text-xs text-zinc-500 truncate">
                Authenticated as{" "}
                <span className="text-zinc-300">{displayEmail}</span>
              </p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          </div>
        )}

        {/* Questions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 md:gap-6">
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
          <div className="mt-8 md:mt-12 pt-8 border-t border-zinc-800 flex justify-end">
            <Button
              type="submit"
              disabled={
                (form.settings.limitOneResponse && !googleToken) ||
                isUploading ||
                isSubmitting
              }
              className="w-full max-w-md rounded-md h-12 md:h-14 text-sm md:text-base font-medium bg-zinc-100 text-zinc-950 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Submitting...
                </span>
              ) : isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  Processing Upload...
                </span>
              ) : form.settings.limitOneResponse && !googleToken ? (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  Verify Identity to Continue
                </span>
              ) : (
                "Submit Response"
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------
// QUESTION PREVIEW COMPONENT
// ---------------------------------------------------------------------

interface QuestionPreviewProps {
  question: Question;
  value: Answer["value"];
  onChange: (value: Answer["value"]) => void;
  index: number;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  uploading: boolean;
  googleToken: string | null;
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
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
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
  const textValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const selectValue = typeof value === "string" ? value : "";
  const checkboxValues = Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
  const ratingValue = typeof value === "number" ? value : Number(value) || 0;

  return (
    <div className="border rounded-lg border-zinc-800 bg-zinc-900/30 p-5 md:p-6 hover:border-zinc-700 transition-colors">
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-500">
          {index}
        </div>

        <div className="flex-1 min-w-0">
          <Label className="text-sm md:text-base font-medium text-zinc-200 flex items-center gap-2 flex-wrap break-words">
            {question.title}
            {question.required && (
              <span className="text-red-400 text-xs">*</span>
            )}
          </Label>

          {question.description && (
            <p className="text-xs text-zinc-500 mt-1 leading-relaxed break-words">
              {question.description}
            </p>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        {question.type === "short_text" && (
          <Input
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter your response"}
            required={question.required}
            className="h-11 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 rounded-md transition-colors"
          />
        )}

        {question.type === "long_text" && (
          <Textarea
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter detailed response"}
            required={question.required}
            rows={4}
            className="bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 rounded-md resize-none transition-colors"
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "name@organization.com"}
            required={question.required}
            className="h-11 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 rounded-md transition-colors"
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "0"}
            required={question.required}
            className="h-11 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 rounded-md transition-colors"
          />
        )}

        {question.type === "date" && (
          <Input
            type="date"
            value={selectValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="h-11 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:ring-0 rounded-md transition-colors [color-scheme:dark]"
          />
        )}

        {question.type === "multiple_choice" && (
          <RadioGroup
            value={selectValue}
            onValueChange={onChange}
            required={question.required}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-colors group"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.id}
                  className="border-zinc-600 text-zinc-100 data-[state=checked]:border-zinc-100 data-[state=checked]:bg-zinc-100 flex-shrink-0"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors break-words flex-1">
                  {option.label}
                </span>
              </label>
            ))}
          </RadioGroup>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 p-3 border border-zinc-800 bg-zinc-950 hover:border-zinc-700 cursor-pointer transition-colors group"
              >
                <Checkbox
                  id={option.id}
                  checked={checkboxValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = checkboxValues;
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(
                        currentValues.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                  className="border-zinc-600 data-[state=checked]:bg-zinc-100 data-[state=checked]:border-zinc-100 flex-shrink-0"
                />
                <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors break-words flex-1">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <Select
            value={selectValue}
            onValueChange={onChange}
            required={question.required}
          >
            <SelectTrigger className="h-11 bg-zinc-950 border-zinc-800 text-zinc-100 hover:bg-zinc-900  focus:ring-0 focus:border-zinc-600 rounded-md">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-100 rounded-md">
              {question.options?.map((option) => (
                <SelectItem
                  key={option.id}
                  value={option.value}
                  className="focus:bg-zinc-900 focus:text-zinc-100 cursor-pointer rounded-md"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "rating" && (
          <div className="flex items-center gap-1 py-2">
            {[...Array(question.maxRating || 5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                className="focus:outline-none p-1 hover:scale-110 transition-transform"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    ratingValue > i
                      ? "fill-zinc-100 text-zinc-100"
                      : "text-zinc-700 hover:text-zinc-600"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {question.type === "file_upload" && (
          <div className="space-y-3">
            {value ? (
              <div className="flex items-center justify-between p-4 border border-zinc-700 bg-zinc-950">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-300 truncate">
                      {displayFileName || "Attached File"}
                    </p>
                    <p className="text-xs text-zinc-600">
                      Ready for submission
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-2 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isDisabled && fileInputRef.current?.click()}
                className={`
                  relative border-2 border-dashed p-8 text-center transition-all duration-200
                  ${
                    isDisabled
                      ? "border-zinc-800 bg-zinc-950/50 cursor-not-allowed opacity-50"
                      : "border-zinc-700 bg-zinc-950 cursor-pointer hover:border-zinc-500"
                  }
                `}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 r border-zinc-700 border-t-zinc-400 rounded-full animate-spin" />
                    <p className="text-sm text-zinc-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`
                      w-10 h-10 flex items-center justify-center transition-colors
                      ${isDisabled ? "bg-zinc-900" : "bg-zinc-900"}
                    `}
                    >
                      <Upload
                        className={`w-5 h-5 ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}
                      />
                    </div>

                    <div>
                      <p
                        className={`text-sm font-medium ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}
                      >
                        {isDisabled
                          ? "Authentication required to upload"
                          : "Click to upload file"}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        PDF, DOC, PNG, JPG up to 5MB
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
  );
}
