import {
  BarChart2,
  Clock,
  Edit3,
  FileText,
  Globe,
  LayoutGrid,
  List,
  MoreVertical,
  Share2,
  Trash2,
} from "lucide-react";
import type { Form } from "@/types/form";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type DashboardTab = "overview" | "forms" | "responses";
type ViewMode = "grid" | "list";

interface DashboardWorkspaceProps {
  forms: Form[];
  filteredForms: Form[];
  activeTab: DashboardTab;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onCreateClick: () => void;
  onEditForm: (form: Form) => void;
  onViewResponses: (form: Form) => void;
  onDeleteForm: (formId: string) => void;
  onShareForm: (form: Form) => void;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DashboardWorkspace({
  forms,
  filteredForms,
  activeTab,
  viewMode,
  onViewModeChange,
  onCreateClick,
  onEditForm,
  onViewResponses,
  onDeleteForm,
  onShareForm,
}: DashboardWorkspaceProps) {
  const totalResponses = forms.reduce(
    (acc, form) => acc + (form.responseCount || 0),
    0,
  );
  const publishedForms = forms.filter((form) => form.isPublished).length;
  const drafts = forms.length - publishedForms;
  const topForms = [...forms]
    .sort((a, b) => b.responseCount - a.responseCount)
    .slice(0, 4);

  return (
    <main className="grid min-h-[60vh] grid-cols-1 gap-6 py-2 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-lg border border-zinc-800 bg-[#0b0b0b]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Metadata</p>
          <h2 className="mt-1 text-sm font-medium text-zinc-100">Workspace stats</h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Total forms</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">{forms.length}</p>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Total responses</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {totalResponses.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs text-zinc-500">Published</p>
              <p className="mt-1 text-lg font-semibold text-zinc-100">{publishedForms}</p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs text-zinc-500">Drafts</p>
              <p className="mt-1 text-lg font-semibold text-zinc-100">{drafts}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
              Top response forms
            </p>
            <div className="space-y-2">
              {topForms.length === 0 ? (
                <p className="text-xs text-zinc-500">No forms available.</p>
              ) : (
                topForms.map((form) => (
                  <div
                    key={form.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2"
                  >
                    <p className="truncate text-sm text-zinc-200">{form.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {form.responseCount} responses
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </aside>

      <section className="rounded-lg border border-zinc-800 bg-[#0b0b0b]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-sm font-medium text-zinc-100">
              {activeTab === "responses" ? "Responses" : "Forms"}
            </h3>
            <p className="text-xs text-zinc-500">
              {activeTab === "responses"
                ? "Track response activity and form performance."
                : "Manage all forms in one place."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-md border border-zinc-700 bg-zinc-900 p-0.5">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`rounded px-2 py-1 ${
                  viewMode === "grid"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`rounded px-2 py-1 ${
                  viewMode === "list"
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={onCreateClick}
              variant="outline"
              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
            >
              New
            </Button>
          </div>
        </div>

        {filteredForms.length === 0 ? (
          <div className="p-10 text-center">
            <h4 className="text-base font-medium text-zinc-200">No forms found</h4>
            <p className="mt-2 text-sm text-zinc-500">
              Adjust your filters or create a new form.
            </p>
          </div>
        ) : activeTab === "responses" ? (
          <div className="space-y-3 p-4 sm:p-5">
            {filteredForms.map((form) => (
              <div
                key={form.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/30 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-100">{form.title}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Updated {formatDate(form.updatedAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1">
                    <BarChart2 className="h-3.5 w-3.5" />
                    {form.responseCount}
                  </span>
                  <button
                    onClick={() => onViewResponses(form)}
                    className="rounded border border-zinc-700 px-2 py-1 text-zinc-300 hover:bg-zinc-800"
                  >
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3"
                : "space-y-2 p-4 sm:p-5"
            }
          >
            {filteredForms.map((form) => (
              <div
                key={form.id}
                onClick={() => onEditForm(form)}
                className={
                  viewMode === "grid"
                    ? "cursor-pointer rounded-md border border-zinc-800 bg-zinc-900/30 p-4 hover:border-zinc-700"
                    : "flex cursor-pointer items-center justify-between gap-3 rounded-md border border-zinc-800 bg-zinc-900/30 px-4 py-3 hover:border-zinc-700"
                }
              >
                <div className={viewMode === "grid" ? "space-y-3" : "min-w-0"}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900">
                      <FileText className="h-4 w-4 text-zinc-300" />
                    </div>
                    {viewMode === "grid" && (
                      <span
                        className={`rounded px-2 py-0.5 text-xs ${
                          form.isPublished
                            ? "border border-emerald-800 bg-emerald-950/40 text-emerald-300"
                            : "border border-amber-800 bg-amber-950/30 text-amber-300"
                        }`}
                      >
                        {form.isPublished ? "Published" : "Draft"}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="truncate text-sm font-medium text-zinc-100">{form.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                      {form.description || "No description provided"}
                    </p>
                  </div>

                  {viewMode === "grid" && (
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                      <span className="inline-flex items-center gap-1">
                        <BarChart2 className="h-3.5 w-3.5" />
                        {form.responseCount}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(form.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {viewMode === "list" && (
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span
                      className={`rounded px-2 py-0.5 ${
                        form.isPublished
                          ? "border border-emerald-800 bg-emerald-950/40 text-emerald-300"
                          : "border border-amber-800 bg-amber-950/30 text-amber-300"
                      }`}
                    >
                      {form.isPublished ? "Published" : "Draft"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <BarChart2 className="h-3.5 w-3.5" />
                      {form.responseCount}
                    </span>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="rounded p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 border-zinc-700 bg-[#111111] text-zinc-200"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-zinc-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditForm(form);
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-zinc-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewResponses(form);
                      }}
                    >
                      <Globe className="mr-2 h-4 w-4" />
                      Responses
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer focus:bg-zinc-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        onShareForm(form);
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-400 focus:bg-red-950/40 focus:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteForm(form._id || form.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
