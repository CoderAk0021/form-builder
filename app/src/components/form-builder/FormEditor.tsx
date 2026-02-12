import { useState, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Eye,
  Save,
  Share2,
  Settings,
  ChevronLeft,
  Plus,
  Copy,
  Command,
  Monitor,
  Smartphone,
  Check,
  Undo2,
  Redo2,
  Download,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { QuestionTypesPanel } from "./QuestionTypesPanel";
import { QuestionCard } from "./QuestionCard";
import { FormPreview } from "./FormPreview";
import { useForms } from "@/hooks/useForms";
import type { Form, Question, QuestionType } from "@/types/form";
import { DEFAULT_QUESTION } from "@/types/form";
import { generateId } from "@/utils/id";
import { toast } from "sonner";

// --- FIX START: SettingsContent moved outside FormEditor ---

interface SettingsContentProps {
  form: Form;
  onUpdateSettings: (updates: Partial<Form["settings"]>) => void;
}

const SettingsContent = ({ form, onUpdateSettings }: SettingsContentProps) => (
  <div className="space-y-6">
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <Label
              htmlFor="progress-bar"
              className="text-sm font-medium text-white cursor-pointer"
            >
              Progress Bar
            </Label>
            <p className="text-xs text-zinc-500">Show completion progress</p>
          </div>
        </div>
        <Switch
          id="progress-bar"
          checked={form.settings.showProgressBar}
          onCheckedChange={(checked) =>
            onUpdateSettings({ showProgressBar: checked })
          }
          className="data-[state=checked]:bg-indigo-500"
        />
      </div>

      <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
            <Copy className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <Label
              htmlFor="multiple-responses"
              className="text-sm font-medium text-white cursor-pointer"
            >
              Multiple Responses
            </Label>
            <p className="text-xs text-zinc-500">
              Allow users to submit multiple times
            </p>
          </div>
        </div>
        <Switch
          id="multiple-responses"
          checked={form.settings.allowMultipleResponses}
          onCheckedChange={(checked) =>
            onUpdateSettings({ allowMultipleResponses: checked })
          }
          className="data-[state=checked]:bg-cyan-500"
        />
      </div>
    </div>

    <div className="space-y-3">
      <Label className="text-sm font-medium text-white">
        Confirmation Message
      </Label>
      <Textarea
        value={form.settings.confirmationMessage}
        onChange={(e) =>
          onUpdateSettings({ confirmationMessage: e.target.value })
        }
        placeholder="Thank you for your response!"
        className="bg-zinc-900 border-white/10 text-white placeholder:text-zinc-600 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-xl min-h-[100px] resize-none"
      />
    </div>
  </div>
);

// --- FIX END ---

interface FormEditorProps {
  form: Form;
  onBack: () => void;
}

export function FormEditor({ form: initialForm, onBack }: FormEditorProps) {
  const [form, setForm] = useState<Form>(initialForm);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  const [showMobileSettings, setShowMobileSettings] = useState(false);

  const [previewMode, setPreviewMode] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isQrGenerating, setIsQrGenerating] = useState(false);
  const [devicePreview, setDevicePreview] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const { updateForm } = useForms();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
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
      title: `Untitled ${type.replace(/_/g, " ")} question`,
    };
    if (type === "rating") newQuestion.maxRating = 5;

    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveQuestionId(newQuestion.id);
    setShowMobileAdd(false);
    toast.success("Question added");
  }, []);

  const handleUpdateQuestion = useCallback(
    (questionId: string, updates: Partial<Question>) => {
      setForm((prev) => ({
        ...prev,
        questions: prev.questions.map((q) =>
          q.id === questionId ? { ...q, ...updates } : q,
        ),
      }));
    },
    [],
  );

  const handleDeleteQuestion = useCallback(
    (questionId: string) => {
      setForm((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
      if (activeQuestionId === questionId) setActiveQuestionId(null);
      toast.success("Question removed");
    },
    [activeQuestionId],
  );

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
      return { ...prev, questions: newQuestions };
    });
    toast.success("Question duplicated");
  }, []);

  const handleUpdateSettings = useCallback(
    (updates: Partial<Form["settings"]>) => {
      setForm((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...updates },
      }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const formId = form._id || form.id;
      await updateForm(formId, form);
      toast.success("Form saved successfully");
      onBack();
    } catch {
      toast.error("Failed to save form");
    } finally {
      setIsSaving(false);
    }
  }, [form, updateForm, onBack, isSaving]);

  const shareUrl = `${window.location.origin}/form/${form._id || form.id}`;

  const handleDownloadQrCode = useCallback(async () => {
    if (isQrGenerating) return;
    setIsQrGenerating(true);
    try {
      const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(shareUrl)}&size=1024&margin=2&format=png`;
      const response = await fetch(qrImageUrl);
      if (!response.ok) throw new Error("Failed to generate QR code");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const safeTitle = form.title
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const filename = `${safeTitle || "form"}-qr-code.png`;

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("QR code downloaded");
    } catch {
      toast.error("Failed to download QR code");
    } finally {
      setIsQrGenerating(false);
    }
  }, [shareUrl, form.title, isQrGenerating]);

  return (
    <div className="min-h-[60vh] rounded-lg border border-zinc-800 bg-zinc-950 text-white relative overflow-hidden flex flex-col">

      {/* Header */}
      <header className="z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Back & Title */}
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={onBack}
                className="text-zinc-400 hover:text-white hover:bg-zinc-800 flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>

              <div className="h-6 w-px bg-zinc-800 hidden sm:block flex-shrink-0" />

              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0  sm:flex">
                  <Command className="w-4 h-4 text-indigo-400" />
                </div>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="font-semibold text-base sm:text-lg bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white placeholder:text-zinc-600 w-full min-w-0"
                  placeholder="Untitled Form"
                />
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Preview Toggle (Desktop/Tablet) */}
              <div className="hidden md:flex bg-zinc-900 rounded-lg p-1 border border-white/10">
                <button
                  onClick={() => setPreviewMode(false)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    !previewMode
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => setPreviewMode(true)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                    previewMode
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-400"
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Preview
                </button>
              </div>

              {/* Mobile Preview/Edit Icon Toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewMode(!previewMode)}
                className="md:hidden text-zinc-400 hover:text-white"
              >
                {previewMode ? (
                  <Settings className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </Button>

              <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

              {/* Share Button (Responsive) */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowShareDialog(true)}
                className="bg-zinc-900 border-white/10 text-white hover:bg-zinc-800 hover:text-white hidden sm:flex"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowShareDialog(true)}
                className="sm:hidden text-zinc-400 hover:text-white"
              >
                <Share2 className="w-5 h-5" />
              </Button>

              {/* Save Button (Responsive) */}
              <Button
                onClick={handleSave}
                size="sm"
                disabled={isSaving}
                className="bg-white text-zinc-950 hover:bg-white/90 rounded-lg font-medium px-3 sm:px-6"
              >
                {isSaving ? (
                  <>
                    <Loader className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Save</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-[90vw] sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Share2 className="w-5 h-5 text-indigo-400" />
              Share Form
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-zinc-400">
                Public Link
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="bg-zinc-900 border-white/10 text-white/80 text-sm pr-16 sm:pr-20 font-mono"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <span className="text-xs text-zinc-600 px-2 py-1 rounded bg-zinc-900">
                      URL
                    </span>
                  </div>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setIsCopied(true);
                    toast.success("Link copied");
                    setTimeout(() => setIsCopied(false), 2000);
                  }}
                  className={`px-3 sm:px-4 transition-all ${isCopied ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800 hover:bg-white/20 text-white border-white/10"}`}
                  variant="outline"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${form.isPublished ? "bg-emerald-400" : "bg-amber-400"}`}
                  />
                  <span className="text-sm font-medium text-white">
                    {form.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <Switch
                  checked={form.isPublished}
                  onCheckedChange={(checked) =>
                    setForm((prev) => ({ ...prev, isPublished: checked }))
                  }
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
              <p className="text-xs text-zinc-500">
                {form.isPublished
                  ? "Your form is live and accepting responses"
                  : "Publish to make your form accessible"}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 bg-zinc-900 border-white/10 text-white hover:bg-zinc-800"
                onClick={() => window.open(shareUrl, "_blank")}
              >
                <Eye className="w-4 h-4 mr-2" />
                Open
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-zinc-900 border-white/10 text-white hover:bg-zinc-800"
                onClick={handleDownloadQrCode}
                disabled={isQrGenerating}
              >
                {isQrGenerating ? (
                  <>
                    <Loader className="w-4 h-4 mr-2" />
                    Generating QR Code...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    QR Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full px-4 py-6 sm:px-6 lg:px-8">
        {previewMode ? (
          <div className="w-full flex flex-col items-center">
              {/* Preview Controls */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/10">
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={`px-3 py-2 rounded-md transition-all text-sm font-medium flex items-center gap-2 ${
                      devicePreview === "desktop"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-400"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Desktop</span>
                  </button>
                  <button
                    onClick={() => setDevicePreview("mobile")}
                    className={`px-3 py-2 rounded-md transition-all text-sm font-medium flex items-center gap-2 ${
                      devicePreview === "mobile"
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-500 hover:text-zinc-400"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Mobile</span>
                  </button>
                </div>
              </div>

              {/* Preview Container */}
              <div
                className={`w-full transition-all duration-500 ${devicePreview === "mobile" ? "max-w-[375px]" : "max-w-4xl"}`}
              >
                <div className="bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />
                  <div className="p-4 sm:p-8 overflow-x-hidden">
                    <FormPreview form={form} />
                  </div>
                </div>
              </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 relative">
              {/* Mobile Action Bar */}
              <div className="lg:hidden grid grid-cols-2 gap-3 mb-2 sticky top-0 z-20 pb-2">
                <Sheet open={showMobileAdd} onOpenChange={setShowMobileAdd}>
                  <SheetTrigger asChild>
                    <Button className="w-full bg-zinc-100 hover:bg-zinc-200 text-white shadow-lg shadow-indigo-500/20">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="h-[70vh] bg-zinc-950 border-white/10 p-0 rounded-t-2xl overflow-y-auto scrollbar-hide"
                  >
                    <div className="p-6">
                      <SheetHeader className="mb-4 text-left">
                        <SheetTitle className="text-white">
                          Select Question Type
                        </SheetTitle>
                      </SheetHeader>
                      <QuestionTypesPanel onAddQuestion={handleAddQuestion} />
                    </div>
                  </SheetContent>
                </Sheet>

                <Sheet
                  open={showMobileSettings}
                  onOpenChange={setShowMobileSettings}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-zinc-900 border-white/10 text-white hover:bg-zinc-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-[70%] px-5 sm:w-[400px] bg-zinc-950 border-white/10"
                  >
                    <SheetHeader>
                      <SheetTitle className="text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-indigo-400" />
                        Form Settings
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      {/* FIX: Usage of component in Mobile Sheet */}
                      <SettingsContent
                        form={form}
                        onUpdateSettings={handleUpdateSettings}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Left Sidebar - Tools (Desktop Only) */}
              <div className="hidden lg:block w-64 flex-shrink-0 scrollbar-hide">
                <div className="sticky top-24 space-y-4 ">
                  <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 ">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
                      Add Questions
                    </h3>
                    <QuestionTypesPanel onAddQuestion={handleAddQuestion} />
                  </div>

                  <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">
                      History
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <Undo2 className="w-4 h-4" />
                        <span className="text-xs">Undo</span>
                      </button>
                      <button className="flex-1 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <Redo2 className="w-4 h-4" />
                        <span className="text-xs">Redo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center - Builder */}
              <div className="flex-1 w-full min-w-0 max-w-3xl mx-auto">
                {/* Form Header */}
                <div className="relative group mb-6">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                  <div className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 hover:border-white/20 transition-colors">
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Form Title"
                      className="text-xl sm:text-2xl font-bold bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white placeholder:text-zinc-700 mb-4"
                    />
                    <Textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Add a description to help respondents understand the purpose of this form..."
                      className="bg-transparent border-0 border-b border-transparent hover:border-white/10 focus:border-indigo-500/50 focus:ring-0 px-0 text-white/70 placeholder:text-zinc-600 resize-none text-sm min-h-[60px]"
                      rows={2}
                    />
                  </div>
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
                    {form.questions.map((question) => (
                      <div key={question.id} className="mb-4">
                          <QuestionCard
                            question={question}
                            isActive={activeQuestionId === question.id}
                            onClick={() => setActiveQuestionId(question.id)}
                            onUpdate={(updates) =>
                              handleUpdateQuestion(question.id, updates)
                            }
                            onDelete={() => handleDeleteQuestion(question.id)}
                            onDuplicate={() =>
                              handleDuplicateQuestion(question.id)
                            }
                          />
                      </div>
                    ))}
                  </SortableContext>
                </DndContext>

                {form.questions.length === 0 && (
                  <div className="text-center py-16 bg-zinc-900/60 border border-dashed border-white/10 rounded-2xl">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-zinc-900 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-zinc-700" />
                    </div>
                    <p className="text-zinc-500 font-medium mb-2">
                      Start building your form
                    </p>
                    <p className="text-sm text-zinc-700 px-4">
                      Add your first question using the controls{" "}
                      {window.innerWidth < 1024 ? "above" : "to the left"}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Sidebar - Settings (Desktop Only) */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24">
                  <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-6">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      <h3 className="text-sm font-semibold text-white">
                        Form Settings
                      </h3>
                    </div>
                    {/* FIX: Usage of component in Desktop Sidebar */}
                    <SettingsContent
                      form={form}
                      onUpdateSettings={handleUpdateSettings}
                    />
                  </div>
                </div>
              </div>
          </div>
        )}
      </main>
    </div>
  );
}
