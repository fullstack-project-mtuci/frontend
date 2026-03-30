import { useState } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  Check,
  X,
  MessageSquare,
  MapPin,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";

interface ApprovalItem {
  id: number;
  type: "trip" | "expense";
  employee: string;
  destination: string;
  dates: string;
  amount: number;
  status: string;
}

const pendingApprovals: ApprovalItem[] = [
  {
    id: 1,
    type: "expense",
    employee: "Sarah Johnson",
    destination: "New York, USA",
    dates: "Apr 15 - 18, 2026",
    amount: 2340,
    status: "pending",
  },
  {
    id: 2,
    type: "trip",
    employee: "Robert Wilson",
    destination: "Tokyo, Japan",
    dates: "Jun 10 - 15, 2026",
    amount: 6800,
    status: "pending",
  },
  {
    id: 3,
    type: "expense",
    employee: "Anna Martinez",
    destination: "Paris, France",
    dates: "Apr 8 - 12, 2026",
    amount: 1200,
    status: "pending",
  },
];

export default function ApprovalScreen() {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<ApprovalItem>(
    pendingApprovals[0]
  );
  const [comments, setComments] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const expenses = [
    { category: "Transport", planned: 1500, actual: 890 },
    { category: "Hotel", planned: 2000, actual: 1200 },
    { category: "Meals", planned: 600, actual: 250 },
    { category: "Other", planned: 400, actual: 0 },
  ];

  const handleApprove = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      // Remove approved item from list
    }, 2000);
  };

  const handleReject = () => {
    if (comments.trim()) {
      alert("Expense report rejected with comments");
    } else {
      alert("Please provide a reason for rejection");
    }
  };

  const handleRequestChanges = () => {
    if (comments.trim()) {
      alert("Changes requested");
    } else {
      alert("Please specify what changes are needed");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#0F172A]">
          Approval Center
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Review and approve pending trips and expense reports
        </p>
      </div>

      {showSuccess && (
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-green-900">Approved Successfully</p>
              <p className="text-sm text-green-700">
                The employee has been notified
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Items List */}
        <Card className="p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F172A]">
              Pending ({pendingApprovals.length})
            </h2>
          </div>

          <div className="space-y-2">
            {pendingApprovals.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  selectedItem.id === item.id
                    ? "border-[#2563EB] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {item.employee
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {item.employee}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      item.type === "expense"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }
                  >
                    {item.type}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.destination}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{item.dates}</p>
                  <p className="text-sm font-semibold text-[#0F172A]">
                    ${item.amount.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Details Panel */}
        <Card className="p-6 lg:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              {/* Employee Info */}
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  Request Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Employee</p>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {selectedItem.employee}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Destination</p>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {selectedItem.destination}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Travel Dates</p>
                      <p className="text-sm font-medium text-[#0F172A]">
                        {selectedItem.dates}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-600">Type</p>
                      <p className="text-sm font-medium text-[#0F172A] capitalize">
                        {selectedItem.type} Request
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-600 mb-3">
                  Purpose
                </h4>
                <p className="text-sm text-[#0F172A]">
                  Attend client meetings with Acme Corp to discuss Q2
                  partnership opportunities and product roadmap alignment.
                  Meeting with key stakeholders including CEO and Product team.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  Budget Comparison
                </h3>
                <div className="space-y-4">
                  {expenses.map((expense, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-[#0F172A]">
                          {expense.category}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Planned</p>
                            <p className="text-sm font-medium text-gray-700">
                              ${expense.planned}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Actual</p>
                            <p className="text-sm font-semibold text-[#0F172A]">
                              ${expense.actual}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Variance</p>
                            <p
                              className={`text-sm font-semibold ${
                                expense.actual <= expense.planned
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              ${expense.planned - expense.actual}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            expense.actual <= expense.planned
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                          style={{
                            width: `${Math.min(
                              (expense.actual / expense.planned) * 100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-[#0F172A]">
                      Total
                    </span>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Planned</p>
                        <p className="text-lg font-semibold text-gray-700">
                          $
                          {expenses.reduce(
                            (sum, exp) => sum + exp.planned,
                            0
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Actual</p>
                        <p className="text-lg font-semibold text-[#2563EB]">
                          $
                          {expenses.reduce((sum, exp) => sum + exp.actual, 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
                  Activity Timeline
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">
                        Expense report submitted
                      </p>
                      <p className="text-xs text-gray-500">
                        Apr 19, 2026 at 2:30 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">
                        All receipts uploaded
                      </p>
                      <p className="text-xs text-gray-500">
                        Apr 18, 2026 at 5:45 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">
                        Trip completed
                      </p>
                      <p className="text-xs text-gray-500">
                        Apr 18, 2026 at 6:00 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0F172A]">
                        Trip started
                      </p>
                      <p className="text-xs text-gray-500">
                        Apr 15, 2026 at 8:00 AM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Comments Section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Label htmlFor="comments" className="text-sm font-medium mb-2">
              Comments or Feedback
            </Label>
            <Textarea
              id="comments"
              placeholder="Add comments or specify required changes..."
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-3">
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
            >
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-orange-600 text-orange-600 hover:bg-orange-50"
              onClick={handleRequestChanges}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Request Changes
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              onClick={handleReject}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
