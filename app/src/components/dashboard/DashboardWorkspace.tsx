import {
  Activity,
  BarChart2,
  Clock,
  Edit3,
  FileText,
  Globe,
  LayoutGrid,
  List,
  MoreVertical,
  PieChart,
  Share2,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import type { Form } from "@/types/form";
import type { TestUserActivity } from "@/api";
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
  activities?: TestUserActivity[];
  disableCreate?: boolean;
  dashboardTitle?: string;
  dashboardDescription?: string;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(value);
}

function formatRelativeTime(dateString: string) {
  const createdAtMs = new Date(dateString).getTime();
  const diffMs = Date.now() - createdAtMs;
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
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
  activities = [],
  disableCreate = false,
  dashboardTitle = "Dashboard",
  dashboardDescription = "Manage all forms in one place.",
}: DashboardWorkspaceProps) {
  const analytics = useMemo(() => {
    const totalForms = forms.length;
    const totalResponses = forms.reduce(
      (acc, form) => acc + (form.responseCount || 0),
      0,
    );
    const publishedForms = forms.filter((form) => form.isPublished).length;
    const drafts = totalForms - publishedForms;
    const formsWithResponses = forms.filter(
      (form) => (form.responseCount || 0) > 0,
    ).length;
    const avgResponsesPerForm = totalForms ? totalResponses / totalForms : 0;
    const publishRate = totalForms ? (publishedForms / totalForms) * 100 : 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyUpdated = forms.filter(
      (form) => new Date(form.updatedAt).getTime() >= sevenDaysAgo,
    ).length;

    const topForms = [...forms]
      .sort((a, b) => b.responseCount - a.responseCount)
      .slice(0, 5);
    const peakResponses = topForms[0]?.responseCount || 1;

    const recentActivities = [...activities]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 24);
    const activityInLast7Days = activities.filter(
      (activity) => new Date(activity.createdAt).getTime() >= sevenDaysAgo,
    ).length;
    const uniqueActiveTestUsers = new Set(
      activities.map((activity) => activity.testUserId),
    ).size;
    const actionCountMap = new Map<string, number>();
    activities.forEach((activity) => {
      actionCountMap.set(
        activity.action,
        (actionCountMap.get(activity.action) || 0) + 1,
      );
    });
    const topActions = Array.from(actionCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([action, count]) => ({ action, count }));

    const userMap = new Map<
      string,
      { id: string; email: string; count: number; lastSeenAt: string }
    >();
    activities.forEach((activity) => {
      const userId = activity.testUserId || activity.email;
      if (!userId) return;
      const existing = userMap.get(userId);
      if (!existing) {
        userMap.set(userId, {
          id: userId,
          email: activity.email || "unknown",
          count: 1,
          lastSeenAt: activity.createdAt,
        });
        return;
      }
      existing.count += 1;
      if (
        new Date(activity.createdAt).getTime() >
        new Date(existing.lastSeenAt).getTime()
      ) {
        existing.lastSeenAt = activity.createdAt;
      }
    });

    const topActiveUsers = Array.from(userMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalForms,
      totalResponses,
      publishedForms,
      drafts,
      formsWithResponses,
      avgResponsesPerForm,
      publishRate,
      recentlyUpdated,
      topForms,
      peakResponses,
      recentActivities,
      activityInLast7Days,
      uniqueActiveTestUsers,
      topActions,
      topActiveUsers,
    };
  }, [activities, forms]);

  return (
    <main className="grid min-h-[60vh] grid-cols-1 gap-6 py-2 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="h-fit rounded-lg border border-zinc-800 bg-[#0b0b0b]">
        <div className="border-b border-zinc-800 px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Metadata
          </p>
          <h2 className="mt-1 text-sm font-medium text-zinc-100">
            {dashboardTitle} stats
          </h2>
        </div>
        <div className="space-y-4 p-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Total forms</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {analytics.totalForms}
            </p>
          </div>
          <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500">Total responses</p>
            <p className="mt-1 text-xl font-semibold text-zinc-100">
              {analytics.totalResponses.toLocaleString()}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs text-zinc-500">Published</p>
              <p className="mt-1 text-lg font-semibold text-zinc-100">
                {analytics.publishedForms}
              </p>
            </div>
            <div className="rounded-md border border-zinc-800 bg-zinc-900/40 p-3">
              <p className="text-xs text-zinc-500">Drafts</p>
              <p className="mt-1 text-lg font-semibold text-zinc-100">
                {analytics.drafts}
              </p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
              Top response forms
            </p>
            <div className="space-y-2">
              {analytics.topForms.length === 0 ? (
                <p className="text-xs text-zinc-500">No forms available.</p>
              ) : (
                analytics.topForms.slice(0, 4).map((form) => (
                  <div
                    key={form.id}
                    className="rounded-md border border-zinc-800 bg-zinc-900/30 px-3 py-2"
                  >
                    <p className="truncate text-sm text-zinc-200">
                      {form.title}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {form.responseCount} responses
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {analytics.recentActivities.length > 0 && (
            <div>
              <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
                Test user activity
              </p>
              <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-900/30 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded border border-zinc-800 bg-zinc-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      7d activity
                    </p>
                    <p className="text-sm font-semibold text-zinc-200">
                      {analytics.activityInLast7Days}
                    </p>
                  </div>
                  <div className="rounded border border-zinc-800 bg-zinc-900/40 p-2">
                    <p className="text-[11px] uppercase tracking-wide text-zinc-500">
                      Active users
                    </p>
                    <p className="text-sm font-semibold text-zinc-200">
                      {analytics.uniqueActiveTestUsers}
                    </p>
                  </div>
                </div>

                {analytics.topActions.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">
                      Top actions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {analytics.topActions.map((item) => (
                        <span
                          key={item.action}
                          className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-300"
                        >
                          {item.action} ({item.count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.topActiveUsers.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">
                      Top active users
                    </p>
                    <div className="space-y-1.5">
                      {analytics.topActiveUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs text-zinc-200">
                              {user.email}
                            </p>
                            <p className="text-[11px] text-zinc-500">
                              Last seen {formatRelativeTime(user.lastSeenAt)}
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[11px] text-zinc-300">
                            <Users className="h-3 w-3" />
                            {user.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-[11px] uppercase tracking-wide text-zinc-500">
                    Recent feed (latest {analytics.recentActivities.length})
                  </p>
                  <div className="max-h-52 space-y-1.5 overflow-y-auto pr-1">
                    {analytics.recentActivities.map((activity) => (
                      <div
                        key={activity._id || `${activity.email}-${activity.createdAt}`}
                        className="rounded border border-zinc-800 bg-zinc-900/50 px-2 py-1.5"
                      >
                        <p className="truncate text-xs text-zinc-200">
                          {activity.email}
                        </p>
                        <p className="truncate text-[11px] text-zinc-500">
                          {activity.action}
                        </p>
                        <p className="text-[11px] text-zinc-600">
                          {formatRelativeTime(activity.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <section className="rounded-lg border border-zinc-800 bg-[#0b0b0b]">
        <div className="grid gap-3 border-b border-zinc-800 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Responses
              </p>
              <BarChart2 className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {formatCompactNumber(analytics.totalResponses)}
            </p>
            <p className="text-xs text-zinc-500">
              Across {analytics.totalForms} forms
            </p>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Average/Form
              </p>
              <TrendingUp className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {analytics.avgResponsesPerForm.toFixed(1)}
            </p>
            <p className="text-xs text-zinc-500">Response depth per form</p>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Publish Rate
              </p>
              <PieChart className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {analytics.publishRate.toFixed(0)}%
            </p>
            <p className="text-xs text-zinc-500">
              {analytics.publishedForms} published, {analytics.drafts} drafts
            </p>
          </div>

          <div className="rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-start justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-500">
                Recently Updated
              </p>
              <Activity className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="mt-2 text-xl font-semibold text-zinc-100">
              {analytics.recentlyUpdated}
            </p>
            <p className="text-xs text-zinc-500">Last 7 days</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3 sm:px-5">
          <div>
            <h3 className="text-sm font-medium text-zinc-100">
              {activeTab === "responses"
                ? `${dashboardTitle} responses`
                : `${dashboardTitle} forms`}
            </h3>
            <p className="text-xs text-zinc-500">
              {activeTab === "responses"
                ? "Track response activity and form performance."
                : dashboardDescription}
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
              disabled={disableCreate}
              onClick={onCreateClick}
              variant="outline"
              className="h-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              New
            </Button>
          </div>
        </div>

        {analytics.topForms.length > 0 && (
          <div className="border-b border-zinc-800 px-4 py-3 sm:px-5">
            <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">
              Response distribution
            </p>
            <div className="space-y-2">
              {analytics.topForms.slice(0, 4).map((form) => (
                <div key={`dist-${form.id}`} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="max-w-[75%] truncate">{form.title}</span>
                    <span>{form.responseCount} responses</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-zinc-300"
                      style={{
                        width: `${Math.max(
                          8,
                          ((form.responseCount || 0) / analytics.peakResponses) * 100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              {analytics.formsWithResponses} of {analytics.totalForms} forms
              have at least one response.
            </p>
          </div>
        )}

        {filteredForms.length === 0 ? (
          <div className="p-10 text-center">
            <h4 className="text-base font-medium text-zinc-200">
              No forms found
            </h4>
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
                  <p className="truncate text-sm font-medium text-zinc-100">
                    {form.title}
                  </p>
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
                    <p className="truncate text-sm font-medium text-zinc-100">
                      {form.title}
                    </p>
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
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
