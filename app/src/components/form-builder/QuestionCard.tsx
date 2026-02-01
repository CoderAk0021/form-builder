import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GripVertical, Trash2, Copy, MoreVertical, 
  CircleDot, CheckSquare, Star, Calendar, 
  Mail, Hash, Upload, Type, AlignLeft, List
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Question, QuestionType, QuestionOption } from '@/types/form';
import { QUESTION_TYPE_LABELS } from '@/types/form';

const iconMap: Record<QuestionType, React.ElementType> = {
  short_text: Type,
  long_text: AlignLeft,
  multiple_choice: CircleDot,
  checkbox: CheckSquare,
  dropdown: List,
  rating: Star,
  date: Calendar,
  email: Mail,
  number: Hash,
  file_upload: Upload,
};

interface QuestionCardProps {
  question: Question;
  isActive: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function QuestionCard({
  question,
  isActive,
  onClick,
  onUpdate,
  onDelete,
  onDuplicate,
}: QuestionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[question.type];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddOption = () => {
    const newOption: QuestionOption = {
      id: `opt_${Date.now()}`,
      label: `Option ${(question.options?.length || 0) + 1}`,
      value: `option_${(question.options?.length || 0) + 1}`,
    };
    onUpdate({
      options: [...(question.options || []), newOption],
    });
  };

  const handleUpdateOption = (optionId: string, label: string) => {
    onUpdate({
      options: question.options?.map((opt) =>
        opt.id === optionId ? { ...opt, label, value: label.toLowerCase().replace(/\s+/g, '_') } : opt
      ),
    });
  };

  const handleDeleteOption = (optionId: string) => {
    onUpdate({
      options: question.options?.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`question-card relative ${isActive ? 'active' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-3 sm:p-4 lg:p-6">
        {/* Header with drag handle and actions */}
        <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            {...attributes}
            {...listeners}
            className={`mt-1.5 sm:mt-2 p-1 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing transition-opacity flex-shrink-0 ${
              isHovered || isActive ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <GripVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
              <span className="text-[10px] sm:text-xs font-medium text-purple-600 uppercase tracking-wide truncate">
                {QUESTION_TYPE_LABELS[question.type]}
              </span>
            </div>

            <Input
              value={question.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Question title"
              className="text-base sm:text-lg font-semibold border-0 border-b border-transparent hover:border-gray-200 
                         focus:border-purple-500 focus:ring-0 px-0 bg-transparent transition-colors"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className={`flex items-center gap-1 transition-opacity flex-shrink-0 ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
            <div className="hidden sm:flex items-center gap-2 mr-2 lg:mr-4">
              <Switch
                id={`required-${question.id}`}
                checked={question.required}
                onCheckedChange={(checked) => onUpdate({ required: checked })}
                onClick={(e) => e.stopPropagation()}
              />
              <Label
                htmlFor={`required-${question.id}`}
                className="text-xs sm:text-sm text-gray-500 cursor-pointer whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                Required
              </Label>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8">
                  <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Required Toggle */}
        <div className="sm:hidden flex items-center gap-2 mb-3 ml-6">
          <Switch
            id={`required-mobile-${question.id}`}
            checked={question.required}
            onCheckedChange={(checked) => onUpdate({ required: checked })}
            onClick={(e) => e.stopPropagation()}
          />
          <Label
            htmlFor={`required-mobile-${question.id}`}
            className="text-xs text-gray-500 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          >
            Required
          </Label>
        </div>

        {/* Description */}
        {(isActive || question.description) && (
          <Textarea
            value={question.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Add a description (optional)"
            className="mt-2 text-xs sm:text-sm border-0 border-b border-transparent hover:border-gray-200 
                       focus:border-purple-500 focus:ring-0 px-0 bg-transparent resize-none transition-colors"
            rows={1}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Question type specific inputs */}
        <div className="mt-3 sm:mt-4" onClick={(e) => e.stopPropagation()}>
          {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
            <Input
              placeholder={question.placeholder || 'Short answer text'}
              disabled
              className="bg-gray-50 border-gray-200 text-gray-400 text-sm"
            />
          )}

          {question.type === 'long_text' && (
            <Textarea
              placeholder={question.placeholder || 'Long answer text'}
              disabled
              className="bg-gray-50 border-gray-200 text-gray-400 resize-none text-sm"
              rows={2}
            />
          )}

          {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
            <div className="space-y-1.5 sm:space-y-2">
              {question.options?.map((option, index) => (
                <div key={option.id} className="flex items-center gap-2 sm:gap-3">
                  {question.type === 'multiple_choice' && (
                    <CircleDot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 flex-shrink-0" />
                  )}
                  {question.type === 'checkbox' && (
                    <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-300 flex-shrink-0" />
                  )}
                  {question.type === 'dropdown' && (
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center text-[10px] sm:text-xs text-gray-400 flex-shrink-0">
                      {index + 1}
                    </span>
                  )}
                  <Input
                    value={option.label}
                    onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                    className="flex-1 text-xs sm:text-sm border-0 border-b border-transparent hover:border-gray-200 
                               focus:border-purple-500 focus:ring-0 px-0 bg-transparent transition-colors"
                  />
                  {question.options && question.options.length > 1 && (
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 
                           font-medium transition-colors"
              >
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex items-center justify-center">+</span>
                Add option
              </button>
            </div>
          )}

          {question.type === 'rating' && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {[...Array(question.maxRating || 5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
              ))}
            </div>
          )}

          {question.type === 'date' && (
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">MM / DD / YYYY</span>
            </div>
          )}

          {question.type === 'file_upload' && (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 sm:p-8 text-center">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-gray-500">Click to upload or drag and drop</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
