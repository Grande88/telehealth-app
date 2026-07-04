import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Feedback from "./pages/Feedback";
import FeedbackDetails from "./pages/FeedbackDetails";
import Hospitals from "./pages/Hospitals";
import Analytics from "./pages/Analytics";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/feedback/:id" element={<FeedbackDetails />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/users" element={<Users />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
