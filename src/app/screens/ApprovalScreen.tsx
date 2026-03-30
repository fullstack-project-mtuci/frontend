import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { fetchTrips, updateTripStatus } from "../api";
import type { TripRequest, TripStatus } from "../types";
import { useAuth } from "../providers/AuthProvider";
import { formatCurrency, formatDate } from "../lib/format";
import { getTripStatusConfig } from "../lib/status";
import { AlertTriangle } from "lucide-react";

export default function ApprovalScreen() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [selected, setSelected] = useState<TripRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isActing, setIsActing] = useState(false);

  useEffect(() => {
    void loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchTrips();
      setTrips(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const pendingTrips = useMemo(() => {
    return trips.filter((trip) => needsAttention(trip, user?.role));
  }, [trips, user?.role]);

  useEffect(() => {
    if (pendingTrips.length === 0) {
      setSelected(null);
      return;
    }
    setSelected((prev) => {
      if (prev && pendingTrips.some((trip) => trip.id === prev.id)) {
        return prev;
      }
      return pendingTrips[0];
    });
  }, [pendingTrips]);

  const handleAction = async (status: TripStatus) => {
    if (!selected) return;
    setIsActing(true);
    try {
      const result = await updateTripStatus(selected.id, status, comment);
      setComment("");
      await loadTrips();
      setSelected(result.trip);
    } catch (err) {
      console.error(err);
      setError("Unable to update status");
    } finally {
      setIsActing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Approval Center</h1>
          <p className="text-sm text-gray-600 mt-1">
            Review requests that require your decision.
          </p>
        </div>
        <Button variant="outline" onClick={loadTrips} disabled={isLoading}>
          Reload
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-2 rounded-lg">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">Pending ({pendingTrips.length})</h2>
          </div>
          <div className="space-y-2 max-h-[520px] overflow-y-auto">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading...</p>
            ) : pendingTrips.length === 0 ? (
              <p className="text-sm text-gray-500">No items require your attention.</p>
            ) : (
              pendingTrips.map((trip) => {
                const config = getTripStatusConfig(trip.status);
                return (
                  <button
                    key={trip.id}
                    onClick={() => setSelected(trip)}
                    className={`w-full text-left border rounded-lg p-4 transition-colors ${
                      selected?.id === trip.id ? "border-[#2563EB] bg-blue-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-[#0F172A]">
                        {trip.destinationCity}, {trip.destinationCountry}
                      </p>
                      <Badge className={`${config.className} capitalize`}>{config.label}</Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Purpose: {trip.purpose}</p>
                  </button>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2 space-y-4">
          {selected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#0F172A]">
                    {selected.destinationCity}, {selected.destinationCountry}
                  </h3>
                  <p className="text-sm text-gray-500">{selected.purpose}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="text-xl font-semibold text-[#2563EB]">
                    {formatCurrency(selected.plannedTotal, selected.currency)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="text-gray-500">Travel Dates</p>
                  <p>
                    {formatDate(selected.startDate)} - {formatDate(selected.endDate)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Created</p>
                  <p>{formatDate(selected.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Comment</Label>
                <Textarea
                  rows={3}
                  placeholder="Provide context for your decision"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {getAvailableActions(selected.status, user?.role).map((action) => (
                  <Button key={action.status} variant={action.variant} onClick={() => handleAction(action.status)} disabled={isActing}>
                    {action.label}
                  </Button>
                ))}
                {getAvailableActions(selected.status, user?.role).length === 0 && (
                  <p className="text-sm text-gray-500">No actions available for your role on this document.</p>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-12">Select a document to review.</div>
          )}
        </Card>
      </div>
    </div>
  );
}

function needsAttention(trip: TripRequest, role?: string) {
  if (!role) return false;
  if (role === "manager") {
    return trip.status === "submitted";
  }
  if (role === "accountant") {
    return trip.status === "manager_approved" || trip.status === "accountant_review";
  }
  if (role === "admin") {
    return ["submitted", "manager_approved", "accountant_review"].includes(trip.status);
  }
  return false;
}

function getAvailableActions(status: TripStatus, role?: string) {
  const actions: { label: string; status: TripStatus; variant: "default" | "outline" }[] = [];
  if (!role) return actions;

  if (role === "manager" || role === "admin") {
    if (status === "submitted") {
      actions.push({ label: "Approve", status: "manager_approved", variant: "default" });
      actions.push({ label: "Reject", status: "manager_rejected", variant: "outline" });
    }
  }

  if (role === "accountant" || role === "admin") {
    if (status === "manager_approved") {
      actions.push({ label: "Send to Finance Review", status: "accountant_review", variant: "default" });
    }
    if (status === "accountant_review") {
      actions.push({ label: "Approve Trip", status: "approved", variant: "default" });
    }
  }

  return actions;
}
