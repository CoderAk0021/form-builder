import { motion } from 'framer-motion';
import { 
  Type, AlignLeft, CircleDot, CheckSquare, List, 
  Star, Calendar, Mail, Hash, Upload 
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

interface QuestionTypesPanelProps {
  onAddQuestion: (type: QuestionType) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export function QuestionTypesPanel({ onAddQuestion }: QuestionTypesPanelProps) {
  const questionTypes: QuestionType[] = [
    'short_text',
    'long_text',
    'multiple_choice',
    'checkbox',
    'dropdown',
    'rating',
    'date',
    'email',
    'number',
    'file_upload',
  ];

  return (
    <div className="w-full lg:w-64 bg-white rounded-xl border border-gray-200 shadow-sm p-3 sm:p-4">
      <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-3 sm:mb-4 uppercase tracking-wide">
        Question Types
      </h3>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-1 gap-1 sm:gap-2"
      >
        {questionTypes.map((type) => {
          const Icon = iconMap[type];
          return (
            <motion.button
              key={type}
              variants={itemVariants}
              onClick={() => onAddQuestion(type)}
              className="w-full flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg text-left text-xs sm:text-sm 
                         text-gray-700 hover:bg-purple-50 hover:text-purple-700 
                         transition-colors duration-200 group"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-purple-500 transition-colors flex-shrink-0" />
              <span className="font-medium truncate">{QUESTION_TYPE_LABELS[type]}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
