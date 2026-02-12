import { useState } from 'react';
import {
  GripVertical,
  Trash2,
  Copy,
  MoreVertical,
  CircleDot,
  CheckSquare,
  Star,
  Calendar,
  Mail,
  Hash,
  Upload,
  Type,
  AlignLeft,
  List,
  Plus,
  X,
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { Question, QuestionType, QuestionOption } from '@/types/form';

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
        opt.id === optionId
          ? {
              ...opt,
              label,
              value: label.toLowerCase().replace(/\s+/g, '_'),
            }
          : opt,
      ),
    });
  };

  const handleDeleteOption = (optionId: string) => {
    onUpdate({
      options: question.options?.filter((opt) => opt.id !== optionId),
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50' : 'z-0'}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isActive && (
        <div className="pointer-events-none absolute -inset-0.5 rounded-xl border border-zinc-700" />
      )}

      <div
        className={`relative overflow-hidden rounded-xl border bg-zinc-900/60 transition ${
          isActive
            ? 'border-zinc-700 shadow-lg shadow-black/30'
            : 'border-zinc-800 hover:border-zinc-700'
        } ${isDragging ? 'rotate-1 opacity-60' : ''}`}
      >
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start gap-3">
            <button
              {...attributes}
              {...listeners}
              className={`mt-1 rounded-md p-1.5 transition ${
                isHovered || isActive
                  ? 'bg-zinc-800 text-zinc-400'
                  : 'text-zinc-600 opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="h-4 w-4" />
            </button>

            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-zinc-300">
              <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              <Input
                value={question.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Untitled Question"
                className="border-0 border-b border-transparent bg-transparent px-0 text-base font-semibold text-zinc-100 hover:border-zinc-700 focus:border-zinc-600 focus:ring-0"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className={`flex items-center gap-2 transition ${isHovered || isActive ? 'opacity-100' : 'opacity-0'}`}>
              <div className="hidden items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950 px-2 py-1 sm:flex">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                  onClick={(e) => e.stopPropagation()}
                />
                <Label
                  htmlFor={`required-${question.id}`}
                  className="cursor-pointer text-xs text-zinc-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  Required
                </Label>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md border border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 border-zinc-700 bg-zinc-950 text-zinc-200">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicate();
                    }}
                    className="cursor-pointer"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="cursor-pointer text-red-400 focus:bg-red-950/40 focus:text-red-400"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mb-4 ml-12 flex items-center gap-3 sm:hidden">
            <Switch
              id={`required-mobile-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
              onClick={(e) => e.stopPropagation()}
            />
            <Label
              htmlFor={`required-mobile-${question.id}`}
              className="cursor-pointer text-xs text-zinc-400"
              onClick={(e) => e.stopPropagation()}
            >
              Required
            </Label>
          </div>

          {(isActive || question.description) && (
            <div className="mb-4 ml-12">
              <Textarea
                value={question.description || ''}
                onChange={(e) => onUpdate({ description: e.target.value })}
                placeholder="Add help text..."
                className="min-h-[44px] resize-none border-0 border-b border-transparent bg-transparent px-0 text-sm text-zinc-400 hover:border-zinc-700 focus:border-zinc-600 focus:ring-0"
                rows={1}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="ml-12" onClick={(e) => e.stopPropagation()}>
            {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
              <Input
                placeholder={question.placeholder || 'Short answer'}
                disabled
                className="h-10 cursor-not-allowed rounded-md border-zinc-800 bg-zinc-950 text-zinc-500"
              />
            )}

            {question.type === 'long_text' && (
              <Textarea
                placeholder={question.placeholder || 'Long answer'}
                disabled
                className="min-h-[74px] cursor-not-allowed resize-none rounded-md border-zinc-800 bg-zinc-950 text-zinc-500"
              />
            )}

            {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <div key={option.id} className="group/option flex items-center gap-2">
                    {question.type === 'multiple_choice' && <CircleDot className="h-4 w-4 text-zinc-500" />}
                    {question.type === 'checkbox' && <CheckSquare className="h-4 w-4 text-zinc-500" />}
                    {question.type === 'dropdown' && (
                      <span className="w-4 text-center text-xs text-zinc-500">{index + 1}</span>
                    )}
                    <Input
                      value={option.label}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="h-9 border-0 border-b border-transparent bg-transparent px-0 text-sm text-zinc-300 hover:border-zinc-700 focus:border-zinc-600 focus:ring-0"
                    />
                    {question.options && question.options.length > 1 && (
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="rounded p-1 text-zinc-600 opacity-0 transition group-hover/option:opacity-100 hover:bg-red-950/40 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={handleAddOption}
                  className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200"
                >
                  <Plus className="h-4 w-4" />
                  Add option
                </button>
              </div>
            )}

            {question.type === 'rating' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(question.maxRating || 5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${i < 3 ? 'fill-zinc-200 text-zinc-200' : 'text-zinc-700'}`}
                    />
                  ))}
                </div>
                <input
                  type="number"
                  value={question.maxRating || 5}
                  onChange={(e) => onUpdate({ maxRating: parseInt(e.target.value) })}
                  className="h-8 w-14 rounded-md border border-zinc-700 bg-zinc-950 px-2 text-center text-sm text-zinc-200 focus:border-zinc-600 focus:outline-none"
                  min={1}
                  max={10}
                />
              </div>
            )}

            {question.type === 'date' && (
              <div className="flex h-10 items-center rounded-md border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-500">
                <Calendar className="mr-2 h-4 w-4" />
                MM / DD / YYYY
              </div>
            )}

            {question.type === 'file_upload' && (
              <div className="rounded-md border-2 border-dashed border-zinc-800 bg-zinc-950 p-6 text-center">
                <Upload className="mx-auto h-5 w-5 text-zinc-500" />
                <p className="mt-2 text-sm text-zinc-400">Click to upload or drag a file</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
