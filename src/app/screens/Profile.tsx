import { User, Mail, Building2, Calendar, Edit } from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

export default function Profile() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0F172A]">Profile</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <Button className="bg-[#2563EB] hover:bg-[#1D4ED8]">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-[#2563EB] rounded-full flex items-center justify-center mb-4">
              <span className="text-white text-3xl font-medium">JD</span>
            </div>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-1">
              John Doe
            </h2>
            <p className="text-sm text-gray-600 mb-4">Employee</p>
            <div className="w-full pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>john.doe@company.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building2 className="w-4 h-4" />
                <span>Engineering Department</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined Jan 2024</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue="John"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue="Doe"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="john.doe@company.com"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  defaultValue="+1 (555) 123-4567"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  defaultValue="EMP-001234"
                  className="mt-1.5"
                  disabled
                />
              </div>
            </div>
          </Card>

          {/* Work Information */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
              Work Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  defaultValue="Engineering"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  defaultValue="Senior Software Engineer"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="manager">Manager</Label>
                <Input
                  id="manager"
                  defaultValue="Jane Smith"
                  className="mt-1.5"
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="location">Office Location</Label>
                <Input
                  id="location"
                  defaultValue="San Francisco, CA"
                  className="mt-1.5"
                  disabled
                />
              </div>
            </div>
          </Card>

          {/* Travel Statistics */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-[#0F172A] mb-6">
              Travel Statistics (2026)
            </h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Trips</p>
                <p className="text-3xl font-semibold text-[#0F172A]">8</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
                <p className="text-3xl font-semibold text-[#0F172A]">
                  $18.5K
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Countries Visited</p>
                <p className="text-3xl font-semibold text-[#0F172A]">5</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
