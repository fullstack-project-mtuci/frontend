import { useState } from "react";
import { useNavigate } from "react-router";
import { Plus, Search, Filter, MapPin, Calendar } from "lucide-react";
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

const trips = [
  {
    id: 1,
    employee: "Sarah Johnson",
    destination: "New York, USA",
    startDate: "Apr 15, 2026",
    endDate: "Apr 18, 2026",
    budget: "$4,500",
    spent: "$2,340",
    status: "in-progress",
  },
  {
    id: 2,
    employee: "Michael Chen",
    destination: "London, UK",
    startDate: "May 2, 2026",
    endDate: "May 8, 2026",
    budget: "$5,200",
    spent: "$0",
    status: "approved",
  },
  {
    id: 3,
    employee: "Emily Davis",
    destination: "San Francisco, USA",
    startDate: "Mar 20, 2026",
    endDate: "Mar 23, 2026",
    budget: "$3,800",
    spent: "$3,650",
    status: "completed",
  },
  {
    id: 4,
    employee: "Robert Wilson",
    destination: "Tokyo, Japan",
    startDate: "Jun 10, 2026",
    endDate: "Jun 15, 2026",
    budget: "$6,800",
    spent: "$0",
    status: "pending",
  },
  {
    id: 5,
    employee: "Lisa Anderson",
    destination: "Berlin, Germany",
    startDate: "Apr 5, 2026",
    endDate: "Apr 9, 2026",
    budget: "$4,200",
    spent: "$4,050",
    status: "completed",
  },
  {
    id: 6,
    employee: "John Doe",
    destination: "Singapore",
    startDate: "May 15, 2026",
    endDate: "May 20, 2026",
    budget: "$5,500",
    spent: "$0",
    status: "draft",
  },
  {
    id: 7,
    employee: "Anna Martinez",
    destination: "Paris, France",
    startDate: "Apr 8, 2026",
    endDate: "Apr 12, 2026",
    budget: "$4,900",
    spent: "$1,200",
    status: "in-progress",
  },
  {
    id: 8,
    employee: "David Kim",
    destination: "Sydney, Australia",
    startDate: "Jul 1, 2026",
    endDate: "Jul 7, 2026",
    budget: "$7,200",
    spent: "$0",
    status: "pending",
  },
];

export default function TripsList() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTrips = trips.filter((trip) => {
    const matchesStatus = statusFilter === "all" || trip.status === statusFilter;
    const matchesSearch =
      trip.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "in-progress":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "approved":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "pending":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "draft":
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Trips</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all business trips and travel requests
          </p>
        </div>
        <Button
          onClick={() => navigate("/trips/new")}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Trip
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by employee or destination..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Status filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Trips Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Employee
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Destination
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Dates
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Budget
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Spent
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTrips.map((trip) => (
                <tr
                  key={trip.id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/trips/${trip.id}`)}
                >
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {trip.employee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-sm text-[#0F172A]">
                        {trip.employee}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-[#0F172A]">
                        {trip.destination}
                      </span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {trip.startDate} - {trip.endDate}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-[#0F172A]">
                    {trip.budget}
                  </td>
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#0F172A]">
                        {trip.spent}
                      </span>
                      {trip.spent !== "$0" && (
                        <span className="text-xs text-gray-500">
                          {Math.round(
                            (parseFloat(trip.spent.replace(/[$,]/g, "")) /
                              parseFloat(trip.budget.replace(/[$,]/g, ""))) *
                              100
                          )}
                          % used
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4">
                    <Badge className={getStatusColor(trip.status)}>
                      {trip.status}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/trips/${trip.id}`);
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTrips.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No trips found</p>
          </div>
        )}
      </Card>
    </div>
  );
}
