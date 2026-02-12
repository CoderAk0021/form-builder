import { useState } from "react";
import { Loader, Trash2 } from "lucide-react";
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
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardWorkspace } from "@/components/dashboard/DashboardWorkspace";
import { useForms } from "@/hooks/useForms";
import type { Form } from "@/types/form";
import { DEFAULT_FORM } from "@/types/form";
import { generateId } from "@/utils/id";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface DashboardProps {
  onEditForm: (form: Form) => void;
}

export  function Dashboard({ onEditForm }: DashboardProps) {
  const { forms, loading, createForm, deleteForm } = useForms();
  const activeTab = "forms";
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
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

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#0a0a0a]">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader className="h-4 w-4 animate-spin" />
          Loading dashboard
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-zinc-100">
      <DashboardHeader
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        showTemplates={showTemplates}
        onShowTemplatesChange={setShowTemplates}
        onCreateBlankForm={handleCreateForm}
        onCreateFromTemplate={handleCreateFromTemplate}
      />

      <DashboardWorkspace
        forms={forms}
        filteredForms={filteredForms}
        activeTab={activeTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateClick={() => setShowTemplates(true)}
        onEditForm={onEditForm}
        onViewResponses={(form) =>
          navigate(`/form/${form.id || form._id}/responses`)
        }
        onDeleteForm={(formId) => setFormToDelete(formId)}
        onShareForm={async (form) => {
          const link = `${window.location.origin}/form/${form.id || form._id}`;
          try {
            await navigator.clipboard.writeText(link);
            toast.success("Public form link copied");
          } catch {
            toast.error("Unable to copy form link");
          }
        }}
      />

      <AlertDialog
        open={!!formToDelete}
        onOpenChange={() => setFormToDelete(null)}
      >
        <AlertDialogContent className="max-w-sm rounded-lg border-zinc-700 bg-[#111111] text-zinc-100">
          <AlertDialogHeader>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-800 bg-red-950/40">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-zinc-100">
              Delete Form
            </AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed text-zinc-400">
              Are you sure you want to delete this form? This action cannot be
              undone and all responses will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-3">
            <AlertDialogCancel className="rounded-md border-zinc-700 bg-zinc-900 px-6 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-md border-0 bg-red-600 px-6 text-white hover:bg-red-700"
            >
              Delete Form
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
