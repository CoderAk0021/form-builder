import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Eye, Save, Share2, Settings, ChevronLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { QuestionTypesPanel } from './QuestionTypesPanel';
import { QuestionCard } from './QuestionCard';
import { FormPreview } from './FormPreview';
import { useForms } from '@/hooks/useForms';
import type { Form, Question, QuestionType } from '@/types/form';
import { DEFAULT_QUESTION } from '@/types/form';
import { generateId } from '@/utils/id';

interface FormEditorProps {
  form: Form;
  onBack: () => void;
}

export function FormEditor({ form: initialForm, onBack }: FormEditorProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { updateForm } = useForms();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setForm((prev) => {
        const oldIndex = prev.questions.findIndex((q) => q.id === active.id);
        const newIndex = prev.questions.findIndex((q) => q.id === over.id);
        return {
          ...prev,
          questions: arrayMove(prev.questions, oldIndex, newIndex),
        };
      });
    }
  }, []);

  const handleAddQuestion = useCallback((type: QuestionType) => {
    const newQuestion: Question = {
      ...DEFAULT_QUESTION,
      id: generateId(),
      type,
      title: `Untitled ${type.replace(/_/g, ' ')} question`,
    };

    if (type === 'rating') {
      newQuestion.maxRating = 5;
    }

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveQuestionId(newQuestion.id);
  }, []);

  const handleUpdateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, ...updates } : q
      ),
    }));
  }, []);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }));
    if (activeQuestionId === questionId) {
      setActiveQuestionId(null);
    }
  }, [activeQuestionId]);

  const handleDuplicateQuestion = useCallback((questionId: string) => {
    setForm((prev) => {
      const question = prev.questions.find((q) => q.id === questionId);
      if (!question) return prev;

      const newQuestion: Question = {
        ...question,
        id: generateId(),
        title: `${question.title} (Copy)`,
      };

      const index = prev.questions.findIndex((q) => q.id === questionId);
      const newQuestions = [...prev.questions];
      newQuestions.splice(index + 1, 0, newQuestion);

      return {
        ...prev,
        questions: newQuestions,
      };
    });
  }, []);

  const handleUpdateSettings = useCallback((updates: Partial<Form['settings']>) => {
    setForm((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...updates },
    }));
  }, []);

  const handleSave = useCallback(async () => {
    const formId = form._id || form.id;
    await updateForm(formId, form);
    onBack();
  }, [form, updateForm, onBack]);

  const shareUrl = `${window.location.origin}/form/${form._id || form.id}`;

  // Settings Panel Content
  const SettingsContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="progress-bar" className="text-sm cursor-pointer">
          Show progress bar
        </Label>
        <Switch
          id="progress-bar"
          checked={form.settings.showProgressBar}
          onCheckedChange={(checked) =>
            handleUpdateSettings({ showProgressBar: checked })
          }
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="multiple-responses" className="text-sm cursor-pointer">
          Allow multiple responses
        </Label>
        <Switch
          id="multiple-responses"
          checked={form.settings.allowMultipleResponses}
          onCheckedChange={(checked) =>
            handleUpdateSettings({ allowMultipleResponses: checked })
          }
        />
      </div>

      <div>
        <Label className="text-sm mb-1 block">Confirmation Message</Label>
        <Textarea
          value={form.settings.confirmationMessage}
          onChange={(e) =>
            handleUpdateSettings({ confirmationMessage: e.target.value })
          }
          placeholder="Thank you for your response!"
          className="text-sm"
          rows={3}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Button variant="ghost" size="icon" onClick={onBack} className="flex-shrink-0">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  className="font-semibold text-base sm:text-lg border-0 border-b border-transparent 
                             hover:border-gray-200 focus:border-purple-500 focus:ring-0 px-0 bg-transparent truncate"
                />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {/* Mobile Preview Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="sm:hidden"
              >
                <Eye className="w-4 h-4" />
              </Button>

              {/* Desktop Tabs */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    !previewMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    previewMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Preview
                </button>
              </div>

              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogContent className="max-w-sm sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Share Form</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Form Link</Label>
                      <div className="flex gap-2 mt-1">
                        <Input value={shareUrl} readOnly className="text-xs sm:text-sm" />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                          }}
                          size="sm"
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={form.isPublished}
                        onCheckedChange={(checked) =>
                          setForm((prev) => ({ ...prev, isPublished: checked }))
                        }
                      />
                      <Label>Publish form</Label>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="hidden sm:flex gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button 
                onClick={handleSave} 
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile Preview */}
        {previewMode && (
          <div className="sm:hidden">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-8">
              <FormPreview form={form} />
            </div>
          </div>
        )}

        {/* Desktop Layout */}
        <div className={`${previewMode ? 'hidden sm:block' : 'block'}`}>
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-8">
            {/* Left Sidebar - Question Types (Desktop only) */}
            <div className="hidden lg:block flex-shrink-0">
              <div className="sticky top-24">
                <QuestionTypesPanel onAddQuestion={handleAddQuestion} />
              </div>
            </div>

            {/* Center - Form Builder */}
            <div className="flex-1 max-w-3xl mx-auto w-full">
              {/* Mobile Question Types */}
              <div className="lg:hidden mb-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[60vh]">
                    <SheetHeader>
                      <SheetTitle>Question Types</SheetTitle>
                    </SheetHeader>
                    <div className="mt-4">
                      <QuestionTypesPanel onAddQuestion={handleAddQuestion} />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Form Header Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                <Input
                  value={form.title}
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Form Title"
                  className="text-xl sm:text-2xl font-bold border-0 border-b border-transparent 
                             hover:border-gray-200 focus:border-purple-500 focus:ring-0 px-0 bg-transparent mb-4"
                />
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Form description"
                  className="border-0 border-b border-transparent hover:border-gray-200 
                             focus:border-purple-500 focus:ring-0 px-0 bg-transparent resize-none text-sm sm:text-base"
                  rows={2}
                />
              </div>

              {/* Questions List */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={form.questions.map((q) => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence mode="popLayout">
                    {form.questions.map((question) => (
                      <div key={question.id} className="mb-3 sm:mb-4">
                        <QuestionCard
                          question={question}
                          isActive={activeQuestionId === question.id}
                          onClick={() => setActiveQuestionId(question.id)}
                          onUpdate={(updates) => handleUpdateQuestion(question.id, updates)}
                          onDelete={() => handleDeleteQuestion(question.id)}
                          onDuplicate={() => handleDuplicateQuestion(question.id)}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>

              {form.questions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-12 bg-white rounded-xl border border-dashed border-gray-300"
                >
                  <p className="text-gray-500 mb-2 sm:mb-4">Start building your form</p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    Click &quot;Add Question&quot; to add your first question
                  </p>
                </motion.div>
              )}
            </div>

            {/* Right Sidebar - Settings (Desktop) / Mobile Sheet */}
            <div className="lg:w-72 flex-shrink-0">
              {/* Mobile Settings Button */}
              <div className="lg:hidden">
                <Sheet open={showSettings} onOpenChange={setShowSettings}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px]">
                    <SheetHeader>
                      <SheetTitle>Form Settings</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <SettingsContent />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Settings Panel */}
              <div className="hidden lg:block sticky top-24">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <h3 className="text-sm font-semibold text-gray-900">Form Settings</h3>
                  </div>
                  <SettingsContent />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Preview */}
        {previewMode && (
          <div className="hidden sm:block max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
              <FormPreview form={form} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


