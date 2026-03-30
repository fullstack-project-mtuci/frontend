export type Role = "employee" | "manager" | "accountant" | "admin";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus =
  | "draft"
  | "submitted"
  | "manager_approved"
  | "manager_rejected"
  | "accountant_review"
  | "approved"
  | "cancelled";

export interface TripRequest {
  id: string;
  employeeId: string;
  projectId?: string;
  budgetId?: string;
  destinationCity: string;
  destinationCountry: string;
  purpose: string;
  comment: string;
  startDate: string;
  endDate: string;
  plannedTransport: number;
  plannedHotel: number;
  plannedDailyAllowance: number;
  plannedOther: number;
  plannedTotal: number;
  currency: string;
  status: TripStatus;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseReportStatus =
  | "draft"
  | "submitted"
  | "manager_review"
  | "accountant_review"
  | "needs_revision"
  | "approved"
  | "rejected"
  | "closed";

export interface ExpenseReport {
  id: string;
  tripRequestId: string;
  employeeId: string;
  advanceAmount: number;
  totalExpenses: number;
  balanceAmount: number;
  currency: string;
  status: ExpenseReportStatus;
  submittedAt?: string;
  reviewedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseItemStatus = "draft" | "pending_review" | "accepted" | "rejected";
export type ExpenseSource = "manual" | "ocr_draft";

export interface ExpenseItem {
  id: string;
  expenseReportId: string;
  category: string;
  expenseDate: string;
  vendorName: string;
  amount: number;
  currency: string;
  taxAmount: number;
  description: string;
  receiptFileId?: string;
  source: ExpenseSource;
  ocrConfidence?: number;
  status: ExpenseItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptFile {
  id: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  createdAt: string;
  downloadUrl?: string;
}

export interface OcrDraft {
  expenseDate?: string;
  amount?: number;
  currency?: string;
  vendor?: string;
  tax?: number;
  confidence?: number;
  raw?: unknown;
}

export type BudgetScopeType = "department" | "project";

export interface Budget {
  id: string;
  scopeType: BudgetScopeType;
  scopeId: string;
  periodStart: string;
  periodEnd: string;
  totalLimit: number;
  reservedAmount: number;
  spentAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalAction {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  comment: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeJson?: string;
  afterJson?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type ReceiptUploadResponse = {
  file: ReceiptFile;
  ocrDraft?: OcrDraft;
};

export interface TripFormValues {
  destinationCity: string;
  destinationCountry: string;
  purpose: string;
  comment?: string;
  startDate: string;
  endDate: string;
  plannedTransport: number;
  plannedHotel: number;
  plannedDailyAllowance: number;
  plannedOther: number;
  currency: string;
  projectId?: string | null;
}

export interface ExpenseItemFormValues {
  category: string;
  expenseDate: string;
  vendorName: string;
  amount: number;
  currency: string;
  taxAmount: number;
  description: string;
  receiptFileId?: string;
  source?: ExpenseSource;
}
