import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, Upload, Plus, X, FileText, Camera } from "lucide-react";
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

interface Receipt {
  id: string;
  date: string;
  vendor: string;
  category: string;
  amount: string;
  imageUrl?: string;
}

export default function ExpenseReport() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [receipts, setReceipts] = useState<Receipt[]>([
    {
      id: "1",
      date: "2026-04-15",
      vendor: "JFK Airport Taxi",
      category: "Transport",
      amount: "65.00",
      imageUrl: "receipt1",
    },
    {
      id: "2",
      date: "2026-04-15",
      vendor: "Hilton Manhattan",
      category: "Hotel",
      amount: "420.00",
      imageUrl: "receipt2",
    },
    {
      id: "3",
      date: "2026-04-16",
      vendor: "Blue Bottle Coffee",
      category: "Meals",
      amount: "12.50",
      imageUrl: "receipt3",
    },
  ]);

  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newReceipt, setNewReceipt] = useState<Receipt>({
    id: "",
    date: "",
    vendor: "",
    category: "",
    amount: "",
  });

  const totalAdvance = 2000;
  const totalSpent = receipts.reduce(
    (sum, receipt) => sum + parseFloat(receipt.amount),
    0
  );
  const remaining = totalAdvance - totalSpent;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate OCR extraction
      setNewReceipt({
        ...newReceipt,
        imageUrl: URL.createObjectURL(file),
        date: "2026-04-17",
        vendor: "ABC Restaurant",
        amount: "45.00",
      });
      setShowUploadForm(true);
    }
  };

  const addReceipt = () => {
    if (newReceipt.date && newReceipt.vendor && newReceipt.amount) {
      setReceipts([...receipts, { ...newReceipt, id: Date.now().toString() }]);
      setNewReceipt({
        id: "",
        date: "",
        vendor: "",
        category: "",
        amount: "",
      });
      setShowUploadForm(false);
    }
  };

  const deleteReceipt = (id: string) => {
    setReceipts(receipts.filter((receipt) => receipt.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/trips/${id}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Expense Report
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            New York, USA • Apr 15 - 18, 2026
          </p>
        </div>
        <Button
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
          onClick={() => {
            // Submit expense report
            navigate("/trips");
          }}
        >
          <FileText className="w-4 h-4 mr-2" />
          Submit Report
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Advance</p>
              <p className="text-2xl font-semibold text-[#0F172A]">
                ${totalAdvance.toFixed(2)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Total Spent</p>
              <p className="text-2xl font-semibold text-orange-600">
                ${totalSpent.toFixed(2)}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p
                className={`text-2xl font-semibold ${
                  remaining >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${Math.abs(remaining).toFixed(2)}
              </p>
            </Card>
          </div>

          {/* Upload Receipt */}
          {!showUploadForm && (
            <Card className="p-6">
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Camera className="w-8 h-8 text-[#2563EB]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-2">
                  Upload Receipt
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Take a photo or upload an image of your receipt
                </p>
                <label htmlFor="receipt-upload">
                  <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]" asChild>
                    <span>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </span>
                  </Button>
                </label>
                <input
                  id="receipt-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </Card>
          )}

          {/* Upload Form */}
          {showUploadForm && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0F172A]">
                  New Expense
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUploadForm(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Receipt Preview */}
                <div>
                  <Label>Receipt Image</Label>
                  <div className="mt-1.5 border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    {newReceipt.imageUrl ? (
                      <div className="aspect-[3/4] bg-white rounded border border-gray-200 flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                    ) : (
                      <div className="aspect-[3/4] flex items-center justify-center">
                        <Upload className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newReceipt.date}
                      onChange={(e) =>
                        setNewReceipt({ ...newReceipt, date: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="vendor">Vendor</Label>
                    <Input
                      id="vendor"
                      placeholder="e.g., Hilton Hotel"
                      value={newReceipt.vendor}
                      onChange={(e) =>
                        setNewReceipt({ ...newReceipt, vendor: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newReceipt.category}
                      onValueChange={(value) =>
                        setNewReceipt({ ...newReceipt, category: value })
                      }
                    >
                      <SelectTrigger className="mt-1.5">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Hotel">Hotel</SelectItem>
                        <SelectItem value="Meals">Meals</SelectItem>
                        <SelectItem value="Entertainment">
                          Entertainment
                        </SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount ($)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newReceipt.amount}
                      onChange={(e) =>
                        setNewReceipt({ ...newReceipt, amount: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <Button
                    className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]"
                    onClick={addReceipt}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Expenses List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-4">
              Expenses ({receipts.length})
            </h3>

            {receipts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No expenses added yet
              </div>
            ) : (
              <div className="space-y-3">
                {receipts.map((receipt) => (
                  <div
                    key={receipt.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[#0F172A]">
                            {receipt.vendor}
                          </p>
                          <span className="text-xs text-gray-500">
                            • {receipt.category}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{receipt.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-[#0F172A]">
                          ${parseFloat(receipt.amount).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteReceipt(receipt.id)}
                      className="ml-4"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Financial Summary */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              Financial Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  Advance Received
                </span>
                <span className="text-sm font-medium text-[#0F172A]">
                  ${totalAdvance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Total Expenses</span>
                <span className="text-sm font-medium text-[#0F172A]">
                  ${totalSpent.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-[#0F172A]">
                  {remaining >= 0 ? "To Return" : "To Be Reimbursed"}
                </span>
                <span
                  className={`text-lg font-semibold ${
                    remaining >= 0 ? "text-green-600" : "text-orange-600"
                  }`}
                >
                  ${Math.abs(remaining).toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          {/* Category Breakdown */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              By Category
            </h3>
            <div className="space-y-3">
              {Object.entries(
                receipts.reduce((acc, receipt) => {
                  const cat = receipt.category || "Other";
                  acc[cat] = (acc[cat] || 0) + parseFloat(receipt.amount);
                  return acc;
                }, {} as Record<string, number>)
              ).map(([category, amount]) => (
                <div
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span className="text-sm text-gray-600">{category}</span>
                  <span className="text-sm font-medium text-[#0F172A]">
                    ${amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">
              Notes (Optional)
            </h3>
            <Textarea
              placeholder="Add any additional notes or comments about this expense report..."
              rows={4}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
