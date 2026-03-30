import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, MapPin, Calendar, RefreshCw, AlertCircle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { fetchTrips } from "../api";
import type { TripRequest } from "../types";
import { formatCurrency, formatDate } from "../lib/format";
import { getTripStatusConfig } from "../lib/status";
import { useAuth } from "../providers/AuthProvider";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Manager Approved", value: "manager_approved" },
  { label: "Accountant Review", value: "accountant_review" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "manager_rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function TripsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Failed to load trips. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
      const searchValue = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        trip.destinationCity.toLowerCase().includes(searchValue) ||
        trip.destinationCountry.toLowerCase().includes(searchValue) ||
        trip.purpose.toLowerCase().includes(searchValue) ||
        trip.employeeId.toLowerCase().includes(searchValue);
      return matchesStatus && matchesSearch;
    });
  }, [trips, statusFilter, searchQuery]);

  const renderOwner = (trip: TripRequest) => {
    if (!user) return "";
    if (trip.employeeId === user.id) {
      return user.fullName;
    }
    return `Employee ${trip.employeeId.slice(0, 8)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Trips</h1>
          <p className="text-sm text-gray-600 mt-1">
            {user?.role === "manager" || user?.role === "accountant"
              ? "Monitor travel requests and approvals"
              : "Manage your business trips"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={loadTrips} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate("/trips/new")} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <Plus className="w-4 h-4 mr-2" />
            Create Trip
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search destination, purpose, or employee ID"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[220px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </Card>

      <Card className="p-0">
        {isLoading ? (
          <div className="py-16 text-center text-gray-500">Loading trips...</div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            {trips.length === 0 ? "No trips yet. Create your first trip." : "No trips match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left font-medium py-3 px-4">Destination</th>
                  <th className="text-left font-medium py-3 px-4">Dates</th>
                  <th className="text-left font-medium py-3 px-4">Purpose</th>
                  <th className="text-left font-medium py-3 px-4">Owner</th>
                  <th className="text-left font-medium py-3 px-4">Planned Budget</th>
                  <th className="text-left font-medium py-3 px-4">Status</th>
                  <th className="text-left font-medium py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrips.map((trip) => {
                  const statusConfig = getTripStatusConfig(trip.status);
                  return (
                    <tr
                      key={trip.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/trips/${trip.id}`)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">{trip.destinationCity}</p>
                            <p className="text-xs text-gray-500">{trip.destinationCountry}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>
                            {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-700 max-w-xs truncate">{trip.purpose}</td>
                      <td className="py-4 px-4 text-sm text-gray-700">{renderOwner(trip)}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-[#0F172A]">
                        {formatCurrency(trip.plannedTotal, trip.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${statusConfig.className} px-3 py-1 capitalize`}>{statusConfig.label}</Badge>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trips/${trip.id}`);
                          }}
                        >
                          View details
                        </Button>
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
