export type QuestionType = 
  | 'short_text'
  | 'long_text'
  | 'multiple_choice'
  | 'checkbox'
  | 'dropdown'
  | 'rating'
  | 'date'
  | 'email'
  | 'number'
  | 'file_upload';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  maxLength?: number;
  minRating?: number;
  maxRating?: number;
  allowMultiple?: boolean;
  acceptFileTypes?: string;
  maxFileSize?: number;
}

export interface Form {
  _id?: string;
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
  settings: FormSettings;
  isPublished: boolean;
  responseCount: number;
}

export interface FormSettings {
  allowMultipleResponses: boolean;
  requireLogin: boolean;
  showProgressBar: boolean;
  confirmationMessage: string;
  redirectUrl?: string;
  theme: FormTheme;
  limitOneResponse: boolean;
}

export interface FormTheme {
  primaryColor: string;
  backgroundColor: string;
  fontFamily: string;
}

export interface FormResponse {
  _id?: string;
  id: string;
  formId: string;
  submittedAt: string;
  answers: Answer[];
  googleToken: string;
  respondent?: {
    name?: string;
    email?: string;
  };
}

export interface Answer {
  questionId: string;
  value: string | string[] | number | File | null;
}

export interface FormTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail?: string;
  questions: Question[];
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  short_text: 'Short Text',
  long_text: 'Paragraph',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkboxes',
  dropdown: 'Dropdown',
  rating: 'Rating',
  date: 'Date',
  email: 'Email',
  number: 'Number',
  file_upload: 'File Upload',
};

export const QUESTION_TYPE_ICONS: Record<QuestionType, string> = {
  short_text: 'Type',
  long_text: 'AlignLeft',
  multiple_choice: 'CircleDot',
  checkbox: 'CheckSquare',
  dropdown: 'List',
  rating: 'Star',
  date: 'Calendar',
  email: 'Mail',
  number: 'Hash',
  file_upload: 'Upload',
};

export const DEFAULT_QUESTION: Question = {
  id: '',
  type: 'short_text',
  title: 'Untitled Question',
  description: '',
  required: false,
  options: [
    { id: '1', label: 'Option 1', value: 'option_1' },
    { id: '2', label: 'Option 2', value: 'option_2' },
  ],
  placeholder: '',
  maxRating: 5,
};

export const DEFAULT_FORM: Form = {
  id: '',
  title: 'Untitled Form',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  questions: [],
  settings: {
    allowMultipleResponses: false,
    requireLogin: false,
    showProgressBar: true,
    limitOneResponse: true,
    confirmationMessage: 'Thank you for your response!',
    theme: {
      primaryColor: '#7c3aed',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter',
    },
  },
  isPublished: false,
  responseCount: 0,
};
