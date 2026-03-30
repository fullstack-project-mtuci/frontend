import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Plane, Clock, DollarSign, TrendingUp, RefreshCw, Calendar, MapPin, AlertTriangle } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { fetchTrips } from "../api";
import type { TripRequest } from "../types";
import { formatCurrency, formatDate } from "../lib/format";
import { getTripStatusConfig } from "../lib/status";
import { useAuth } from "../providers/AuthProvider";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setError("Unable to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = useMemo(() => {
    const totalBudget = trips.reduce((sum, trip) => sum + trip.plannedTotal, 0);
    const pendingApprovals = trips.filter((trip) => ["submitted", "manager_approved", "accountant_review"].includes(trip.status)).length;
    const drafts = trips.filter((trip) => trip.status === "draft").length;
    const approved = trips.filter((trip) => trip.status === "approved").length;

    return [
      {
        label: "Total Trips",
        value: trips.length,
        caption: `${approved} approved to date`,
        icon: Plane,
        color: "bg-blue-500",
      },
      {
        label: "Pending Actions",
        value: pendingApprovals,
        caption: "Awaiting review",
        icon: Clock,
        color: "bg-orange-500",
      },
      {
        label: "Drafts",
        value: drafts,
        caption: "Not yet submitted",
        icon: DollarSign,
        color: "bg-gray-600",
      },
      {
        label: "Planned Budget",
        value: formatCurrency(totalBudget, trips[0]?.currency || "USD"),
        caption: `${trips.length} requests this year`,
        icon: TrendingUp,
        color: "bg-green-500",
      },
    ];
  }, [trips]);

  const recentActivity = useMemo(() => {
    return [...trips]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [trips]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">
            Welcome back{user ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your trips, approvals, and spending from one place.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadTrips} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => navigate("/trips/new")} className="bg-[#2563EB] hover:bg-[#1D4ED8]">
            <Plane className="w-4 h-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#0F172A] mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.caption}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A]">Recent Activity</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>View all</Button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-gray-500">Loading activity...</div>
        ) : recentActivity.length === 0 ? (
          <div className="py-12 text-center text-gray-500">No activity recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-xs text-gray-500">
                  <th className="text-left font-medium pb-3">Destination</th>
                  <th className="text-left font-medium pb-3">Dates</th>
                  <th className="text-left font-medium pb-3">Budget</th>
                  <th className="text-left font-medium pb-3">Status</th>
                  <th className="text-left font-medium pb-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((trip) => {
                  const config = getTripStatusConfig(trip.status);
                  return (
                    <tr key={trip.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/trips/${trip.id}`)}>
                      <td className="py-4">
                        <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          {trip.destinationCity}, {trip.destinationCountry}
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                        </div>
                      </td>
                      <td className="py-4 text-sm font-medium text-[#0F172A]">
                        {formatCurrency(trip.plannedTotal, trip.currency)}
                      </td>
                      <td className="py-4">
                        <Badge className={`${config.className} capitalize`}>{config.label}</Badge>
                      </td>
                      <td className="py-4 text-sm text-gray-500">{formatDate(trip.updatedAt)}</td>
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
