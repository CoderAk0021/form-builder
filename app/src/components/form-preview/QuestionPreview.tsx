import { useRef, useState } from "react";
import { FileText, Loader, Star, Upload, X } from "lucide-react";
import { toast } from "sonner";
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
import { uploadFile } from "@/api";
import type { Answer, Question } from "@/types/form";
import type { PreviewDevice } from "./types";

interface QuestionPreviewProps {
  question: Question;
  value: Answer["value"];
  onChange: (value: Answer["value"]) => void;
  index: number;
  previewDevice: PreviewDevice;
  setUploading: React.Dispatch<React.SetStateAction<boolean>>;
  uploading: boolean;
  googleToken: string | null;
  requiresVerification: boolean;
}

export function QuestionPreview({
  question,
  value,
  onChange,
  index,
  previewDevice,
  setUploading,
  uploading,
  googleToken,
  requiresVerification,
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
    localFileName || (typeof value === "string" ? value.split("/").pop() : null);
  const isDisabled = uploading || (requiresVerification && !googleToken);
  const textValue =
    typeof value === "string" || typeof value === "number" ? String(value) : "";
  const selectValue = typeof value === "string" ? value : "";
  const checkboxValues = Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
  const ratingValue = typeof value === "number" ? value : Number(value) || 0;
  const questionCardPaddingClass =
    previewDevice === "auto" ? "p-4 sm:p-5" : previewDevice === "mobile" ? "p-4" : "p-5";

  return (
    <div className={`rounded-xl border border-white/10 bg-black/30 ${questionCardPaddingClass}`}>
      <div className="mb-4 flex items-start gap-3">
        <div className="inline-flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-xs text-zinc-300">
          {index}
        </div>
        <div className="min-w-0">
          <Label className="text-sm font-medium text-zinc-100">
            {question.title}
            {question.required && <span className="ml-1 text-red-400">*</span>}
          </Label>
          {question.description && (
            <p className="mt-1 text-xs text-zinc-400">{question.description}</p>
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
            className="h-10 rounded-md border-white/10 bg-zinc-950/80 px-2 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "long_text" && (
          <Textarea
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "Enter detailed response"}
            required={question.required}
            rows={4}
            className="resize-none rounded-md border-white/10 bg-zinc-950/80 px-2 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "name@organization.com"}
            required={question.required}
            className="h-10 rounded-md border-white/10 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={textValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || "0"}
            required={question.required}
            className="h-10 rounded-md border-white/10 bg-zinc-950/80 text-zinc-100 placeholder:text-zinc-600"
          />
        )}

        {question.type === "date" && (
          <Input
            type="date"
            value={selectValue}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="h-10 rounded-md border-white/10 bg-zinc-950/80 text-zinc-100 [color-scheme:dark]"
          />
        )}

        {question.type === "multiple_choice" && (
          <RadioGroup value={selectValue} onValueChange={onChange} className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-zinc-950/80 p-3"
              >
                <RadioGroupItem
                  value={option.value}
                  id={option.id}
                  className="border-zinc-600 data-[state=checked]:border-zinc-100 data-[state=checked]:bg-zinc-100"
                />
                <span className="text-sm text-zinc-200">{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        )}

        {question.type === "checkbox" && (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <label
                key={option.id}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-white/10 bg-zinc-950/80 p-3"
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
                <span className="text-sm text-zinc-200">{option.label}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === "dropdown" && (
          <Select value={selectValue} onValueChange={onChange}>
            <SelectTrigger className="h-10 w-full rounded-md border-white/10 bg-zinc-950/80 text-zinc-100">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-white/10 bg-zinc-950 text-zinc-100">
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
              <button key={i} type="button" onClick={() => onChange(i + 1)} className="rounded p-1">
                <Star
                  className={`h-5 w-5 ${
                    ratingValue > i ? "fill-zinc-100 text-zinc-100" : "text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {question.type === "file_upload" && (
          <div className="space-y-3">
            {value ? (
              <div className="flex items-center justify-between rounded-md border border-white/15 bg-zinc-950/80 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded border border-white/10 bg-zinc-900">
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
                    : "cursor-pointer border-white/15 bg-zinc-950/80"
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
                      className={`h-5 w-5 ${isDisabled ? "text-zinc-600" : "text-zinc-300"}`}
                    />
                    <p className={`text-sm ${isDisabled ? "text-zinc-600" : "text-zinc-300"}`}>
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
