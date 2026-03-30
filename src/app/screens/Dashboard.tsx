import { useNavigate } from "react-router";
import {
  Plane,
  Clock,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Calendar,
  MapPin,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";

const stats = [
  {
    label: "Total Trips",
    value: "24",
    change: "+12% from last month",
    icon: Plane,
    color: "bg-blue-500",
  },
  {
    label: "Pending Approvals",
    value: "8",
    change: "3 require urgent action",
    icon: Clock,
    color: "bg-orange-500",
  },
  {
    label: "Expenses to Review",
    value: "$12,450",
    change: "5 reports pending",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    label: "Budget Used",
    value: "68%",
    change: "$204,000 of $300,000",
    icon: TrendingUp,
    color: "bg-purple-500",
  },
];

const recentActivity = [
  {
    id: 1,
    employee: "Sarah Johnson",
    action: "Submitted expense report",
    trip: "New York - Client Meeting",
    amount: "$2,340",
    status: "pending",
    date: "2 hours ago",
  },
  {
    id: 2,
    employee: "Michael Chen",
    action: "Created new trip",
    trip: "London - Conference",
    amount: "$5,200",
    status: "draft",
    date: "5 hours ago",
  },
  {
    id: 3,
    employee: "Emily Davis",
    action: "Expense approved",
    trip: "San Francisco - Training",
    amount: "$1,890",
    status: "approved",
    date: "1 day ago",
  },
  {
    id: 4,
    employee: "Robert Wilson",
    action: "Requested advance",
    trip: "Tokyo - Partnership Meeting",
    amount: "$3,500",
    status: "pending",
    date: "1 day ago",
  },
  {
    id: 5,
    employee: "Lisa Anderson",
    action: "Uploaded receipts",
    trip: "Berlin - Product Launch",
    amount: "$2,100",
    status: "review",
    date: "2 days ago",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, John! Here's your travel overview.
          </p>
        </div>
        <Button
          onClick={() => navigate("/trips/new")}
          className="bg-[#2563EB] hover:bg-[#1D4ED8]"
        >
          <Plane className="w-4 h-4 mr-2" />
          Create New Trip
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                <p className="text-3xl font-semibold text-[#0F172A] mb-2">
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-[#0F172A]">
            Recent Activity
          </h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
            View all <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Employee
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Action
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Trip
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Amount
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-gray-600 pb-3">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {activity.employee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <span className="text-sm text-[#0F172A]">
                        {activity.employee}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-sm text-gray-600">
                    {activity.action}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-2 text-sm text-[#0F172A]">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {activity.trip}
                    </div>
                  </td>
                  <td className="py-4 text-sm font-medium text-[#0F172A]">
                    {activity.amount}
                  </td>
                  <td className="py-4">
                    <Badge
                      variant={
                        activity.status === "approved"
                          ? "default"
                          : activity.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                      className={
                        activity.status === "approved"
                          ? "bg-green-100 text-green-700 hover:bg-green-100"
                          : activity.status === "pending"
                          ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-100"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </td>
                  <td className="py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {activity.date}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
