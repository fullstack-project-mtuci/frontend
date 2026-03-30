import { Navigate, useLocation } from "react-router";
import { useAuth } from "../providers/AuthProvider";
import { FullScreenLoader } from "./FullScreenLoader";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return <FullScreenLoader label="Checking your session..." />;
  }

  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
