import {
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Star,
  Calendar,
  Mail,
  Hash,
  Upload,
  SeparatorHorizontal,
  Plus,
} from 'lucide-react';
import { QUESTION_TYPE_LABELS, type QuestionType } from '@/types/form';

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
  section_break: SeparatorHorizontal,
};

const typeCategories = [
  {
    title: 'Text Input',
    types: ['short_text', 'long_text', 'email', 'number'] as QuestionType[],
  },
  {
    title: 'Choice',
    types: ['multiple_choice', 'checkbox', 'dropdown'] as QuestionType[],
  },
  {
    title: 'Special',
    types: ['rating', 'date', 'file_upload', 'section_break'] as QuestionType[],
  },
];

interface QuestionTypesPanelProps {
  onAddQuestion: (type: QuestionType) => void;
  disabledTypes?: QuestionType[];
  disabledReason?: string;
}

export function QuestionTypesPanel({
  onAddQuestion,
  disabledTypes = [],
  disabledReason = "Unavailable for your account",
}: QuestionTypesPanelProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="space-y-5">
        {typeCategories.map((category) => (
          <div key={category.title} className="space-y-2">
            <h4 className="px-1 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
              {category.title}
            </h4>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {category.types.map((type) => {
                const Icon = iconMap[type];
                const isDisabled = disabledTypes.includes(type);

                return (
                  <button
                    key={type}
                    type="button"
                    disabled={isDisabled}
                    title={isDisabled ? disabledReason : undefined}
                    onClick={() => onAddQuestion(type)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-3 text-left transition hover:border-zinc-700 hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-zinc-300">
                      <Icon className="h-4 w-4" />
                    </div>

                    <span className="flex-1 truncate text-sm font-medium text-zinc-200">
                      {QUESTION_TYPE_LABELS[type]}
                    </span>

                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-zinc-700 bg-zinc-950 text-zinc-500 opacity-0 transition group-hover:opacity-100">
                      <Plus className="h-3 w-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
        <p className="text-xs text-zinc-500">Drag questions in the canvas to reorder them.</p>
      </div>
    </div>
  );
}
