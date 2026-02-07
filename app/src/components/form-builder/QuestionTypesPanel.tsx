import { motion } from 'framer-motion';
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
  Plus,
  Sparkles
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
};

// Color coding for each question type
const typeColors: Record<QuestionType, { bg: string; border: string; icon: string; glow: string }> = {
  short_text: { 
    bg: 'bg-blue-500/10', 
    border: 'border-blue-500/20', 
    icon: 'text-blue-400',
    glow: 'group-hover:shadow-blue-500/20'
  },
  long_text: { 
    bg: 'bg-indigo-500/10', 
    border: 'border-indigo-500/20', 
    icon: 'text-indigo-400',
    glow: 'group-hover:shadow-indigo-500/20'
  },
  multiple_choice: { 
    bg: 'bg-purple-500/10', 
    border: 'border-purple-500/20', 
    icon: 'text-purple-400',
    glow: 'group-hover:shadow-purple-500/20'
  },
  checkbox: { 
    bg: 'bg-pink-500/10', 
    border: 'border-pink-500/20', 
    icon: 'text-pink-400',
    glow: 'group-hover:shadow-pink-500/20'
  },
  dropdown: { 
    bg: 'bg-cyan-500/10', 
    border: 'border-cyan-500/20', 
    icon: 'text-cyan-400',
    glow: 'group-hover:shadow-cyan-500/20'
  },
  rating: { 
    bg: 'bg-amber-500/10', 
    border: 'border-amber-500/20', 
    icon: 'text-amber-400',
    glow: 'group-hover:shadow-amber-500/20'
  },
  date: { 
    bg: 'bg-emerald-500/10', 
    border: 'border-emerald-500/20', 
    icon: 'text-emerald-400',
    glow: 'group-hover:shadow-emerald-500/20'
  },
  email: { 
    bg: 'bg-rose-500/10', 
    border: 'border-rose-500/20', 
    icon: 'text-rose-400',
    glow: 'group-hover:shadow-rose-500/20'
  },
  number: { 
    bg: 'bg-orange-500/10', 
    border: 'border-orange-500/20', 
    icon: 'text-orange-400',
    glow: 'group-hover:shadow-orange-500/20'
  },
  file_upload: { 
    bg: 'bg-violet-500/10', 
    border: 'border-violet-500/20', 
    icon: 'text-violet-400',
    glow: 'group-hover:shadow-violet-500/20'
  },
};

// Group types by category
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
    types: ['rating', 'date', 'file_upload'] as QuestionType[],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    }
  },
};

interface QuestionTypesPanelProps {
  onAddQuestion: (type: QuestionType) => void;
}

export function QuestionTypesPanel({ onAddQuestion }: QuestionTypesPanelProps) {
  return (
    // 1. h-full ensures it fills the bottom sheet
    // 2. flex-col allows us to separate header/body/footer
    <div className="h-full w-full flex flex-col">
      
      {/* Header - flex-shrink-0 prevents it from collapsing when list is long */}
      <div className="flex-shrink-0 flex items-center gap-2 px-2 mb-4">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <h3 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Components
        </h3>
      </div>

      {/* Scrollable Content Area 
          1. flex-1: Takes up all remaining height
          2. overflow-y-auto: Enables vertical scrolling
          3. min-h-0: Crucial CSS fix for nested flex scrolling
      */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
      >
        {typeCategories.map((category) => (
          <div key={category.title} className="space-y-3">
            <h4 className="text-[10px] font-medium text-white/20 uppercase tracking-wider px-2 sticky top-0 bg-[#0f0f12]/95 backdrop-blur-sm z-10 py-1">
              {category.title}
            </h4>
            
            {/* Grid adapts to screen size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {category.types.map((type) => {
                const Icon = iconMap[type];
                const colors = typeColors[type];
                
                return (
                  <motion.button
                    key={type}
                    variants={itemVariants}
                    onClick={() => onAddQuestion(type)}
                    className={`group relative w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left
                      bg-white/[0.02] border border-white/[0.08] hover:border-white/[0.15]
                      hover:bg-white/[0.04] transition-all duration-300
                      ${colors.glow} hover:shadow-lg active:scale-[0.98] flex-shrink-0`}
                    whileHover={{ x: 2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} border ${colors.border} 
                      flex items-center justify-center flex-shrink-0
                      group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-4 h-4 ${colors.icon}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-white/80 group-hover:text-white transition-colors truncate">
                        {QUESTION_TYPE_LABELS[type]}
                      </span>
                    </div>

                    <div className="hidden sm:flex w-6 h-6 rounded-full bg-white/5 border border-white/10 
                       items-center justify-center opacity-0 group-hover:opacity-100 
                      transition-all duration-300 group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30">
                      <Plus className="w-3 h-3 text-indigo-400" />
                    </div>

                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${colors.bg} opacity-0 
                      group-hover:opacity-50 transition-opacity duration-300 blur-sm -z-10`} />
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
        {/* Extra padding at bottom so last item isn't flush with footer */}
        <div className="h-4" />
      </motion.div>

      {/* Footer / Tip - flex-shrink-0 ensures it stays at the bottom */}
      <div className="flex-shrink-0 mt-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
        <p className="text-xs text-indigo-300/60 leading-relaxed">
          <span className="font-medium text-indigo-400">Tip:</span> Drag questions to reorder them after adding.
        </p>
      </div>
    </div>
  );
}