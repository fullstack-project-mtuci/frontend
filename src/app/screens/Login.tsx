import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Plane, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { useAuth } from "../providers/AuthProvider";
import { ApiError } from "../api/client";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, status, isAuthenticating } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/";

  useEffect(() => {
    if (status === "authenticated") {
      navigate(from, { replace: true });
    }
  }, [status, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Invalid credentials");
      } else {
        setError("Unable to sign in. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2563EB] rounded-2xl mb-4">
            <Plane className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-2">
            Business Trip Manager
          </h1>
          <p className="text-sm text-gray-600">
            Sign in to manage your trips and expenses
          </p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-sm text-[#2563EB] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                <AlertCircle className="w-4 h-4" />
                <p>{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isAuthenticating}
              className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-70"
            >
              {isAuthenticating ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <button className="text-[#2563EB] hover:underline" type="button">
            Contact your administrator
          </button>
        </p>
      </div>
    </div>
  );
}
