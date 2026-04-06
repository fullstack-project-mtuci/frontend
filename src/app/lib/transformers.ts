import type {
  ApprovalAction,
  AuditLog,
  Budget,
  Department,
  ExpenseCategory,
  ExpenseItem,
  ExpenseReport,
  OcrDraft,
  Project,
  ReceiptFile,
  TripRequest,
  User,
} from "../types";

const pickString = (value: unknown): string => (typeof value === "string" ? value : value ? String(value) : "");
const pickNumber = (value: unknown): number => (typeof value === "number" ? value : Number(value ?? 0));

const optionalString = (value: unknown): string | undefined => {
  const asString = pickString(value);
  return asString ? asString : undefined;
};

export function mapUser(payload: any): User {
  return {
    id: pickString(payload?.id),
    email: pickString(payload?.email),
    fullName: pickString(payload?.full_name || payload?.fullName),
    role: pickString(payload?.role) as User["role"],
    departmentId: optionalString(payload?.department_id || payload?.departmentId),
    managerId: optionalString(payload?.manager_id || payload?.managerId),
    isActive: Boolean(payload?.is_active ?? payload?.isActive ?? true),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapTrip(payload: any): TripRequest {
  return {
    id: pickString(payload?.id),
    employeeId: pickString(payload?.employee_id || payload?.employeeId),
    projectId: optionalString(payload?.project_id || payload?.projectId),
    budgetId: optionalString(payload?.budget_id || payload?.budgetId),
    destinationCity: pickString(payload?.destination_city || payload?.destinationCity),
    destinationCountry: pickString(payload?.destination_country || payload?.destinationCountry),
    purpose: pickString(payload?.purpose),
    comment: pickString(payload?.comment),
    startDate: pickString(payload?.start_date || payload?.startDate),
    endDate: pickString(payload?.end_date || payload?.endDate),
    plannedTransport: pickNumber(payload?.planned_transport || payload?.plannedTransport),
    plannedHotel: pickNumber(payload?.planned_hotel || payload?.plannedHotel),
    plannedDailyAllowance: pickNumber(payload?.planned_daily_allowance || payload?.plannedDailyAllowance),
    plannedOther: pickNumber(payload?.planned_other || payload?.plannedOther),
    plannedTotal: pickNumber(payload?.planned_total || payload?.plannedTotal),
    currency: pickString(payload?.currency),
    status: pickString(payload?.status) as TripRequest["status"],
    submittedAt: optionalString(payload?.submitted_at || payload?.submittedAt),
    approvedAt: optionalString(payload?.approved_at || payload?.approvedAt),
    rejectedAt: optionalString(payload?.rejected_at || payload?.rejectedAt),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapExpenseReport(payload: any): ExpenseReport {
  return {
    id: pickString(payload?.id),
    tripRequestId: pickString(payload?.trip_request_id || payload?.tripRequestId),
    employeeId: pickString(payload?.employee_id || payload?.employeeId),
    advanceAmount: pickNumber(payload?.advance_amount || payload?.advanceAmount),
    totalExpenses: pickNumber(payload?.total_expenses || payload?.totalExpenses),
    balanceAmount: pickNumber(payload?.balance_amount || payload?.balanceAmount),
    currency: pickString(payload?.currency),
    status: pickString(payload?.status) as ExpenseReport["status"],
    submittedAt: optionalString(payload?.submitted_at || payload?.submittedAt),
    reviewedAt: optionalString(payload?.reviewed_at || payload?.reviewedAt),
    closedAt: optionalString(payload?.closed_at || payload?.closedAt),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapExpenseItem(payload: any): ExpenseItem {
  return {
    id: pickString(payload?.id),
    expenseReportId: pickString(payload?.expense_report_id || payload?.expenseReportId),
    category: pickString(payload?.category),
    expenseDate: pickString(payload?.expense_date || payload?.expenseDate),
    vendorName: pickString(payload?.vendor_name || payload?.vendorName),
    amount: pickNumber(payload?.amount),
    currency: pickString(payload?.currency),
    taxAmount: pickNumber(payload?.tax_amount || payload?.taxAmount),
    description: pickString(payload?.description),
    receiptFileId: optionalString(payload?.receipt_file_id || payload?.receiptFileId),
    source: pickString(payload?.source) as ExpenseItem["source"],
    ocrConfidence:
      payload?.ocr_confidence !== undefined
        ? Number(payload?.ocr_confidence)
        : payload?.ocrConfidence !== undefined
        ? Number(payload?.ocrConfidence)
        : undefined,
    status: pickString(payload?.status) as ExpenseItem["status"],
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapReceiptFile(payload: any): ReceiptFile {
  return {
    id: pickString(payload?.id),
    originalFilename: pickString(payload?.original_filename || payload?.originalFilename),
    mimeType: pickString(payload?.mime_type || payload?.mimeType),
    fileSize: pickNumber(payload?.file_size || payload?.fileSize),
    checksum: pickString(payload?.checksum),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    downloadUrl: optionalString(payload?.download_url || payload?.downloadUrl),
  };
}

export function mapOcrDraft(payload: any): OcrDraft | undefined {
  if (!payload) {
    return undefined;
  }
  return {
    expenseDate: optionalString(payload?.expenseDate || payload?.expense_date),
    amount: payload?.amount !== undefined ? Number(payload?.amount) : undefined,
    currency: optionalString(payload?.currency),
    vendor: optionalString(payload?.vendor),
    tax: payload?.tax !== undefined ? Number(payload?.tax) : undefined,
    confidence: payload?.confidence !== undefined ? Number(payload?.confidence) : undefined,
    raw: payload?.raw,
  };
}

export function mapBudget(payload: any): Budget {
  return {
    id: pickString(payload?.id),
    scopeType: pickString(payload?.scope_type || payload?.scopeType) as Budget["scopeType"],
    scopeId: pickString(payload?.scope_id || payload?.scopeId),
    periodStart: pickString(payload?.period_start || payload?.periodStart),
    periodEnd: pickString(payload?.period_end || payload?.periodEnd),
    totalLimit: pickNumber(payload?.total_limit || payload?.totalLimit),
    reservedAmount: pickNumber(payload?.reserved_amount || payload?.reservedAmount),
    spentAmount: pickNumber(payload?.spent_amount || payload?.spentAmount),
    currency: pickString(payload?.currency),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapApprovalAction(payload: any): ApprovalAction {
  return {
    id: pickString(payload?.id),
    entityType: pickString(payload?.entity_type || payload?.entityType),
    entityId: pickString(payload?.entity_id || payload?.entityId),
    action: pickString(payload?.action),
    actorId: pickString(payload?.actor_id || payload?.actorId),
    comment: pickString(payload?.comment),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
  };
}

export function mapAuditLog(payload: any): AuditLog {
  return {
    id: pickString(payload?.id),
    actorId: pickString(payload?.actor_id || payload?.actorId),
    action: pickString(payload?.action),
    entityType: pickString(payload?.entity_type || payload?.entityType),
    entityId: pickString(payload?.entity_id || payload?.entityId),
    beforeJson: optionalString(payload?.before_json || payload?.beforeJson),
    afterJson: optionalString(payload?.after_json || payload?.afterJson),
    ipAddress: optionalString(payload?.ip_address || payload?.ipAddress),
    userAgent: optionalString(payload?.user_agent || payload?.userAgent),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
  };
}

export function mapDepartment(payload: any): Department {
  return {
    id: pickString(payload?.id),
    name: pickString(payload?.name),
    code: pickString(payload?.code),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapProject(payload: any): Project {
  return {
    id: pickString(payload?.id),
    name: pickString(payload?.name),
    code: pickString(payload?.code),
    departmentId: optionalString(payload?.department_id || payload?.departmentId),
    isActive: Boolean(payload?.is_active ?? payload?.isActive ?? true),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}

export function mapExpenseCategory(payload: any): ExpenseCategory {
  return {
    id: pickString(payload?.id),
    name: pickString(payload?.name),
    code: pickString(payload?.code),
    isActive: Boolean(payload?.is_active ?? payload?.isActive ?? true),
    createdAt: pickString(payload?.created_at || payload?.createdAt),
    updatedAt: pickString(payload?.updated_at || payload?.updatedAt),
  };
}
