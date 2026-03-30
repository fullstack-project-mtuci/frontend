import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Upload,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import { fetchTrip, updateTripStatus } from "../api";
import type { TripRequest, TripStatus } from "../types";
import { formatCurrency, formatDate } from "../lib/format";
import { getTripStatusConfig } from "../lib/status";
import { useAuth } from "../providers/AuthProvider";

export default function TripDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [trip, setTrip] = useState<TripRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      void loadTrip(id);
    }
  }, [id]);

  const loadTrip = async (tripId: string) => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await fetchTrip(tripId);
      setTrip(data);
    } catch (err) {
      console.error(err);
      setLoadError("Trip not found or you do not have access to it.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (status: TripStatus) => {
    if (!trip) return;
    setIsUpdating(true);
    setMessage(null);
    setActionError(null);
    try {
      const result = await updateTripStatus(trip.id, status, comment);
      setTrip(result.trip);
      setComment("");
      if (result.warnings?.length) {
        setMessage(result.warnings.join(". "));
      } else {
        setMessage(`Status updated to ${status.replace("_", " ")}`);
      }
    } catch (err) {
      console.error(err);
      setActionError("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <div className="py-12 text-center text-gray-500">Loading trip...</div>;
  }

  if (loadError || !trip) {
    return (
      <div className="py-12 text-center">
        <p className="text-gray-500 mb-4">{loadError}</p>
        <Button variant="outline" onClick={() => navigate("/trips")}>Back to trips</Button>
      </div>
    );
  }

  const statusConfig = getTripStatusConfig(trip.status);
  const actions = resolveActions(trip.status, user?.role);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate(`/trips/${trip.id}/expenses`)}>
          <Upload className="w-4 h-4 mr-2" />
          Expense Report
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-[#0F172A]">
              {trip.destinationCity}, {trip.destinationCountry}
            </h1>
            <Badge className={`${statusConfig.className} capitalize`}>{statusConfig.label}</Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.purpose}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Planned Budget</p>
          <p className="text-2xl font-semibold text-[#2563EB]">
            {formatCurrency(trip.plannedTotal, trip.currency)}
          </p>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#0F172A]">Trip Overview</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="text-gray-500">Purpose</p>
              <p>{trip.purpose || "No description provided."}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="text-gray-500">Created</p>
                <p>{formatDate(trip.createdAt)}</p>
              </div>
              <div>
                <p className="text-gray-500">Last Updated</p>
                <p>{formatDate(trip.updatedAt)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#0F172A]">Approvals & Notes</h2>
              <Button variant="ghost" size="sm" onClick={() => loadTrip(trip.id)}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              <Label>Comment</Label>
              <Textarea
                placeholder="Provide context for your next action"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>

            {actionError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                <AlertCircle className="w-4 h-4" />
                {actionError}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              {actions.length === 0 ? (
                <p className="text-sm text-gray-500">No actions available for your role.</p>
              ) : (
                actions.map((action) => (
                  <Button
                    key={action.status}
                    variant={action.variant}
                    disabled={isUpdating}
                    onClick={() => handleStatusChange(action.status)}
                  >
                    {action.label}
                  </Button>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-600">Budget Breakdown</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Transport</span>
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(trip.plannedTransport, trip.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Hotel</span>
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(trip.plannedHotel, trip.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Daily Allowance</span>
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(trip.plannedDailyAllowance, trip.currency)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Other</span>
              <span className="font-semibold text-[#0F172A]">
                {formatCurrency(trip.plannedOther, trip.currency)}
              </span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-4">Status Timeline</h3>
            <div className="space-y-4 text-sm">
              <TimelineItem label="Created" value={formatDate(trip.createdAt)} active />
              {trip.submittedAt && (
                <TimelineItem label="Submitted" value={formatDate(trip.submittedAt)} active />
              )}
              {trip.approvedAt && (
                <TimelineItem label="Approved" value={formatDate(trip.approvedAt)} active />
              )}
              {trip.rejectedAt && (
                <TimelineItem label="Rejected" value={formatDate(trip.rejectedAt)} active status="error" />
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function resolveActions(status: TripStatus, role?: string) {
  const actions: { label: string; status: TripStatus; variant: "default" | "outline" }[] = [];
  if (!role) return actions;

  if (role === "employee") {
    if (status === "draft") {
      actions.push({ label: "Submit for approval", status: "submitted", variant: "default" });
      actions.push({ label: "Cancel request", status: "cancelled", variant: "outline" });
    } else if (status === "submitted") {
      actions.push({ label: "Cancel submission", status: "cancelled", variant: "outline" });
    }
  }

  if (role === "manager" || role === "admin") {
    if (status === "submitted") {
      actions.push({ label: "Approve", status: "manager_approved", variant: "default" });
      actions.push({ label: "Reject", status: "manager_rejected", variant: "outline" });
    }
  }

  if (role === "accountant" || role === "admin") {
    if (status === "manager_approved") {
      actions.push({ label: "Move to Finance Review", status: "accountant_review", variant: "default" });
    }
    if (status === "accountant_review") {
      actions.push({ label: "Mark as Approved", status: "approved", variant: "default" });
    }
  }

  return actions;
}

function TimelineItem({
  label,
  value,
  active,
  status,
}: {
  label: string;
  value: string;
  active?: boolean;
  status?: "error" | "default";
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-2 h-2 rounded-full mt-1.5 ${
          status === "error" ? "bg-red-500" : active ? "bg-green-500" : "bg-gray-300"
        }`}
      ></div>
      <div>
        <p className="text-sm font-medium text-[#0F172A]">{label}</p>
        <p className="text-xs text-gray-500">{value}</p>
      </div>
    </div>
  );
}
