import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ProtectedRoute, RoleRoute } from "./components/ProtectedRoute";
import { DashboardPage } from "./pages/DashboardPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { CareerPage } from "./pages/CareerPage";
import { CompaniesPage } from "./pages/CompaniesPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PasswordPage } from "./pages/PasswordPage";
import { ProductCategoriesPage } from "./pages/ProductCategoriesPage";
import { ProductDepartmentsPage } from "./pages/ProductDepartmentsPage";
import { ProductSubCategoriesPage } from "./pages/ProductSubCategoriesPage";
import { ProductTypesPage } from "./pages/ProductTypesPage";
import { ProductVariantsPage } from "./pages/ProductVariantsPage";
import { ProductsPage } from "./pages/ProductsPage";
import { UsersPage } from "./pages/UsersPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/password" element={<PasswordPage />} />

          <Route element={<RoleRoute allowed={["super_admin", "admin", "admin_company"]} />}>
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/career" element={<CareerPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
          </Route>

          <Route element={<RoleRoute allowed={["super_admin"]} />}>
            <Route path="/users" element={<UsersPage />} />
          </Route>

          <Route element={<RoleRoute allowed={["super_admin", "admin", "admin_company"]} />}>
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/departments" element={<ProductDepartmentsPage />} />
            <Route path="/products/categories" element={<ProductCategoriesPage />} />
            <Route path="/products/sub-categories" element={<ProductSubCategoriesPage />} />
            <Route path="/products/types" element={<ProductTypesPage />} />
            <Route path="/products/:productId/variants" element={<ProductVariantsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
