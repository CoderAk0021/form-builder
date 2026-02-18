import { Link, NavLink, Outlet, matchPath, useLocation } from "react-router-dom";
import { ChevronRight, FileText, LayoutDashboard, MessageSquareText } from "lucide-react";
import type { ComponentType } from "react";
import Logo from "@/components/ui/Logo";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import {
  ADMIN_DASHBOARD_SCOPE,
  DASHBOARD_SCOPE_PARAM,
  normalizeDashboardScope,
} from "@/lib/dashboard-scope";

type NavTab = {
  key: "dashboard" | "editor" | "responses";
  label: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
  active: boolean;
};

const segmentStyles =
  "inline-flex items-center rounded-md border border-zinc-800 bg-zinc-900/70 px-2 py-2 text-xs text-zinc-400";

export default function ProtectedAppShell() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const scope = normalizeDashboardScope(
    new URLSearchParams(location.search).get(DASHBOARD_SCOPE_PARAM),
  );
  const scopeQuery =
    isAdmin && scope !== ADMIN_DASHBOARD_SCOPE
      ? `?${DASHBOARD_SCOPE_PARAM}=${encodeURIComponent(scope)}`
      : "";

  const withScope = (path: string) => `${path}${scopeQuery}`;

  const dashboardMatch = matchPath("/dashboard", location.pathname);
  const editorRootMatch = matchPath("/editor", location.pathname);
  const editorMatch = matchPath("/editor/:formId", location.pathname);
  const responsesRootMatch = matchPath("/responses", location.pathname);
  const responsesMatch = matchPath("/form/:id/responses", location.pathname);

  const activeKey: NavTab["key"] = editorMatch
    ? "editor"
    : editorRootMatch
      ? "editor"
      : responsesMatch
      ? "responses"
      : responsesRootMatch
        ? "responses"
      : "dashboard";

  const tabs: NavTab[] = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      to: withScope("/dashboard"),
      active: activeKey === "dashboard",
    },
    {
      key: "editor",
      label: "Editor",
      icon: FileText,
      to: withScope("/editor"),
      active: activeKey === "editor",
    },
    {
      key: "responses",
      label: "Responses",
      icon: MessageSquareText,
      to: withScope("/responses"),
      active: activeKey === "responses",
    },
  ];

  const breadcrumbs = [{ label: "Home", to: withScope("/dashboard") }];

  if (editorMatch?.params.formId) {
    breadcrumbs.push({ label: "Editor", to: withScope("/editor") });
    breadcrumbs.push({
      label: editorMatch.params.formId,
      to: withScope(`/editor/${editorMatch.params.formId}`),
    });
  } else if (editorRootMatch) {
    breadcrumbs.push({ label: "Editor", to: withScope("/editor") });
  } else if (responsesMatch?.params.id) {
    breadcrumbs.push({ label: "Responses", to: withScope("/responses") });
    breadcrumbs.push({
      label: responsesMatch.params.id,
      to: withScope(`/form/${responsesMatch.params.id}/responses`),
    });
  } else if (responsesRootMatch) {
    breadcrumbs.push({ label: "Responses", to: withScope("/responses") });
  } else if (dashboardMatch) {
    breadcrumbs.push({ label: "Dashboard", to: withScope("/dashboard") });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-[#000000]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to={withScope("/dashboard")} className="flex items-center gap-3">
              <div className="h-8 w-8">
                <Logo size={30}/>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-zinc-100">EasyForms</p>
                <p className="text-xs text-zinc-500">Workspace</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {user?.role === "test_user" && user?.picture ? (
                <div className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/70">
                  <img
                    src={user.picture}
                    alt={user.name || user.email || "Test user"}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <span className={segmentStyles}>{user?.sub?.split("@")[0] || "admin"}</span>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  void logout();
                }}
                className="h-8 border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Logout
              </Button>
            </div>
          </div>

          <nav className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              
              const baseClass =
                "relative inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm";

              return (
                <NavLink
                  key={tab.key}
                  to={tab.to}
                  className={() =>
                    `${baseClass} ${
                      tab.active
                        ? "border-zinc-700 bg-zinc-800 text-zinc-100"
                        : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`
                  }
                >
                  
                  {tab.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 pt-3 text-xs text-zinc-500">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
                <Link
                  to={crumb.to}
                  className={
                    index === breadcrumbs.length - 1
                      ? "text-zinc-300"
                      : "text-zinc-500 hover:text-zinc-300"
                  }
                >
                  {crumb.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] px-4 py-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
