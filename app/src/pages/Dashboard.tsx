import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  BarChart3,
  BarChart2,
  Trash2,
  Edit3,
  ExternalLink,
  MoreVertical,
  Search,
  LayoutGrid,
  List,
  Loader2,
  Sparkles,
  Clock,
  Users,
  ArrowUpRight,
  Zap,
  Globe,
  TrendingUp,
  Command,
  ChevronRight,
  FolderOpen,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForms } from "@/hooks/useForms";
import type { Form } from "@/types/form";
import { DEFAULT_FORM } from "@/types/form";
import { generateId } from "@/utils/id";
import { useNavigate } from "react-router-dom";

interface DashboardProps {
  onEditForm: (form: Form) => void;
}

export function Dashboard({ onEditForm }: DashboardProps) {
  const { forms, loading, createForm, deleteForm } = useForms();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredForms = forms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreateForm = async () => {
    const newForm = {
      ...DEFAULT_FORM,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const created = await createForm(newForm);
    if (created) {
      onEditForm(created);
    }
    setShowTemplates(false);
  };

  const handleCreateFromTemplate = async (templateName: string) => {
    const templates: Record<string, Partial<Form>> = {
      "Event Registration": {
        title: "Event Registration",
        description: "Register for our upcoming event",
        questions: [
          {
            id: generateId(),
            type: "short_text",
            title: "Full Name",
            required: true,
          },
          {
            id: generateId(),
            type: "email",
            title: "Email Address",
            required: true,
          },
          {
            id: generateId(),
            type: "dropdown",
            title: "Ticket Type",
            required: true,
            options: [
              { id: "1", label: "General Admission", value: "general" },
              { id: "2", label: "VIP", value: "vip" },
              { id: "3", label: "Student", value: "student" },
            ],
          },
        ],
      },
      "Customer Feedback": {
        title: "Customer Feedback Survey",
        description: "Help us improve our services",
        questions: [
          {
            id: generateId(),
            type: "rating",
            title: "How satisfied are you with our service?",
            required: true,
            maxRating: 5,
          },
          {
            id: generateId(),
            type: "long_text",
            title: "What can we improve?",
            required: false,
          },
          {
            id: generateId(),
            type: "checkbox",
            title: "Which features do you use?",
            required: false,
            options: [
              { id: "1", label: "Feature A", value: "feature_a" },
              { id: "2", label: "Feature B", value: "feature_b" },
              { id: "3", label: "Feature C", value: "feature_c" },
            ],
          },
        ],
      },
      "Job Application": {
        title: "Job Application",
        description: "Apply for a position at our company",
        questions: [
          {
            id: generateId(),
            type: "short_text",
            title: "Full Name",
            required: true,
          },
          {
            id: generateId(),
            type: "email",
            title: "Email Address",
            required: true,
          },
          {
            id: generateId(),
            type: "short_text",
            title: "Position Applying For",
            required: true,
          },
          {
            id: generateId(),
            type: "file_upload",
            title: "Resume/CV",
            required: true,
          },
        ],
      },
    };

    const template = templates[templateName];
    if (template) {
      const newForm = {
        ...DEFAULT_FORM,
        ...template,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const created = await createForm(newForm);
      if (created) {
        onEditForm(created);
      }
    }
    setShowTemplates(false);
  };

  const handleDelete = async () => {
    if (formToDelete) {
      await deleteForm(formToDelete);
      setFormToDelete(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return "Today";
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#0a0a0f] to-[#0a0a0f]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 border-2 border-white/5 rounded-full" />
            <div className="absolute inset-0 w-12 h-12 border-2 border-t-indigo-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div
              className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-cyan-500/50 rounded-full animate-spin"
              style={{ animationDuration: "2s", animationDirection: "reverse" }}
            />
          </div>
          <p className="text-sm text-white/40 font-medium tracking-wider uppercase">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[128px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/5 rounded-full blur-[120px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  FormCraft
                </h1>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium hidden sm:block">
                  Pro
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative hidden md:block group">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-indigo-400 transition-colors" />
                <Input
                  placeholder="Search forms..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:bg-white/10 focus:border-indigo-500/50 focus:ring-indigo-500/20 rounded-full transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-white/20 border border-white/10 rounded px-1.5 py-0.5">
                  <Command className="w-3 h-3" />
                  <span>K</span>
                </div>
              </div>

              <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
                <DialogTrigger asChild>
                  <Button className="relative group bg-white text-black hover:bg-white/90 rounded-full px-3 sm:px-5 font-medium shadow-lg shadow-white/10 hover:shadow-white/20 transition-all overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* Reduced margin on mobile since text is hidden */}
                    <Plus className="w-4 h-4 sm:mr-2 relative z-10" />
                    <span className="relative z-10 hidden sm:inline">
                      Create
                    </span>
                  </Button>
                </DialogTrigger>

                {/* Responsive Content Container */}
                <DialogContent className="w-[95vw] sm:max-w-3xl max-h-[85vh] overflow-y-auto bg-[#0f0f14] border-white/10 text-white shadow-2xl shadow-black/50 rounded-2xl p-0 overflow-hidden gap-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5 pointer-events-none" />

                  <div className="p-6 sm:p-8 relative">
                    <DialogHeader className="relative mb-6 text-left">
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                        Create new form
                      </DialogTitle>
                      <DialogDescription className="text-sm sm:text-base text-white/50">
                        Start from scratch or use a pre-built template
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 relative">
                      {/* Blank Form Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleCreateForm}
                        className="group p-4 sm:p-6 border border-dashed border-white/10 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 transition-all text-center relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all duration-300 border border-white/5 group-hover:border-indigo-500/30">
                            <Plus className="w-6 h-6 sm:w-7 sm:h-7 text-white/40 group-hover:text-indigo-400" />
                          </div>
                          <p className="font-semibold text-white mb-1 text-sm sm:text-base">
                            Blank Form
                          </p>
                          <p className="text-xs sm:text-sm text-white/40">
                            Start from scratch
                          </p>
                        </div>
                      </motion.button>

                      {/* Template Buttons */}
                      {[
                        {
                          name: "Event Registration",
                          icon: Users,
                          color: "from-blue-500/20 to-indigo-500/20",
                          border: "border-blue-500/30",
                          iconColor: "text-blue-400",
                        },
                        {
                          name: "Customer Feedback",
                          icon: Activity,
                          color: "from-amber-500/20 to-orange-500/20",
                          border: "border-amber-500/30",
                          iconColor: "text-amber-400",
                        },
                        {
                          name: "Job Application",
                          icon: FolderOpen,
                          color: "from-emerald-500/20 to-teal-500/20",
                          border: "border-emerald-500/30",
                          iconColor: "text-emerald-400",
                        },
                      ].map((template) => (
                        <motion.button
                          key={template.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleCreateFromTemplate(template.name)
                          }
                          className="group p-4 sm:p-6 border border-white/10 rounded-2xl hover:border-white/20 hover:bg-white/5 transition-all text-left relative bg-white/[0.02]"
                        >
                          <div
                            className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-100 transition-opacity`}
                          />
                          <div className="relative">
                            <div
                              className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${template.color} rounded-2xl flex items-center justify-center mb-3 sm:mb-4 border ${template.border} group-hover:scale-110 transition-transform duration-300`}
                            >
                              <template.icon
                                className={`w-6 h-6 sm:w-7 sm:h-7 ${template.iconColor}`}
                              />
                            </div>
                            <p className="font-semibold text-white mb-1 text-sm sm:text-base">
                              {template.name}
                            </p>
                            <p className="text-xs sm:text-sm text-white/40">
                              Pre-built template
                            </p>
                            <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                              <ChevronRight className="w-5 h-5 text-white/60" />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <div className="px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium">
              Pro
            </div>
          </div>
          <p className="text-white/40 text-lg">
            Manage your forms and analyze responses
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              label: "Total Forms",
              value: forms.length,
              icon: FileText,
              trend: "+12%",
              gradient: "from-indigo-500/20 to-purple-500/20",
              glow: "group-hover:shadow-indigo-500/20",
            },
            {
              label: "Total Responses",
              value: forms
                .reduce((acc, form) => acc + form.responseCount, 0)
                .toLocaleString(),
              icon: BarChart3,
              trend: "+8.2%",
              gradient: "from-cyan-500/20 to-blue-500/20",
              glow: "group-hover:shadow-cyan-500/20",
            },
            {
              label: "Published",
              value: forms.filter((f) => f.isPublished).length,
              icon: Globe,
              trend: "Live",
              gradient: "from-emerald-500/20 to-teal-500/20",
              glow: "group-hover:shadow-emerald-500/20",
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`group relative overflow-hidden rounded-2xl border border-white/5 bg-gray-950 p-6 hover:border-white/10 transition-all duration-300 ${stat.glow} hover:shadow-lg`}
            >
              <div
                className={`absolute inset-0 bg-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-white/40 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-white mb-2">
                    {stat.value}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                    <span className="text-xs text-white/30">vs last month</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-6 h-6 text-white/60" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">Your Forms</h3>
            <div className="h-6 w-px bg-white/10" />
            <span className="text-sm text-white/40">
              {filteredForms.length} forms
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative md:hidden flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-full"
              />
            </div>

            <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "grid"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  viewMode === "list"
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Forms Display */}
        {filteredForms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative overflow-hidden rounded-3xl border border-white/5 bg-gray-950 p-16 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />
            <div className="relative">
              <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">
                No forms yet
              </h3>
              <p className="text-white/40 mb-8 max-w-md mx-auto">
                Create your first form to start collecting responses and
                analyzing data
              </p>
              <Button
                onClick={() => setShowTemplates(true)}
                className="bg-white text-black hover:bg-white/90 rounded-full px-8 font-medium shadow-lg shadow-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Form
              </Button>
            </div>
          </motion.div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                : "flex flex-col gap-3"
            }
          >
            {filteredForms.map((form) => (
              <div
                key={form.id}
                onMouseEnter={() => setHoveredCard(form.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={
                  viewMode === "grid"
                    ? "group relative rounded-2xl border border-gray-800 bg-gray-950/90 hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer overflow-hidden"
                    : "group flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-gray-950/70 hover:border-white/10 hover:bg-white/[0.04] transition-all cursor-pointer"
                }
                onClick={() => onEditForm(form)}
              >
                {viewMode === "grid" ? (
                  <>
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                    <div className="relative p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <FileText className="w-6 h-6 text-indigo-400" />
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-all">
                              <MoreVertical className="w-4 h-4 text-white/40" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="w-48 bg-[#0f0f14] border-white/10 text-white"
                          >
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/form/${form.id || form._id}/responses`,
                                );
                              }}
                              className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                            >
                              <BarChart2 className="w-4 h-4 mr-2 text-white/60" />
                              Responses
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditForm(form);
                              }}
                              className="hover:bg-white/5 focus:bg-white/5 cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4 mr-2 text-white/60" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                setFormToDelete(form._id || form.id);
                              }}
                              className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {form.title}
                      </h3>

                      <p className="text-sm text-white/40 line-clamp-2 mb-6 h-10">
                        {form.description || "No description provided"}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                              form.isPublished
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                            }`}
                          >
                            {form.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-white/30">
                          <span className="flex items-center gap-1.5">
                            <BarChart2 className="w-3.5 h-3.5" />
                            {form.responseCount}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDate(form.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Left Side: Icon & Identity */}
                    <div className="flex items-center gap-4 flex-1 min-w-0 mr-6">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                        <FileText className="w-5 h-5 text-indigo-400" />
                      </div>

                      <div className="flex-col min-w-0">
                        <h3 className="font-medium text-white text-sm truncate group-hover:text-indigo-300 transition-colors">
                          {form.title}
                        </h3>
                        <p className="text-xs text-white/40 truncate max-w-[300px]">
                          {form.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    {/* Right Side: Metadata & Actions Grid */}
                    <div className="flex items-center gap-6 flex-shrink-0">
                      {/* Metadata Group (Hidden on very small screens) */}
                      <div className="hidden sm:flex items-center gap-4 text-xs">
                        {/* Status Badge */}
                        <span
                          className={`px-2 py-0.5 rounded-full font-medium border ${
                            form.isPublished
                              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/5 border-amber-500/20 text-amber-400"
                          }`}
                        >
                          {form.isPublished ? "Published" : "Draft"}
                        </span>

                        {/* Vertical Divider */}
                        <div className="w-px h-3 bg-white/10" />

                        {/* Response Count */}
                        <div
                          className="flex items-center gap-1.5 text-white/50 w-16"
                          title="Total Responses"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span className="tabular-nums">
                            {form.responseCount}
                          </span>
                        </div>

                        {/* Date (Optional - Assuming you have a date field, highly recommended for List View) */}
                        <div className="hidden md:flex items-center gap-1.5 text-white/30 w-24">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="tabular-nums">
                            {new Date(
                              form.updatedAt || Date.now(),
                            ).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions Group */}
                      <div className="flex items-center gap-1 border-l border-white/5 pl-4">
                        {/* Edit (Primary Action - Always visible but dimmed) */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditForm(form);
                          }}
                          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit Form"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        {/* Secondary Actions (Visible on Hover) */}
                        <div className="flex items-center gap-1 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(
                                `/form/${form.id || form._id}/responses`,
                              );
                            }}
                            className="h-8 w-8 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10"
                            title="View Responses"
                          >
                            <BarChart2 className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormToDelete(form._id || form.id);
                            }}
                            className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10"
                            title="Delete Form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!formToDelete}
        onOpenChange={() => setFormToDelete(null)}
      >
        <AlertDialogContent className="bg-[#0f0f14] border-white/10 text-white shadow-2xl rounded-2xl max-w-sm">
          <AlertDialogHeader>
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-white">
              Delete Form
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/50 leading-relaxed">
              Are you sure you want to delete this form? This action cannot be
              undone and all responses will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-3 mt-6">
            <AlertDialogCancel className="rounded-full bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white px-6">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-full bg-red-500 hover:bg-red-600 text-white border-0 px-6 shadow-lg shadow-red-500/20"
            >
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
