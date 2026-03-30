import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Info, AlertCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { createTrip, updateTripStatus } from "../api";
import type { TripFormValues } from "../types";
import { formatCurrency } from "../lib/format";

interface TripFormState {
  destinationCity: string;
  destinationCountry: string;
  purpose: string;
  comment: string;
  startDate: string;
  endDate: string;
  plannedTransport: string;
  plannedHotel: string;
  plannedDailyAllowance: string;
  plannedOther: string;
  currency: string;
  projectId?: string;
}

const defaultState: TripFormState = {
  destinationCity: "",
  destinationCountry: "",
  purpose: "",
  comment: "",
  startDate: "",
  endDate: "",
  plannedTransport: "0",
  plannedHotel: "0",
  plannedDailyAllowance: "0",
  plannedOther: "0",
  currency: "USD",
  projectId: "",
};

export default function CreateTrip() {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<TripFormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalBudget =
    Number(formState.plannedTransport || 0) +
    Number(formState.plannedHotel || 0) +
    Number(formState.plannedDailyAllowance || 0) +
    Number(formState.plannedOther || 0);

  const updateField = (field: keyof TripFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const mapToPayload = (): TripFormValues => ({
    destinationCity: formState.destinationCity.trim(),
    destinationCountry: formState.destinationCountry.trim(),
    purpose: formState.purpose.trim(),
    comment: formState.comment,
    startDate: formState.startDate,
    endDate: formState.endDate,
    currency: formState.currency,
    projectId: formState.projectId?.trim() || undefined,
    plannedTransport: Number(formState.plannedTransport) || 0,
    plannedHotel: Number(formState.plannedHotel) || 0,
    plannedDailyAllowance: Number(formState.plannedDailyAllowance) || 0,
    plannedOther: Number(formState.plannedOther) || 0,
  });

  const handleSubmit = async (action: "draft" | "submit") => {
    setError(null);
    setIsSubmitting(true);
    try {
      const payload = mapToPayload();
      const created = await createTrip(payload);
      if (action === "submit") {
        await updateTripStatus(created.id, "submitted", payload.comment);
      }
      navigate(`/trips/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Unable to save trip. Please check the form and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Create New Trip</h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill in the details for your business trip and submit for approval
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4 text-[#2563EB]" />
              Provide clear purpose and accurate budget estimates to speed up approvals.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="destinationCity">Destination City</Label>
                <Input
                  id="destinationCity"
                  placeholder="e.g., New York"
                  value={formState.destinationCity}
                  onChange={(e) => updateField("destinationCity", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="destinationCountry">Destination Country</Label>
                <Input
                  id="destinationCountry"
                  placeholder="e.g., USA"
                  value={formState.destinationCountry}
                  onChange={(e) => updateField("destinationCountry", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formState.startDate}
                  onChange={(e) => updateField("startDate", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formState.endDate}
                  onChange={(e) => updateField("endDate", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                rows={3}
                placeholder="Describe the scope of meetings or activities"
                value={formState.purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="comment">Additional Notes</Label>
              <Textarea
                id="comment"
                rows={3}
                placeholder="Optional context for reviewers"
                value={formState.comment}
                onChange={(e) => updateField("comment", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency (ISO code)</Label>
              <Input
                id="currency"
                placeholder="USD"
                value={formState.currency}
                onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <Label htmlFor="projectId">Project ID (optional)</Label>
              <Input
                id="projectId"
                placeholder="Enter related project ID"
                value={formState.projectId}
                onChange={(e) => updateField("projectId", e.target.value)}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F172A]">Budget Planning</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberField
                label="Transport"
                value={formState.plannedTransport}
                onChange={(value) => updateField("plannedTransport", value)}
              />
              <NumberField
                label="Hotel"
                value={formState.plannedHotel}
                onChange={(value) => updateField("plannedHotel", value)}
              />
              <NumberField
                label="Daily Allowance"
                value={formState.plannedDailyAllowance}
                onChange={(value) => updateField("plannedDailyAllowance", value)}
              />
              <NumberField
                label="Other"
                value={formState.plannedOther}
                onChange={(value) => updateField("plannedOther", value)}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-medium text-gray-600">Budget Summary</h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total Planned Budget</span>
              <span className="text-xl font-semibold text-[#2563EB]">
                {formatCurrency(totalBudget, formState.currency || "USD")}
              </span>
            </div>
            <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
              Update the values to reflect expected spend. You can adjust after creating the trip.
            </div>
          </Card>

          <Card className="p-6 bg-blue-50 border-blue-200">
            <h3 className="text-sm font-semibold text-[#0F172A] mb-2">Tips</h3>
            <ul className="text-xs text-gray-700 space-y-2">
              <li>• Provide destinations exactly as they appear on passports.</li>
              <li>• Submit at least 5 days before travel when approvals are required.</li>
              <li>• After submission, upload receipts via the Expense Report screen.</li>
            </ul>
          </Card>

          <div className="space-y-3">
            <Button
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8]"
              disabled={isSubmitting}
              onClick={() => handleSubmit("submit")}
            >
              {isSubmitting ? "Processing..." : "Submit for Approval"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              disabled={isSubmitting}
              onClick={() => handleSubmit("draft")}
            >
              Save as Draft
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={0}
      />
    </div>
  );
}
