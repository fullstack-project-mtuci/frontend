import { createBrowserRouter } from "react-router";
import Login from "./screens/Login";
import Dashboard from "./screens/Dashboard";
import TripsList from "./screens/TripsList";
import CreateTrip from "./screens/CreateTrip";
import TripDetails from "./screens/TripDetails";
import ExpenseReport from "./screens/ExpenseReport";
import ApprovalScreen from "./screens/ApprovalScreen";
import BudgetControl from "./screens/BudgetControl";
import Profile from "./screens/Profile";
import AppLayout from "./components/AppLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: AppLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "trips", Component: TripsList },
      { path: "trips/new", Component: CreateTrip },
      { path: "trips/:id", Component: TripDetails },
      { path: "trips/:id/expenses", Component: ExpenseReport },
      { path: "approvals", Component: ApprovalScreen },
      { path: "budgets", Component: BudgetControl },
      { path: "profile", Component: Profile },
    ],
  },
]);