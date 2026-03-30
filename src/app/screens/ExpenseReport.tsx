import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, Plus, X, FileText, Camera, AlertCircle, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  addExpenseItem,
  createExpenseReport,
  deleteExpenseItem,
  fetchExpenseReport,
  updateExpenseReportStatus,
  uploadReceipt,
} from "../api";
import type { ExpenseItem, ExpenseReport, ReceiptFile, ReceiptUploadResponse } from "../types";
import { formatCurrency } from "../lib/format";
import { getExpenseStatusConfig } from "../lib/status";
import { ApiError } from "../api/client";

const categories = ["Transport", "Hotel", "Meals", "Entertainment", "Other"];

type ExpenseFormState = {
  category: string;
  expenseDate: string;
  vendorName: string;
  amount: string;
  currency: string;
  taxAmount: string;
  description: string;
  receiptFileId?: string;
};

const defaultForm = (currency: string): ExpenseFormState => ({
  category: "Transport",
  expenseDate: "",
  vendorName: "",
  amount: "0",
  currency,
  taxAmount: "0",
  description: "",
});

export default function ExpenseReportScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ExpenseReport | null>(null);
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [missingReport, setMissingReport] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [formState, setFormState] = useState<ExpenseFormState>(defaultForm("USD"));
  const [receiptPreview, setReceiptPreview] = useState<ReceiptFile | null>(null);
  const [statusComment, setStatusComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      void loadReport(id);
    }
  }, [id]);

  const loadReport = async (tripId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setMissingReport(false);
      const data = await fetchExpenseReport(tripId);
      setReport(data.report);
      setItems(data.items);
      setFormState(defaultForm(data.report.currency));
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setMissingReport(true);
      } else {
        setError("Unable to load expense report");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReport = async () => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      const created = await createExpenseReport(id);
      setReport(created);
      setItems([]);
      setMissingReport(false);
      setFormState(defaultForm(created.currency));
    } catch (err) {
      console.error(err);
      setError("Failed to create expense report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReceiptUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !report) return;
    try {
      const response: ReceiptUploadResponse = await uploadReceipt(file);
      setReceiptPreview(response.file);
      setFormVisible(true);
      setFormState((prev) => ({
        ...prev,
        expenseDate: response.ocrDraft?.expenseDate || prev.expenseDate,
        amount: response.ocrDraft?.amount ? String(response.ocrDraft.amount) : prev.amount,
        currency: response.ocrDraft?.currency || report.currency,
        vendorName: response.ocrDraft?.vendor || prev.vendorName,
        taxAmount: response.ocrDraft?.tax ? String(response.ocrDraft.tax) : prev.taxAmount,
        receiptFileId: response.file.id,
      }));
    } catch (err) {
      console.error(err);
      setError("Failed to upload receipt");
    }
  };

  const handleAddExpense = async () => {
    if (!report) return;
    try {
      setIsSubmitting(true);
      await addExpenseItem(report.id, {
        category: formState.category,
        expenseDate: formState.expenseDate,
        vendorName: formState.vendorName,
        amount: Number(formState.amount) || 0,
        currency: formState.currency || report.currency,
        taxAmount: Number(formState.taxAmount) || 0,
        description: formState.description,
        receiptFileId: formState.receiptFileId,
      });
      await loadReport(report.tripRequestId);
      setFormVisible(false);
      setReceiptPreview(null);
    } catch (err) {
      console.error(err);
      setError("Unable to add expense");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (itemId: string) => {
    if (!report) return;
    if (!window.confirm("Remove this expense?")) return;
    try {
      await deleteExpenseItem(report.id, itemId);
      await loadReport(report.tripRequestId);
    } catch (err) {
      console.error(err);
      setError("Failed to delete expense");
    }
  };

  const handleSubmitReport = async () => {
    if (!report) return;
    try {
      setIsSubmitting(true);
      const updated = await updateExpenseReportStatus(report.id, "submitted", statusComment);
      setReport(updated);
      setStatusComment("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totals = useMemo(() => {
    if (!report) return { advance: 0, spent: 0, balance: 0 };
    return {
      advance: report.advanceAmount,
      spent: report.totalExpenses,
      balance: report.balanceAmount,
    };
  }, [report]);

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading expense report...</div>;
  }

  if (missingReport) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate(`/trips/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip
        </Button>
        <Card className="p-8 text-center space-y-4">
          <FileText className="w-10 h-10 text-gray-400 mx-auto" />
          <p className="text-gray-600">No expense report created for this trip yet.</p>
          <Button onClick={handleCreateReport} disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Expense Report"}
          </Button>
        </Card>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const statusConfig = getExpenseStatusConfig(report.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/trips/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Expense Report</h1>
          <p className="text-sm text-gray-600 mt-1">Status: <Badge className={`${statusConfig.className} capitalize`}>{statusConfig.label}</Badge></p>
        </div>
        {report.status === "draft" && (
          <div className="flex gap-3">
            <Input
              placeholder="Comment (optional)"
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              className="w-64"
            />
            <Button onClick={handleSubmitReport} disabled={isSubmitting} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
              Submit Report
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SummaryCard label="Advance" value={formatCurrency(totals.advance, report.currency)} subtitle="Paid before trip" />
            <SummaryCard label="Spent" value={formatCurrency(totals.spent, report.currency)} subtitle={`${items.length} expenses`} variant="warning" />
            <SummaryCard
              label={totals.balance >= 0 ? "To Return" : "To Reimburse"}
              value={formatCurrency(Math.abs(totals.balance), report.currency)}
              subtitle="Balance"
              variant={totals.balance >= 0 ? "success" : "danger"}
            />
          </div>

          {!formVisible ? (
            <Card className="p-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center">
                  <Camera className="w-8 h-8" />
                </div>
                <p className="text-sm text-gray-600">Upload a receipt or add an expense manually.</p>
                <div className="flex gap-3">
                  <label htmlFor="receipt-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Receipt
                      </span>
                    </Button>
                  </label>
                  <Button variant="outline" onClick={() => setFormVisible(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Manual Entry
                  </Button>
                </div>
                <input id="receipt-upload" type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} />
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#0F172A]">New Expense</h3>
                <Button variant="ghost" size="sm" onClick={() => setFormVisible(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {receiptPreview && (
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Attached receipt: {receiptPreview.originalFilename}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={formState.category} onValueChange={(value) => setFormState((prev) => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={formState.expenseDate} onChange={(e) => setFormState((prev) => ({ ...prev, expenseDate: e.target.value }))} />
                </div>
                <div>
                  <Label>Vendor</Label>
                  <Input value={formState.vendorName} onChange={(e) => setFormState((prev) => ({ ...prev, vendorName: e.target.value }))} />
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input type="number" value={formState.amount} onChange={(e) => setFormState((prev) => ({ ...prev, amount: e.target.value }))} />
                </div>
                <div>
                  <Label>Currency</Label>
                  <Input value={formState.currency} onChange={(e) => setFormState((prev) => ({ ...prev, currency: e.target.value }))} />
                </div>
                <div>
                  <Label>Tax Amount</Label>
                  <Input type="number" value={formState.taxAmount} onChange={(e) => setFormState((prev) => ({ ...prev, taxAmount: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea value={formState.description} onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))} rows={3} />
                </div>
              </div>

              <Button className="w-full" onClick={handleAddExpense} disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Add Expense"}
              </Button>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">Expenses ({items.length})</h3>
            {items.length === 0 ? (
              <div className="text-center text-gray-500 py-6">No expenses added yet.</div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-4">
                    <div>
                      <p className="font-medium text-[#0F172A]">{item.vendorName}</p>
                      <p className="text-xs text-gray-500">{item.category} • {item.expenseDate.split("T")[0]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-[#0F172A]">
                        {formatCurrency(item.amount, item.currency)}
                      </p>
                      <p className="text-xs text-gray-500">Tax: {formatCurrency(item.taxAmount, item.currency)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(item.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Categories summary</h3>
            {groupByCategory(items).map(([category, value]) => (
              <div key={category} className="flex items-center justify-between text-sm text-gray-700 py-2 border-b border-gray-100 last:border-0">
                <span>{category}</span>
                <span>{formatCurrency(value, report.currency)}</span>
              </div>
            ))}
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Notes</h3>
            <Textarea rows={4} placeholder="Add any internal notes for finance..." />
          </Card>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, subtitle, variant = "default" }: { label: string; value: string; subtitle?: string; variant?: "default" | "warning" | "success" | "danger" }) {
  const colors: Record<string, string> = {
    default: "text-[#0F172A]",
    warning: "text-orange-600",
    success: "text-green-600",
    danger: "text-red-600",
  };
  return (
    <Card className="p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${colors[variant]}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </Card>
  );
}

function groupByCategory(items: ExpenseItem[]) {
  const totals = new Map<string, number>();
  items.forEach((item) => {
    totals.set(item.category, (totals.get(item.category) || 0) + item.amount);
  });
  return Array.from(totals.entries());
}
