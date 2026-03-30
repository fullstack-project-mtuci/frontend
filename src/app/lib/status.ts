import type { TripStatus, ExpenseReportStatus } from "../types";

export const tripStatusConfig: Record<TripStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  manager_approved: { label: "Manager Approved", className: "bg-purple-100 text-purple-700" },
  manager_rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  accountant_review: { label: "Accountant Review", className: "bg-orange-100 text-orange-700" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", className: "bg-gray-200 text-gray-600" },
};

export const expenseReportStatusConfig: Record<ExpenseReportStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  manager_review: { label: "Manager Review", className: "bg-purple-100 text-purple-700" },
  accountant_review: { label: "Finance Review", className: "bg-orange-100 text-orange-700" },
  needs_revision: { label: "Needs Revision", className: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Approved", className: "bg-green-100 text-green-700" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-700" },
  closed: { label: "Closed", className: "bg-gray-200 text-gray-600" },
};

export function getTripStatusConfig(status: TripStatus | string) {
  return tripStatusConfig[status as TripStatus] || tripStatusConfig.draft;
}

export function getExpenseStatusConfig(status: ExpenseReportStatus | string) {
  return expenseReportStatusConfig[status as ExpenseReportStatus] || expenseReportStatusConfig.draft;
}
