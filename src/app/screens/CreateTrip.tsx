import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";

interface ExpenseItem {
  id: string;
  category: string;
  amount: string;
}

export default function CreateTrip() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [purpose, setPurpose] = useState("");
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    { id: "1", category: "Transport", amount: "1500" },
    { id: "2", category: "Hotel", amount: "2000" },
    { id: "3", category: "Daily Allowance", amount: "800" },
  ]);

  const addExpense = () => {
    setExpenses([
      ...expenses,
      { id: Date.now().toString(), category: "", amount: "" },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const updateExpense = (id: string, field: string, value: string) => {
    setExpenses(
      expenses.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    );
  };

  const totalBudget = expenses.reduce(
    (sum, exp) => sum + (parseFloat(exp.amount) || 0),
    0
  );

  const handleSubmit = (isDraft: boolean) => {
    // Mock submission
    navigate("/trips");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trips")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#0F172A]">
          Create New Trip
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details for your business trip
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trip Details */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-[#0F172A] mb-6">
              Trip Details
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Input
                  id="destination"
                  placeholder="e.g., New York, USA"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="purpose">Purpose of Trip</Label>
                <Textarea
                  id="purpose"
                  placeholder="Describe the purpose of your business trip..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="mt-1.5"
                  rows={4}
                />
              </div>
            </div>
          </Card>

          {/* Expense Planning */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#0F172A]">
                Expense Planning
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addExpense}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </div>

            <div className="space-y-3">
              {expenses.map((expense, index) => (
                <div key={expense.id} className="flex gap-3 items-start">
                  <div className="flex-1">
                    <Input
                      placeholder="Category (e.g., Transport, Hotel)"
                      value={expense.category}
                      onChange={(e) =>
                        updateExpense(expense.id, "category", e.target.value)
                      }
                    />
                  </div>
                  <div className="w-40">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={expense.amount}
                      onChange={(e) =>
                        updateExpense(expense.id, "amount", e.target.value)
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExpense(expense.id)}
                    disabled={expenses.length === 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar - Summary */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              Budget Summary
            </h3>
            <div className="space-y-4">
              <div className="pb-4 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    Planned Expenses
                  </span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    {expenses.length}
                  </span>
                </div>
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex justify-between items-center text-xs text-gray-500 mt-1"
                  >
                    <span>{expense.category || "Unnamed"}</span>
                    <span>${expense.amount || "0"}</span>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-[#0F172A]">
                    Total Budget
                  </span>
                  <span className="text-2xl font-semibold text-[#2563EB]">
                    ${totalBudget.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-medium text-[#0F172A] mb-2">
              Next Steps
            </h3>
            <ul className="text-xs text-gray-600 space-y-2">
              <li>• Submit for manager approval</li>
              <li>• Request advance payment if needed</li>
              <li>• Upload receipts during the trip</li>
              <li>• Submit expense report after trip</li>
            </ul>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]"
              onClick={() => handleSubmit(false)}
            >
              Submit for Approval
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSubmit(true)}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
