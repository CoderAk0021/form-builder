import { useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Loader,
  Shield,
  Star,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { checkSubmissionStatus, uploadFile } from "@/lib/api";
import type { Answer, Form, Question } from "@/types/form";
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
          icon: <Shield className="h-4 w-4" />,
        });
      }
    } catch {
      toast.error("Unable to verify submission status");
    }
  };

  const handleAnswerChange = (questionId: string, value: Answer["value"]) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const validateForm = () => {
    for (const question of form.questions) {
      if (!question.required) continue;
      const value = answers[question.id];
      if (!value || (Array.isArray(value) && value.length === 0) || value === "") {
        toast.error(`Required field: ${question.title}`, {
          icon: <AlertCircle className="h-4 w-4" />,
        });
        return false;
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

  if (submitted) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-emerald-800 bg-emerald-950/40">
          <CheckCircle2 className="h-7 w-7 text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">
          {form.settings.confirmationMessage || "Submission Received"}
        </h3>
        <p className="mt-2 text-sm text-zinc-400">
          Your response has been securely recorded.
        </p>
      </div>
    );
  }

  if (alreadyResponded && !form.settings.allowMultipleResponses) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-red-800 bg-red-950/30">
          <AlertCircle className="h-7 w-7 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-100">Response Limit Reached</h3>
        <p className="mt-2 text-sm text-zinc-400">
          A response already exists for{" "}
          <span className="text-zinc-200">{displayEmail || "this account"}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 sm:p-6">
        <h1 className="text-xl font-semibold text-zinc-100 sm:text-2xl">{form.title}</h1>
        {form.description && (
          <p className="mt-2 text-sm leading-relaxed text-zinc-400">{form.description}</p>
        )}
      </div>

      {form.settings.showProgressBar && form.questions.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="mb-2 flex items-center justify-between text-xs text-zinc-500">
            <span>Completion</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full rounded-full bg-zinc-100" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {form.settings.limitOneResponse && !googleToken && (
        <GoogleVerification onVerified={handleVerification} />
      )}

      {googleToken && (
        <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-800 bg-emerald-950/40">
            <Shield className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-100">Identity Verified</p>
            <p className="text-xs text-zinc-500">{displayEmail}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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

      {form.questions.length > 0 && (
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={
              (form.settings.limitOneResponse && !googleToken) ||
              isUploading ||
              isSubmitting
            }
            className="h-11 w-full max-w-md rounded-md bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Submitting...
              </span>
            ) : isUploading ? (
              <span className="inline-flex items-center gap-2">
                <Loader className="h-4 w-4 animate-spin" />
                Processing Upload...
              </span>
            ) : form.settings.limitOneResponse && !googleToken ? (
              <span className="inline-flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Verify Identity to Continue
              </span>
            ) : (
              "Submit Response"
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

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
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-400">
          {index}
        </div>
        <div className="min-w-0">
          <Label className="text-sm font-medium text-zinc-200">
            {question.title}
            {question.required && <span className="ml-1 text-red-400">*</span>}
          </Label>
          {question.description && (
            <p className="mt-1 text-xs text-zinc-500">{question.description}</p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {question.type === "short_text" && (
          <Input
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter your response"}
            required={question.required}
            className="h-10 rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "long_text" && (
          <Textarea
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter detailed response"}
            required={question.required}
            rows={4}
            className="resize-none rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "name@organization.com"}
            required={question.required}
            className="h-10 rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "0"}
            required={question.required}
            className="h-10 rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "date" && (
          <Input
            type="date"
            value={selectValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="h-10 rounded-md border-zinc-800 bg-zinc-950 text-zinc-100 [color-scheme:dark]"
          />
        )}

        {question.type === "multiple_choice" && (
          <RadioGroup value={selectValue} onValueChange={onChange} className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-3"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.id}
                  className="border-zinc-600 data-[state=checked]:border-zinc-100 data-[state=checked]:bg-zinc-100"
                />
                <span className="text-sm text-zinc-300">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-zinc-800 bg-zinc-950 p-3"
              >
                <Checkbox
                  id={option.id}
                  checked={checkboxValues.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = checkboxValues;
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(currentValues.filter((v) => v !== option.value));
                    }
                  }}
                  className="border-zinc-600 data-[state=checked]:border-zinc-100 data-[state=checked]:bg-zinc-100"
                />
                <span className="text-sm text-zinc-300">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <Select value={selectValue} onValueChange={onChange}>
            <SelectTrigger className="h-10 rounded-md border-zinc-800 bg-zinc-950 text-zinc-100">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-zinc-800 bg-zinc-950 text-zinc-100">
              {question.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "rating" && (
          <div className="flex items-center gap-1 py-1">
            {[...Array(question.maxRating || 5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                className="rounded p-1"
              >
                <Star
                  className={`h-5 w-5 ${
                    ratingValue > i
                      ? "fill-zinc-100 text-zinc-100"
                      : "text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {question.type === "file_upload" && (
          <div className="space-y-3">
            {value ? (
              <div className="flex items-center justify-between rounded-md border border-zinc-700 bg-zinc-950 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded border border-zinc-800 bg-zinc-900">
                    <FileText className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-300">
                      {displayFileName || "Attached File"}
                    </p>
                    <p className="text-xs text-zinc-600">Ready for submission</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="rounded p-1 text-zinc-500 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => !isDisabled && fileInputRef.current?.click()}
                className={`rounded-md border-2 border-dashed p-6 text-center ${
                  isDisabled
                    ? "cursor-not-allowed border-zinc-800 bg-zinc-950/60 opacity-60"
                    : "cursor-pointer border-zinc-700 bg-zinc-950"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader className="h-5 w-5 animate-spin text-zinc-500" />
                    <p className="text-sm text-zinc-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload
                      className={`h-5 w-5 ${isDisabled ? "text-zinc-600" : "text-zinc-400"}`}
                    />
                    <p
                      className={`text-sm ${
                        isDisabled ? "text-zinc-600" : "text-zinc-400"
                      }`}
                    >
                      {isDisabled
                        ? "Authentication required to upload"
                        : "Click to upload file"}
                    </p>
                    <p className="text-xs text-zinc-600">PDF, DOC, PNG, JPG up to 5MB</p>
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
