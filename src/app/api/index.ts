import { apiFetch, type AuthTokens } from "./client";
import {
  mapApprovalAction,
  mapAuditLog,
  mapBudget,
  mapDepartment,
  mapExpenseCategory,
  mapExpenseItem,
  mapExpenseReport,
  mapOcrDraft,
  mapProject,
  mapReceiptFile,
  mapTrip,
  mapUser,
} from "../lib/transformers";
import type {
  AdminUserInput,
  ApprovalAction,
  AuditLog,
  Budget,
  BudgetInput,
  Department,
  DepartmentInput,
  ExpenseCategory,
  ExpenseCategoryInput,
  ExpenseItem,
  ExpenseItemFormValues,
  ExpenseReport,
  Project,
  ProjectInput,
  ReceiptFile,
  ReceiptUploadResponse,
  TripFormValues,
  TripRequest,
  User,
} from "../types";

export async function login(email: string, password: string) {
  const data = await apiFetch<any>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });

  console.log("AUTH returned")
  console.log(data)

  return {
    user: mapUser(data?.user),
    tokens: extractTokens(data),
  };
}

export async function fetchProfile(): Promise<User> {
  const data = await apiFetch<any>("/auth/me");
  return mapUser(data?.user);
}

export async function listDepartments(): Promise<Department[]> {
  const data = await apiFetch<any>("/references/departments");
  return (data?.items || []).map(mapDepartment);
}

export async function listProjects(params?: { departmentId?: string }): Promise<Project[]> {
  const search = new URLSearchParams();
  if (params?.departmentId) {
    search.set("department_id", params.departmentId);
  }
  const query = search.toString();
  const data = await apiFetch<any>(`/references/projects${query ? `?${query}` : ""}`);
  return (data?.items || []).map(mapProject);
}

export async function listCategories(): Promise<ExpenseCategory[]> {
  const data = await apiFetch<any>("/references/categories");
  return (data?.items || []).map(mapExpenseCategory);
}

export async function adminListUsers(params?: { role?: string; includeInactive?: boolean }) {
  const search = new URLSearchParams();
  if (params?.role) {
    search.set("role", params.role);
  }
  if (params?.includeInactive) {
    search.set("include_inactive", "true");
  }
  const query = search.toString();
  const data = await apiFetch<any>(`/admin/users${query ? `?${query}` : ""}`);
  return (data?.items || []).map(mapUser);
}

export async function adminCreateUser(payload: AdminUserInput) {
  const data = await apiFetch<any>("/admin/users", {
    method: "POST",
    body: serializeAdminUserPayload(payload),
  });
  return mapUser(data?.user);
}

export async function adminUpdateUser(id: string, payload: AdminUserInput) {
  const data = await apiFetch<any>(`/admin/users/${id}`, {
    method: "PUT",
    body: serializeAdminUserPayload(payload),
  });
  return mapUser(data?.user);
}

export async function fetchTrips(): Promise<TripRequest[]> {
  const data = await apiFetch<any>("/trip-requests");
  const items: any[] = data?.items || [];
  return items.map(mapTrip);
}

export async function fetchTrip(id: string): Promise<TripRequest> {
  const data = await apiFetch<any>(`/trip-requests/${id}`);
  return mapTrip(data?.trip);
}

export async function createTrip(payload: TripFormValues): Promise<TripRequest> {
  const data = await apiFetch<any>("/trip-requests", {
    method: "POST",
    body: serializeTripPayload(payload),
  });
  return mapTrip(data?.trip);
}

export async function updateTrip(id: string, payload: TripFormValues): Promise<TripRequest> {
  const data = await apiFetch<any>(`/trip-requests/${id}`, {
    method: "PUT",
    body: serializeTripPayload(payload),
  });
  return mapTrip(data?.trip);
}

export async function updateTripStatus(id: string, status: string, comment?: string): Promise<{ trip: TripRequest; warnings?: string[] }> {
  const data = await apiFetch<any>(`/trip-requests/${id}/status`, {
    method: "PATCH",
    body: {
      status,
      comment,
    },
  });
  return {
    trip: mapTrip(data?.trip),
    warnings: data?.warnings,
  };
}

