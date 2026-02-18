import { useEffect, useMemo, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForms } from "@/hooks/useForms";
import type { Form } from "@/types/form";
import { DEFAULT_FORM } from "@/types/form";
import { generateId } from "@/utils/id";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/auth";
import { formsApi, type TestUserActivity } from "@/api";
import {
  ADMIN_DASHBOARD_SCOPE,
  DASHBOARD_SCOPE_PARAM,
  filterFormsByDashboardScope,
  normalizeDashboardScope,
} from "@/lib/dashboard-scope";

interface DashboardProps {
  onEditForm: (form: Form) => void;
}

export  function Dashboard({ onEditForm }: DashboardProps) {
  const { forms, loading, createForm, deleteForm } = useForms();
  const { user } = useAuth();
  const activeTab = "forms";
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [formToDelete, setFormToDelete] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activities, setActivities] = useState<TestUserActivity[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = user?.role === "admin";
  const isTestUser = user?.role === "test_user";
  const selectedDashboard = normalizeDashboardScope(
    searchParams.get(DASHBOARD_SCOPE_PARAM),
  );
  const hasReachedTestUserFormLimit = isTestUser && forms.length >= 1;
  const dashboardScopeSearch = location.search || "";

  const dashboardOptions = useMemo(() => {
    if (!isAdmin) return [];

    const optionMap = new Map<string, { value: string; label: string }>();

    forms.forEach((form) => {
      const ownerTestUserId = form.owner?.testUserId;
      if (ownerTestUserId) {
        const email = form.owner?.email || ownerTestUserId;
        optionMap.set(`test:${ownerTestUserId}`, {
          value: `test:${ownerTestUserId}`,
          label: email,
        });
      }
    });

    activities.forEach((activity) => {
      if (activity.testUserId) {
        optionMap.set(`test:${activity.testUserId}`, {
          value: `test:${activity.testUserId}`,
          label: activity.email || activity.testUserId,
        });
      }
    });

    if (
      selectedDashboard.startsWith("test:") &&
      !optionMap.has(selectedDashboard)
    ) {
      const fallbackId = selectedDashboard.replace("test:", "");
      optionMap.set(selectedDashboard, {
        value: selectedDashboard,
        label: `Selected test user (${fallbackId.slice(0, 8)})`,
      });
    }

    return [
      { value: ADMIN_DASHBOARD_SCOPE, label: "Admin Dashboard" },
      ...Array.from(optionMap.values()).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    ];
  }, [activities, forms, isAdmin, selectedDashboard]);

  const setSelectedDashboard = (nextScope: string) => {
    const normalizedScope = normalizeDashboardScope(nextScope);
    const nextSearch = new URLSearchParams(searchParams);
    if (normalizedScope === ADMIN_DASHBOARD_SCOPE || !isAdmin) {
      nextSearch.delete(DASHBOARD_SCOPE_PARAM);
    } else {
      nextSearch.set(DASHBOARD_SCOPE_PARAM, normalizedScope);
    }
    setSearchParams(nextSearch, { replace: true });
  };

  useEffect(() => {
    if (!isAdmin) {
      if (selectedDashboard !== ADMIN_DASHBOARD_SCOPE) {
        setSelectedDashboard(ADMIN_DASHBOARD_SCOPE);
      }
    }
  }, [isAdmin, selectedDashboard]);

  const scopedForms = useMemo(() => {
    return filterFormsByDashboardScope(forms, isAdmin, selectedDashboard);
  }, [forms, isAdmin, selectedDashboard]);

  const filteredForms = scopedForms.filter((form) =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const isViewingTestUserDashboard =
    isAdmin && selectedDashboard.startsWith("test:");
  const disableCreate =
    hasReachedTestUserFormLimit || isViewingTestUserDashboard;
  const selectedDashboardLabel =
    dashboardOptions.find((option) => option.value === selectedDashboard)
      ?.label || null;

  const handleCreateForm = async () => {
    if (isViewingTestUserDashboard) {
      toast.error("Switch to Admin Dashboard to create admin forms");
      return;
    }
    if (hasReachedTestUserFormLimit) {
      toast.error("Test users can create only one form");
      return;
    }
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
    if (isViewingTestUserDashboard) {
      toast.error("Switch to Admin Dashboard to create admin forms");
      return;
    }
    if (hasReachedTestUserFormLimit) {
      toast.error("Test users can create only one form");
      return;
    }
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
    if (isTestUser && template?.questions?.some((question) => question.type === "file_upload")) {
      toast.error("Test users cannot use templates with file upload fields");
      return;
    }
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

  useEffect(() => {
    void (async () => {
      if (user?.role !== "admin") return;
      try {
        const data = await formsApi.getTestUserActivities();
        setActivities(data);
      } catch {
        setActivities([]);
      }
    })();
  }, [user?.role]);

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
        disableCreate={disableCreate}
      />
      {isAdmin && (
        <div className="mb-4 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Dashboard view
            </p>
            <Select
              value={selectedDashboard}
              onValueChange={setSelectedDashboard}
            >
              <SelectTrigger className="h-9 w-full border-zinc-700 bg-zinc-950 text-zinc-100 sm:w-[320px]">
                <SelectValue placeholder="Select dashboard scope" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-950 text-zinc-100">
                {dashboardOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {isViewingTestUserDashboard && selectedDashboardLabel && (
            <p className="mt-2 text-xs text-zinc-500">
              Viewing test user dashboard for {selectedDashboardLabel}
            </p>
          )}
        </div>
      )}

      <DashboardWorkspace
        forms={scopedForms}
        filteredForms={filteredForms}
        activeTab={activeTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreateClick={() => setShowTemplates(true)}
        onEditForm={onEditForm}
        onViewResponses={(form) => {
          navigate(`/form/${form.id || form._id}/responses${dashboardScopeSearch}`);
        }}
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
        activities={isViewingTestUserDashboard ? [] : activities}
        disableCreate={disableCreate}
        dashboardTitle={
          isViewingTestUserDashboard
            ? "Test User Dashboard"
            : isAdmin
            ? "Admin Dashboard"
            : "Test User Dashboard"
        }
        dashboardDescription={
          isViewingTestUserDashboard
            ? "Review this test user's forms and response activity."
            : isAdmin
            ? "Manage admin forms and monitor test user activity."
            : "Manage your test user form with restricted features."
        }
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
