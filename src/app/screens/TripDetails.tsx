import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  Upload,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";

export default function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data
  const trip = {
    id: id,
    employee: "Sarah Johnson",
    destination: "New York, USA",
    startDate: "Apr 15, 2026",
    endDate: "Apr 18, 2026",
    purpose:
      "Attend client meetings with Acme Corp to discuss Q2 partnership opportunities and product roadmap alignment.",
    status: "in-progress",
    budget: 4500,
    spent: 2340,
    advance: 2000,
    expenses: [
      { category: "Transport", planned: 1500, actual: 890 },
      { category: "Hotel", planned: 2000, actual: 1200 },
      { category: "Daily Allowance", planned: 800, actual: 250 },
      { category: "Other", planned: 200, actual: 0 },
    ],
  };

  const percentUsed = (trip.spent / trip.budget) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Button>
      </div>

      {/* Trip Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              {trip.destination}
            </h1>
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
              {trip.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {trip.startDate} - {trip.endDate}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.employee}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate(`/trips/${id}/expenses`)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Add Expenses
          </Button>
          <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <DollarSign className="w-4 h-4 mr-2" />
            Request Advance
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Trip Overview
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Purpose
                </Label>
                <p className="text-sm text-[#0F172A] mt-1">{trip.purpose}</p>
              </div>
            </div>
          </Card>

          {/* Budget Breakdown */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-6">
              Budget Breakdown
            </h2>
            <div className="space-y-4">
              {trip.expenses.map((expense, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-[#0F172A]">
                      {expense.category}
                    </span>
                    <div className="text-sm">
                      <span className="font-medium text-[#0F172A]">
                        ${expense.actual}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        / ${expense.planned}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(expense.actual / expense.planned) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start"
                onClick={() => navigate(`/trips/${id}/expenses`)}
              >
                <Upload className="w-5 h-5 mb-2" />
                <span className="font-medium">Upload Receipts</span>
                <span className="text-xs text-gray-500">
                  Add expense receipts
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start"
              >
                <DollarSign className="w-5 h-5 mb-2" />
                <span className="font-medium">Request Advance</span>
                <span className="text-xs text-gray-500">
                  Request payment in advance
                </span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start"
                onClick={() => navigate(`/trips/${id}/expenses`)}
              >
                <FileText className="w-5 h-5 mb-2" />
                <span className="font-medium">Expense Report</span>
                <span className="text-xs text-gray-500">View full report</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-start"
              >
                <Calendar className="w-5 h-5 mb-2" />
                <span className="font-medium">Modify Dates</span>
                <span className="text-xs text-gray-500">Change trip dates</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Budget Summary */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              Budget Status
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="text-lg font-semibold text-[#0F172A]">
                    ${trip.budget.toLocaleString()}
                  </span>
                </div>
                <Progress value={percentUsed} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  {percentUsed.toFixed(0)}% used
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    ${trip.spent.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Advance</span>
                  <span className="text-sm font-medium text-green-600">
                    ${trip.advance.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="text-sm font-medium text-[#2563EB]">
                    ${(trip.budget - trip.spent).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Trip Timeline */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    Trip Created
                  </p>
                  <p className="text-xs text-gray-500">Apr 1, 2026</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    Approved by Manager
                  </p>
                  <p className="text-xs text-gray-500">Apr 3, 2026</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">
                    Trip Started
                  </p>
                  <p className="text-xs text-gray-500">Apr 15, 2026</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5"></div>
                <div>
                  <p className="text-sm text-gray-400">Trip Ends</p>
                  <p className="text-xs text-gray-400">Apr 18, 2026</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <label className={className}>{children}</label>;
}
