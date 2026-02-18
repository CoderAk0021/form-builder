import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, Loader, MessageSquareText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useForms } from "@/hooks/useForms";
import type { Form } from "@/types/form";
import { useAuth } from "@/context/auth";
import {
  DASHBOARD_SCOPE_PARAM,
  filterFormsByDashboardScope,
  normalizeDashboardScope,
} from "@/lib/dashboard-scope";

function FormCollectionLayout({
  title,
  description,
  icon: Icon,
  forms,
  loading,
  onOpen,
}: {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  forms: Form[];
  loading: boolean;
  onOpen: (form: Form) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      forms.filter((form) =>
        form.title.toLowerCase().includes(query.toLowerCase()),
      ),
    [forms, query],
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Loader className="h-4 w-4 animate-spin" />
          Loading forms
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-zinc-200">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-zinc-100 sm:text-base">{title}</h1>
            <p className="text-xs text-zinc-500">{description}</p>
          </div>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search forms..."
          className="h-9 rounded-md border-zinc-700 bg-zinc-950 pl-9 text-zinc-100 placeholder:text-zinc-500"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-8 text-center text-sm text-zinc-500">
          No forms found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((form) => (
            <button
              key={form.id}
              onClick={() => onOpen(form)}
              className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 text-left hover:border-zinc-700"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium text-zinc-100">{form.title}</p>
                <span className="text-xs text-zinc-500">{form.responseCount || 0}</span>
              </div>
              <p className="line-clamp-2 text-xs text-zinc-500">
                {form.description || "No description provided"}
              </p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export function EditorFormsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { forms, loading } = useForms();
  const isAdmin = user?.role === "admin";
  const selectedScope = normalizeDashboardScope(
    searchParams.get(DASHBOARD_SCOPE_PARAM),
  );
  const scopedForms = useMemo(
    () => filterFormsByDashboardScope(forms, isAdmin, selectedScope),
    [forms, isAdmin, selectedScope],
  );

  return (
    <FormCollectionLayout
      title="Editor"
      description="Pick a form to open in editor mode."
      icon={FileText}
      forms={scopedForms}
      loading={loading}
      onOpen={(form) => {
        navigate(`/editor/${form.id || form._id}${location.search || ""}`, {
          state: { form },
        });
      }}
    />
  );
}

export function ResponsesFormsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { forms, loading } = useForms();
  const isAdmin = user?.role === "admin";
  const selectedScope = normalizeDashboardScope(
    searchParams.get(DASHBOARD_SCOPE_PARAM),
  );
  const scopedForms = useMemo(
    () => filterFormsByDashboardScope(forms, isAdmin, selectedScope),
    [forms, isAdmin, selectedScope],
  );

  return (
    <FormCollectionLayout
      title="Responses"
      description="Pick a form to view response analytics."
      icon={MessageSquareText}
      forms={scopedForms}
      loading={loading}
      onOpen={(form) => {
        navigate(`/form/${form.id || form._id}/responses${location.search || ""}`);
      }}
    />
  );
}
