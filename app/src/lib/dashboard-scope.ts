import type { Form } from "@/types/form";

export const DASHBOARD_SCOPE_PARAM = "scope";
export const ADMIN_DASHBOARD_SCOPE = "admin";

export function normalizeDashboardScope(
  rawScope: string | null | undefined,
): string {
  const scope = String(rawScope || "").trim();
  if (!scope) return ADMIN_DASHBOARD_SCOPE;
  if (scope.startsWith("test:") && scope.length > "test:".length) {
    return scope;
  }
  if (scope === ADMIN_DASHBOARD_SCOPE) {
    return ADMIN_DASHBOARD_SCOPE;
  }
  return ADMIN_DASHBOARD_SCOPE;
}

export function filterFormsByDashboardScope(
  forms: Form[],
  isAdmin: boolean,
  scope: string,
): Form[] {
  if (!isAdmin) return forms;

  if (scope === ADMIN_DASHBOARD_SCOPE) {
    return forms.filter((form) => form.owner?.role !== "test_user");
  }

  if (scope.startsWith("test:")) {
    const testUserId = scope.replace("test:", "");
    return forms.filter((form) => form.owner?.testUserId === testUserId);
  }

  return forms;
}

export function isFormInDashboardScope(
  form: Form,
  isAdmin: boolean,
  scope: string,
): boolean {
  if (!isAdmin) return true;

  if (scope === ADMIN_DASHBOARD_SCOPE) {
    return form.owner?.role !== "test_user";
  }

  if (scope.startsWith("test:")) {
    const testUserId = scope.replace("test:", "");
    return form.owner?.testUserId === testUserId;
  }

  return true;
}
