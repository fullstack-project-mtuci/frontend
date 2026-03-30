import { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Building2,
  Download,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const departments = [
  {
    name: "Engineering",
    budget: 120000,
    spent: 95000,
    trips: 18,
    status: "healthy",
  },
  {
    name: "Sales",
    budget: 150000,
    spent: 142000,
    trips: 32,
    status: "warning",
  },
  {
    name: "Marketing",
    budget: 80000,
    spent: 65000,
    trips: 15,
    status: "healthy",
  },
  {
    name: "Product",
    budget: 90000,
    spent: 92000,
    trips: 12,
    status: "exceeded",
  },
  {
    name: "Operations",
    budget: 60000,
    spent: 48000,
    trips: 10,
    status: "healthy",
  },
];

const monthlyData = [
  { month: "Jan", budget: 80000, spent: 75000, id: "jan-2026" },
  { month: "Feb", budget: 80000, spent: 78000, id: "feb-2026" },
  { month: "Mar", budget: 80000, spent: 82000, id: "mar-2026" },
  { month: "Apr", budget: 80000, spent: 69000, id: "apr-2026" },
];

const categoryData = [
  { name: "Transport", value: 156000, color: "#2563EB", id: "transport" },
  { name: "Accommodation", value: 198000, color: "#7C3AED", id: "accommodation" },
  { name: "Meals", value: 52000, color: "#059669", id: "meals" },
  { name: "Other", value: 36000, color: "#F59E0B", id: "other" },
];

export default function BudgetControl() {
  const [selectedPeriod, setSelectedPeriod] = useState("2026");

  const totalBudget = departments.reduce((sum, dept) => sum + dept.budget, 0);
  const totalSpent = departments.reduce((sum, dept) => sum + dept.spent, 0);
  const percentUsed = (totalSpent / totalBudget) * 100;
  const exceededCount = departments.filter(
    (d) => d.status === "exceeded"
  ).length;
  const warningCount = departments.filter((d) => d.status === "warning").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "warning":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "exceeded":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Budget Control
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and manage departmental travel budgets
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Budget</p>
              <p className="text-3xl font-semibold text-[#0F172A] mb-1">
                ${(totalBudget / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">Fiscal Year 2026</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Spent</p>
              <p className="text-3xl font-semibold text-[#0F172A] mb-1">
                ${(totalSpent / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500">
                {percentUsed.toFixed(1)}% of budget
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Departments</p>
              <p className="text-3xl font-semibold text-[#0F172A] mb-1">
                {departments.length}
              </p>
              <p className="text-xs text-gray-500">Active departments</p>
            </div>
            <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-2">Alerts</p>
              <p className="text-3xl font-semibold text-[#0F172A] mb-1">
                {exceededCount + warningCount}
              </p>
              <p className="text-xs text-gray-500">Require attention</p>
            </div>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
            Monthly Spending Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#6B7280", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "#6B7280", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Bar dataKey="budget" fill="#93C5FD" name="Budget" />
              <Bar dataKey="spent" fill="#2563EB" name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E7EB",
                  borderRadius: "8px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Department Budgets */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Department Budgets
          </h2>
          <div className="flex gap-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Healthy
            </Badge>
            <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
              Warning ({">"} 90%)
            </Badge>
            <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
              Exceeded
            </Badge>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Department
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Budget
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Spent
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Remaining
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Usage
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Trips
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const percentUsed = (dept.spent / dept.budget) * 100;
                const remaining = dept.budget - dept.spent;

                return (
                  <tr key={dept.name} className="border-b border-gray-100">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2563EB] rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-medium text-[#0F172A]">
                          {dept.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-sm font-medium text-[#0F172A]">
                      ${dept.budget.toLocaleString()}
                    </td>
                    <td className="py-4 text-sm text-gray-700">
                      ${dept.spent.toLocaleString()}
                    </td>
                    <td className="py-4">
                      <span
                        className={`text-sm font-medium ${
                          remaining >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        ${Math.abs(remaining).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-medium ${
                              percentUsed > 100
                                ? "text-red-600"
                                : percentUsed > 90
                                ? "text-orange-600"
                                : "text-green-600"
                            }`}
                          >
                            {percentUsed.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={Math.min(percentUsed, 100)}
                          className="h-2"
                        />
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-700">
                      {dept.trips}
                    </td>
                    <td className="py-4">
                      <Badge className={getStatusColor(dept.status)}>
                        {dept.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Budget</p>
              <p className="text-lg font-semibold text-[#0F172A]">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Spent</p>
              <p className="text-lg font-semibold text-orange-600">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Remaining</p>
              <p className="text-lg font-semibold text-green-600">
                ${(totalBudget - totalSpent).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Average Usage</p>
              <p className="text-lg font-semibold text-[#2563EB]">
                {percentUsed.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Warnings */}
      {(exceededCount > 0 || warningCount > 0) && (
        <Card className="p-6 bg-orange-50 border-orange-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900 mb-2">
                Budget Alerts
              </h3>
              <ul className="space-y-1">
                {exceededCount > 0 && (
                  <li className="text-sm text-orange-800">
                    • {exceededCount} department(s) have exceeded their budget
                  </li>
                )}
                {warningCount > 0 && (
                  <li className="text-sm text-orange-800">
                    • {warningCount} department(s) are approaching budget limit
                    ({">"} 90%)
                  </li>
                )}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}