import { apiFetch, type AuthTokens } from "./client";
import { mapApprovalAction, mapAuditLog, mapBudget, mapExpenseItem, mapExpenseReport, mapOcrDraft, mapReceiptFile, mapTrip, mapUser } from "../lib/transformers";
import type {
  ApprovalAction,
  AuditLog,
  Budget,
  ExpenseItem,
  ExpenseItemFormValues,
  ExpenseReport,
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

  return {
    user: mapUser(data?.user),
    tokens: extractTokens(data),
  };
}

export async function fetchProfile(): Promise<User> {
  const data = await apiFetch<any>("/auth/me");
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

function extractTokens(payload: any): AuthTokens {
  return {
    accessToken: payload?.accessToken,
    refreshToken: payload?.refreshToken,
    expiresIn: payload?.expiresIn,
  };
}
