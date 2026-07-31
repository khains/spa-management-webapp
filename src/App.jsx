import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import CustomersPage from "./pages/CustomersPage";
import CustomerDetailPage from "./pages/CustomerDetailPage";
import PackagesPage from "./pages/PackagesPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import PaymentsPage from "./pages/PaymentsPage";
import StaffPage from "./pages/StaffPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/customers" replace />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
            <Route
              path="/staff"
              element={
                <ProtectedRoute adminOnly>
                  <StaffPage />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/customers" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
