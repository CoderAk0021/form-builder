import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Star, X, Loader2, FileText, Upload } from "lucide-react";
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
import { AlertCircle } from "lucide-react";

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

  const handleVerification = async (token: string, email: string) => {
    setIsChecking(true);

    try {
      // 1. Ask Backend: Has this email submitted this specific form?
      const hasSubmitted = await checkSubmissionStatus(form.id, email);

      if (hasSubmitted) {
        // 2. BLOCK THE USER
        setAlreadyResponded(true);
      } else {
        // 3. ALLOW ACCESS
        setGoogleToken(token);
        setDisplayEmail(email);
        toast.success("Identity verified. You may proceed.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify submission status.");
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
        // Check if value is empty, null, or undefined
        if (
          !value ||
          (Array.isArray(value) && value.length === 0) ||
          value === ""
        ) {
          toast.error(
            `Please fill out the required field: "${question.title}"`,
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    if (form.settings.limitOneResponse && !googleToken) {
      toast.error("Please sign in first.");
      return;
    }
    if (onSubmit) {
      onSubmit(answers, googleToken);
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-[400px] flex flex-col items-center justify-center text-center p-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {form.settings.confirmationMessage || "Thank you for your response!"}
        </h3>
        <p className="text-gray-500">Your response has been recorded.</p>
      </motion.div>
    );
  }

  if (alreadyResponded) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white border border-red-100 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Response Already Received
        </h2>
        <p className="text-gray-500">
          The email{" "}
          <strong>{displayEmail || "associated with your account"}</strong> has
          already submitted a response to this form.
        </p>
        <p className="text-sm text-gray-400 mt-6">
          Forms are limited to one response per person.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Form Header */}
      <div className="border-b border-gray-200 pb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{form.title}</h1>
        {form.description && (
          <p className="text-gray-600">{form.description}</p>
        )}
      </div>

      {/* Progress Bar */}
      {form.settings.showProgressBar && form.questions.length > 0 && (
        <div className="mb-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${(Object.keys(answers).length / form.questions.length) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Object.keys(answers).length} of {form.questions.length} answered
          </p>
        </div>
      )}

      {/* Verification Block */}
      {form.settings.limitOneResponse && !googleToken && (
        <GoogleVerification onVerified={handleVerification} />
      )}

      {/* Show "Signed in as..." if verified */}
      {googleToken && (
        <div className="p-4 bg-green-50 text-green-700 rounded mb-6">
          Verify successful. responding as <strong>{displayEmail}</strong>
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {form.questions.map((question, index) => (
          <QuestionPreview
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => handleAnswerChange(question.id, value)}
            index={index + 1}
          />
        ))}
      </div>

      {/* Submit Button */}
      {form.questions.length > 0 && (
        <div className="pt-6 border-t border-gray-200">
          <Button
            type="submit"
            disabled={form.settings.limitOneResponse && !googleToken}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg
                       font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
          >
            {form.settings.limitOneResponse && !googleToken
              ? "Verify Email to Submit"
              : "Submit"}
          </Button>
        </div>
      )}
    </form>
  );
}

// ----------------------------------------------------------------------
// CHILD COMPONENT
// ----------------------------------------------------------------------

interface QuestionPreviewProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  index: number;
}

function QuestionPreview({
  question,
  value,
  onChange,
  index,
}: QuestionPreviewProps) {
  // === MOVED LOGIC HERE ===
  // Each question gets its own independent upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [localFileName, setLocalFileName] = useState<string | null>(null);

  const handleFileSelect = async (file: File | undefined) => {
    if (!file) return;

    try {
      setIsUploading(true);
      // Upload to server
      const response = await uploadFile(file);

      // Update Parent with URL
      onChange(response.url);

      // Update Local State for UI
      setLocalFileName(file.name);

      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLocalFileName(null);
    onChange(null); // Clear the answer in parent
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Determine what name to show (local state OR if value is already a URL string from DB)
  const displayFileName =
    localFileName ||
    (typeof value === "string" ? value.split("/").pop() : null);

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span
          className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full
                         flex items-center justify-center text-sm font-medium"
        >
          {index}
        </span>
        <div className="flex-1">
          <Label className="text-base font-semibold text-gray-900 flex items-center gap-2">
            {question.title}
            {question.required && <span className="text-red-500">*</span>}
          </Label>
          {question.description && (
            <p className="text-sm text-gray-500 mt-1">{question.description}</p>
          )}
        </div>
      </div>

      <div className="ml-9">
        {question.type === "short_text" && (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Short answer"}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === "long_text" && (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Long answer"}
            required={question.required}
            rows={4}
            className="w-full resize-none"
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "your@email.com"}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "0"}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === "date" && (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === "multiple_choice" && (
          <RadioGroup
            value={value || ""}
            onValueChange={onChange}
            required={question.required}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <Checkbox
                  id={option.id}
                  checked={(value || []).includes(option.value)}
                  onCheckedChange={(checked) => {
                    const currentValues = value || [];
                    if (checked) {
                      onChange([...currentValues, option.value]);
                    } else {
                      onChange(
                        currentValues.filter((v: string) => v !== option.value),
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={option.id}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <Select
            value={value || ""}
            onValueChange={onChange}
            required={question.required}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option.id} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {question.type === "rating" && (
          <div className="flex items-center gap-2">
            {[...Array(question.maxRating || 5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onChange(i + 1)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    (value || 0) > i
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* === FILE UPLOAD SECTION === */}
        {question.type === "file_upload" && (
          <div className="space-y-2">
            {/* If file is uploaded (either local state OR value prop exists) */}
            {value ? (
              <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                    {/* Show display name or just 'Attached File' */}
                    {displayFileName || "Attached File"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              /* If no file, show the upload dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`
                  border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
                  ${isUploading ? "bg-gray-50 border-gray-300" : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"}
                `}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-2" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      Click to upload document
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      PDF, DOC, Images up to 5MB
                    </p>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={question.acceptFileTypes || "*/*"}
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  disabled={isUploading}
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
