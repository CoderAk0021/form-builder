import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Star, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Form, Question } from '@/types/form';

interface FormPreviewProps {
  form: Form;
  onSubmit?: (answers: Record<string, any>) => void;
}

export function FormPreview({ form, onSubmit }: FormPreviewProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(answers);
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
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {form.settings.confirmationMessage || 'Thank you for your response!'}
        </h3>
        <p className="text-gray-500">Your response has been recorded.</p>
      </motion.div>
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
                width: `${(Object.keys(answers).length / form.questions.length) * 100}%` 
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-right">
            {Object.keys(answers).length} of {form.questions.length} answered
          </p>
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
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg 
                       font-medium transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25"
          >
            Submit
          </Button>
        </div>
      )}
    </form>
  );
}

interface QuestionPreviewProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  index: number;
}

function QuestionPreview({ question, value, onChange, index }: QuestionPreviewProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full 
                         flex items-center justify-center text-sm font-medium">
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
        {question.type === 'short_text' && (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Short answer'}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === 'long_text' && (
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'Long answer'}
            required={question.required}
            rows={4}
            className="w-full resize-none"
          />
        )}

        {question.type === 'email' && (
          <Input
            type="email"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || 'your@email.com'}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === 'number' && (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder || '0'}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === 'date' && (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            required={question.required}
            className="w-full"
          />
        )}

        {question.type === 'multiple_choice' && (
          <RadioGroup
            value={value || ''}
            onValueChange={onChange}
            required={question.required}
            className="space-y-2"
          >
            {question.options?.map((option) => (
              <div key={option.id} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.id} />
                <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === 'checkbox' && (
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
                      onChange(currentValues.filter((v: string) => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={option.id} className="text-sm font-normal cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        )}

        {question.type === 'dropdown' && (
          <Select value={value || ''} onValueChange={onChange} required={question.required}>
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

        {question.type === 'rating' && (
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
                    (value || 0) > i ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {question.type === 'file_upload' && (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center 
                          hover:border-purple-300 transition-colors cursor-pointer">
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <Input
              type="file"
              className="hidden"
              onChange={(e) => onChange(e.target.files?.[0])}
              required={question.required}
            />
          </div>
        )}
      </div>
    </div>
  );
}