export async function deleteTrip(id: string) {
  await apiFetch(`/trip-requests/${id}`, { method: "DELETE" });
}

export async function fetchExpenseReport(tripId: string): Promise<{ report: ExpenseReport; items: ExpenseItem[] }> {
  const data = await apiFetch<any>(`/trip-requests/${tripId}/expense-report`);
  return {
    report: mapExpenseReport(data?.report),
    items: (data?.items || []).map(mapExpenseItem),
  };
}

export async function createExpenseReport(tripId: string) {
  const data = await apiFetch<any>(`/trip-requests/${tripId}/expense-report`, {
    method: "POST",
  });
  return mapExpenseReport(data?.report);
}

export async function addExpenseItem(reportId: string, values: ExpenseItemFormValues) {
  const data = await apiFetch<any>(`/expense-reports/${reportId}/items`, {
    method: "POST",
    body: serializeExpenseItem(values),
  });
  return mapExpenseItem(data?.item);
}

export async function updateExpenseItem(reportId: string, itemId: string, values: ExpenseItemFormValues) {
  const data = await apiFetch<any>(`/expense-reports/${reportId}/items/${itemId}`, {
    method: "PUT",
    body: serializeExpenseItem(values),
  });
  return mapExpenseItem(data?.item);
}

export async function deleteExpenseItem(reportId: string, itemId: string) {
  await apiFetch(`/expense-reports/${reportId}/items/${itemId}`, { method: "DELETE" });
}

export async function updateExpenseReportStatus(reportId: string, status: string, comment?: string) {
  const data = await apiFetch<any>(`/expense-reports/${reportId}/status`, {
    method: "PATCH",
    body: { status, comment },
  });
  return mapExpenseReport(data?.report);
}

export async function uploadReceipt(file: File): Promise<ReceiptUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const data = await apiFetch<any>("/receipts", { method: "POST", body: formData });
  return {
    file: mapReceiptFile(data?.file),
    ocrDraft: mapOcrDraft(data?.ocrDraft),
  };
}

export async function listReceipts(limit = 20): Promise<ReceiptFile[]> {
  const data = await apiFetch<any>(`/receipts?limit=${limit}`);
  return (data?.items || []).map(mapReceiptFile);
}

export async function listBudgets(params?: { scopeType?: string; scopeId?: string }) {
  const search = new URLSearchParams();
  if (params?.scopeType) {
    search.set("scope_type", params.scopeType);
  }
  if (params?.scopeId) {
    search.set("scope_id", params.scopeId);
  }
  const query = search.toString();
  const data = await apiFetch<any>(`/admin/budgets${query ? `?${query}` : ""}`);
  return (data?.items || []).map(mapBudget);
}

export async function adminCreateBudget(payload: BudgetInput) {
  const data = await apiFetch<any>("/admin/budgets", {
    method: "POST",
    body: serializeBudgetInput(payload),
  });
  return mapBudget(data?.budget);
}

export async function adminListDepartments(): Promise<Department[]> {
  const data = await apiFetch<any>("/admin/departments");
  return (data?.items || []).map(mapDepartment);
}

export async function adminCreateDepartment(input: DepartmentInput) {
  const data = await apiFetch<any>("/admin/departments", {
    method: "POST",
    body: input,
  });
  return mapDepartment(data?.department);
}

export async function adminUpdateDepartment(id: string, input: DepartmentInput) {
  const data = await apiFetch<any>(`/admin/departments/${id}`, {
    method: "PUT",
    body: input,
  });
  return mapDepartment(data?.department);
}

export async function adminDeleteDepartment(id: string) {
  await apiFetch(`/admin/departments/${id}`, { method: "DELETE" });
}

export async function adminListProjects(params?: { departmentId?: string }) {
  const search = new URLSearchParams();
  if (params?.departmentId) {
    search.set("department_id", params.departmentId);
  }
  const query = search.toString();
  const data = await apiFetch<any>(`/admin/projects${query ? `?${query}` : ""}`);
  return (data?.items || []).map(mapProject);
}

export async function adminCreateProject(input: ProjectInput) {
  const data = await apiFetch<any>("/admin/projects", {
    method: "POST",
    body: serializeProjectInput(input),
  });
  return mapProject(data?.project);
}

