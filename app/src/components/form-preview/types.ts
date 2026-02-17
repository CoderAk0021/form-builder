import type { Form, Question } from "@/types/form";

export type PreviewDevice = "auto" | "desktop" | "mobile";

export interface FormPreviewProps {
  form: Form;
  previewDevice?: PreviewDevice;
  onSubmit?: (
    answers: Record<string, unknown>,
    googleToken?: string,
  ) => void | Promise<void>;
}

export interface FormPage {
  id: string;
  title?: string;
  description?: string;
  questions: Question[];
}
