import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { listBudgets, listDepartments, listProjects } from "../api";
import type { Budget, Department, Project } from "../types";
import { formatCurrency, formatDate } from "../lib/format";
import { ApiError } from "../api/client";

export default function BudgetControl() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAccess, setHasAccess] = useState(true);
  const [filters, setFilters] = useState({ scopeType: "department", scopeId: "" });
  const [appliedFilters, setAppliedFilters] = useState(filters);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  useEffect(() => {
    void loadBudgets(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    let ignore = false;
    const loadReferences = async () => {
      try {
        const [deps, projs] = await Promise.all([listDepartments(), listProjects()]);
        if (!ignore) {
          setDepartments(deps);
          setProjects(projs);
          setReferenceError(null);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setReferenceError("Failed to load departments/projects");
        }
      }
    };
    void loadReferences();
    return () => {
      ignore = true;
    };
  }, []);

  const loadBudgets = async (params: { scopeType?: string; scopeId?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await listBudgets({
        scopeType: params.scopeType,
        scopeId: params.scopeId?.trim() || undefined,
      });
      setBudgets(data);
      setHasAccess(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        setHasAccess(false);
        setBudgets([]);
      } else {
        console.error(err);
        setError("Unable to load budgets");
      }
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    const total = budgets.reduce((sum, b) => sum + b.totalLimit, 0);
    const reserved = budgets.reduce((sum, b) => sum + b.reservedAmount, 0);
    const spent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
    return { total, reserved, spent };
  }, [budgets]);

  if (!hasAccess) {
    return (
      <Card className="p-8 text-center space-y-3">
        <AlertTriangle className="w-8 h-8 text-orange-500 mx-auto" />
        <h2 className="text-lg font-semibold text-[#0F172A]">Budgets unavailable</h2>
        <p className="text-sm text-gray-600">Only administrators can view budget allocation data.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Budget Control</h1>
          <p className="text-sm text-gray-600 mt-1">Monitor allocations, reservations, and actual spend.</p>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select value={filters.scopeType} onValueChange={(value) => setFilters((prev) => ({ ...prev, scopeType: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="department">Department</SelectItem>
              <SelectItem value="project">Project</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filters.scopeId || "all"}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, scopeId: value === "all" ? "" : value }))}
            disabled={(filters.scopeType === "department" ? departments : projects).length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filters.scopeType}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filters.scopeType === "department" ? "departments" : "projects"}</SelectItem>
              {(filters.scopeType === "department" ? departments : projects).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setAppliedFilters(filters)}>Apply</Button>
        </div>
        {referenceError && <p className="text-xs text-red-600">{referenceError}</p>}
      </Card>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Total Limit" value={formatCurrency(summary.total)} />
        <SummaryCard label="Reserved" value={formatCurrency(summary.reserved)} variant="warning" />
        <SummaryCard label="Spent" value={formatCurrency(summary.spent)} variant="danger" />
      </div>

      <Card className="p-0">
        {loading ? (
          <div className="py-12 text-center text-gray-500">Loading budgets...</div>
        ) : budgets.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No budgets found for current filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-xs text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="text-left font-medium py-3 px-4">Scope</th>
                  <th className="text-left font-medium py-3 px-4">Period</th>
                  <th className="text-left font-medium py-3 px-4">Limit</th>
                  <th className="text-left font-medium py-3 px-4">Reserved</th>
                  <th className="text-left font-medium py-3 px-4">Spent</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => {
                  const remaining = budget.totalLimit - budget.spentAmount;
                  const usage = (budget.spentAmount / budget.totalLimit) * 100;
                  let statusVariant = "success";
                  if (usage > 100) statusVariant = "danger";
                  else if (usage > 90) statusVariant = "warning";

                  return (
                    <tr key={budget.id} className="border-b border-gray-100">
                      <td className="py-4 px-4 text-sm text-[#0F172A] capitalize">
                        {budget.scopeType} • {budget.scopeId.slice(0, 8)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDate(budget.periodStart)} - {formatDate(budget.periodEnd)}
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#0F172A]">
                        {formatCurrency(budget.totalLimit, budget.currency)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {formatCurrency(budget.reservedAmount, budget.currency)}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {formatCurrency(budget.spentAmount, budget.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge
                          className={`capitalize ${
                            statusVariant === "danger"
                              ? "bg-red-100 text-red-700"
                              : statusVariant === "warning"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {usage.toFixed(1)}% used • {remaining >= 0 ? "Remaining" : "Over"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  variant = "default",
}: {
  label: string;
  value: string;
  variant?: "default" | "warning" | "danger";
}) {
  const colors: Record<string, string> = {
    default: "text-[#0F172A]",
    warning: "text-orange-600",
    danger: "text-red-600",
  };
  return (
    <Card className="p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${colors[variant]}`}>{value}</p>
    </Card>
  );
}