export async function adminUpdateProject(id: string, input: ProjectInput) {
  const data = await apiFetch<any>(`/admin/projects/${id}`, {
    method: "PUT",
    body: serializeProjectInput(input),
  });
  return mapProject(data?.project);
}

export async function adminDeleteProject(id: string) {
  await apiFetch(`/admin/projects/${id}`, { method: "DELETE" });
}

export async function adminListCategories(): Promise<ExpenseCategory[]> {
  const data = await apiFetch<any>("/admin/categories");
  return (data?.items || []).map(mapExpenseCategory);
}

export async function adminCreateCategory(input: ExpenseCategoryInput) {
  const data = await apiFetch<any>("/admin/categories", {
    method: "POST",
    body: serializeCategoryInput(input),
  });
  return mapExpenseCategory(data?.category);
}

export async function adminUpdateCategory(id: string, input: ExpenseCategoryInput) {
  const data = await apiFetch<any>(`/admin/categories/${id}`, {
    method: "PUT",
    body: serializeCategoryInput(input),
  });
  return mapExpenseCategory(data?.category);
}

export async function adminDeleteCategory(id: string) {
  await apiFetch(`/admin/categories/${id}`, { method: "DELETE" });
}

export async function fetchApprovals(entityType: string, entityId: string): Promise<ApprovalAction[]> {
  const data = await apiFetch<any>(`/audit/${entityType}/${entityId}/approvals`);
  return (data?.items || []).map(mapApprovalAction);
}

export async function fetchAuditLog(entityType: string, entityId: string): Promise<AuditLog[]> {
  const data = await apiFetch<any>(`/audit/${entityType}/${entityId}/logs`);
  return (data?.items || []).map(mapAuditLog);
}

function serializeTripPayload(payload: TripFormValues) {
  return {
    destination_city: payload.destinationCity,
    destination_country: payload.destinationCountry,
    purpose: payload.purpose,
    comment: payload.comment || "",
    start_date: payload.startDate,
    end_date: payload.endDate,
    planned_transport: payload.plannedTransport,
    planned_hotel: payload.plannedHotel,
    planned_daily_allowance: payload.plannedDailyAllowance,
    planned_other: payload.plannedOther,
    currency: payload.currency,
    project_id: payload.projectId || undefined,
  };
}

function serializeExpenseItem(values: ExpenseItemFormValues) {
  return {
    category: values.category,
    expense_date: values.expenseDate,
    vendor_name: values.vendorName,
    amount: values.amount,
    currency: values.currency,
    tax_amount: values.taxAmount,
    description: values.description,
    receipt_file_id: values.receiptFileId,
    source: values.source || "manual",
  };
}

function serializeAdminUserPayload(payload: AdminUserInput) {
  const body: Record<string, unknown> = {
    email: payload.email.trim().toLowerCase(),
    full_name: payload.fullName.trim(),
    role: payload.role,
    department_id: normalizeNullable(payload.departmentId),
    manager_id: normalizeNullable(payload.managerId),
    is_active: payload.isActive,
  };
  if (payload.password && payload.password.trim().length > 0) {
    body.password = payload.password;
  }
  return body;
}

function serializeProjectInput(input: ProjectInput) {
  return {
    name: input.name,
    code: input.code,
    department_id: normalizeNullable(input.departmentId),
    is_active: input.isActive,
  };
}

function serializeCategoryInput(input: ExpenseCategoryInput) {
  return {
    name: input.name,
    code: input.code,
    is_active: input.isActive,
  };
}

function serializeBudgetInput(input: BudgetInput) {
  return {
    scope_type: input.scopeType,
    scope_id: input.scopeId,
    period_start: input.periodStart,
    period_end: input.periodEnd,
    total_limit: input.totalLimit,
    currency: input.currency,
  };
}

function normalizeNullable(value?: string | null) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return value;
}

function extractTokens(payload: any): AuthTokens {
  return {
    accessToken: payload?.accessToken,
    refreshToken: payload?.refreshToken,
    expiresIn: payload?.expiresIn,
  };
}
