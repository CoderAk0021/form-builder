import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Eye
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

const iconColors: Record<QuestionType, string> = {
  short_text: 'text-blue-400',
  long_text: 'text-indigo-400',
  multiple_choice: 'text-purple-400',
  checkbox: 'text-pink-400',
  dropdown: 'text-cyan-400',
  rating: 'text-amber-400',
  date: 'text-emerald-400',
  email: 'text-rose-400',
  number: 'text-orange-400',
  file_upload: 'text-violet-400',
};

const iconBgColors: Record<QuestionType, string> = {
  short_text: 'bg-blue-500/10 border-blue-500/20',
  long_text: 'bg-indigo-500/10 border-indigo-500/20',
  multiple_choice: 'bg-purple-500/10 border-purple-500/20',
  checkbox: 'bg-pink-500/10 border-pink-500/20',
  dropdown: 'bg-cyan-500/10 border-cyan-500/20',
  rating: 'bg-amber-500/10 border-amber-500/20',
  date: 'bg-emerald-500/10 border-emerald-500/20',
  email: 'bg-rose-500/10 border-rose-500/20',
  number: 'bg-orange-500/10 border-orange-500/20',
  file_upload: 'bg-violet-500/10 border-violet-500/20',
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
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative group ${isDragging ? 'z-50' : 'z-0'}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect on Active */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Main Card */}
      <div 
        className={`relative rounded-2xl border transition-all duration-300 overflow-hidden ${
          isActive 
            ? 'bg-white/[0.04] border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
            : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.03]'
        } ${isDragging ? 'opacity-50 rotate-2 scale-105' : ''}`}
      >
        {/* Top Accent Line */}
        <div className={`h-[2px] w-full bg-gradient-to-r from-transparent via-${iconColors[question.type].split('-')[1]}-500/50 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

        <div className="p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            {/* Drag Handle */}
            <button
              {...attributes}
              {...listeners}
              className={`mt-2 p-2 rounded-lg cursor-grab active:cursor-grabbing transition-all flex-shrink-0 ${
                isHovered || isActive 
                  ? 'opacity-100 bg-white/5 hover:bg-white/10' 
                  : 'opacity-0'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-5 h-5 text-white/40" />
            </button>

            {/* Icon & Type Badge */}
            <div className={`w-10 h-10 rounded-xl ${iconBgColors[question.type]} border flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-5 h-5 ${iconColors[question.type]}`} />
            </div>

            {/* Title Input */}
            <div className="flex-1 min-w-0 pt-1">
              <Input
                value={question.title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="Untitled Question"
                className="text-lg font-semibold bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white placeholder:text-white/20 transition-all"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Actions */}
            <div className={`flex items-center gap-2 transition-all duration-200 ${isHovered || isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
              {/* Required Toggle - Desktop */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                  onClick={(e) => e.stopPropagation()}
                  className="data-[state=checked]:bg-indigo-500"
                />
                <Label
                  htmlFor={`required-${question.id}`}
                  className={`text-xs font-medium cursor-pointer whitespace-nowrap ${question.required ? 'text-indigo-400' : 'text-white/40'}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  Required
                </Label>
              </div>

              {/* More Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-[#0f0f14] border-white/10 text-white">
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
                    className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                  >
                    <Copy className="w-4 h-4 mr-2 text-white/60" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 mr-2 text-white/60" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Required Toggle */}
          <div className="sm:hidden flex items-center gap-3 mb-4 ml-14">
            <Switch
              id={`required-mobile-${question.id}`}
              checked={question.required}
              onCheckedChange={(checked) => onUpdate({ required: checked })}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=checked]:bg-indigo-500"
            />
            <Label
              htmlFor={`required-mobile-${question.id}`}
              className={`text-xs font-medium cursor-pointer ${question.required ? 'text-indigo-400' : 'text-white/40'}`}
              onClick={(e) => e.stopPropagation()}
            >
              Required
            </Label>
          </div>

          {/* Description */}
          <AnimatePresence>
            {(isActive || question.description) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-14 mb-4"
              >
                <Textarea
                  value={question.description || ''}
                  onChange={(e) => onUpdate({ description: e.target.value })}
                  placeholder="Add a description or help text..."
                  className="text-sm bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white/60 placeholder:text-white/30 resize-none min-h-[40px]"
                  rows={1}
                  onClick={(e) => e.stopPropagation()}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question Preview/Editor */}
          <div className="ml-14" onClick={(e) => e.stopPropagation()}>
            {/* Short Text */}
            {(question.type === 'short_text' || question.type === 'email' || question.type === 'number') && (
              <div className="relative">
                <Input
                  placeholder={question.placeholder || 'Short answer text'}
                  disabled
                  className="bg-white/5 border-white/10 text-white/40 text-sm rounded-xl h-11 cursor-not-allowed"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-[10px] text-white/20 uppercase tracking-wider font-mono">Input</span>
                </div>
              </div>
            )}

            {/* Long Text */}
            {question.type === 'long_text' && (
              <div className="relative">
                <Textarea
                  placeholder={question.placeholder || 'Long answer text'}
                  disabled
                  className="bg-white/5 border-white/10 text-white/40 resize-none text-sm rounded-xl min-h-[80px] cursor-not-allowed"
                />
                <div className="absolute bottom-3 right-3">
                  <span className="text-[10px] text-white/20 uppercase tracking-wider font-mono">Textarea</span>
                </div>
              </div>
            )}

            {/* Choice Types */}
            {(question.type === 'multiple_choice' || question.type === 'checkbox' || question.type === 'dropdown') && (
              <div className="space-y-2">
                {question.options?.map((option, index) => (
                  <motion.div 
                    key={option.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 group/option"
                  >
                    {question.type === 'multiple_choice' && (
                      <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                      </div>
                    )}
                    {question.type === 'checkbox' && (
                      <div className="w-4 h-4 rounded border border-white/20 flex items-center justify-center">
                        <CheckSquare className="w-3 h-3 text-white/20" />
                      </div>
                    )}
                    {question.type === 'dropdown' && (
                      <span className="w-6 h-6 flex items-center justify-center text-xs text-white/30 font-mono">
                        {index + 1}
                      </span>
                    )}
                    <Input
                      value={option.label}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-1 text-sm bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white/80 transition-all"
                    />
                    {question.options && question.options.length > 1 && (
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-1.5 rounded-lg opacity-0 group-hover/option:opacity-100 hover:bg-red-500/10 text-white/20 hover:text-red-400 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </motion.div>
                ))}
                <button
                  onClick={handleAddOption}
                  className="flex items-center gap-2 mt-3 text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors group"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                  Add option
                </button>
              </div>
            )}

            {/* Rating */}
            {question.type === 'rating' && (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[...Array(question.maxRating || 5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-8 h-8 ${i < 3 ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} 
                    />
                  ))}
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/40">Max:</span>
                  <input
                    type="number"
                    value={question.maxRating || 5}
                    onChange={(e) => onUpdate({ maxRating: parseInt(e.target.value) })}
                    className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-sm text-white text-center focus:border-amber-500/50 focus:outline-none"
                    min={1}
                    max={10}
                  />
                </div>
              </div>
            )}

            {/* Date */}
            {question.type === 'date' && (
              <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-sm text-white/40">MM / DD / YYYY</span>
              </div>
            )}

            {/* File Upload */}
            {question.type === 'file_upload' && (
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group cursor-pointer">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-violet-400" />
                </div>
                <p className="text-sm text-white/40">Click to upload or drag and drop</p>
                <p className="text-xs text-white/20 mt-1">PDF, DOC, Images up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}