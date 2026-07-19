import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute, RoleRoute } from "./ProtectedRoute";

const { useAuthMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn()
}));

vi.mock("../contexts/AuthContext", () => ({
  useAuth: useAuthMock
}));

describe("ProtectedRoute and RoleRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("redirects to login when token or user is missing", () => {
    useAuthMock.mockReturnValue({ token: null, user: null });

    render(
      <MemoryRouter initialEntries={["/secure"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/secure" element={<div>secure-content</div>} />
          </Route>
          <Route path="/login" element={<div>login-page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("login-page")).toBeInTheDocument();
    expect(screen.queryByText("secure-content")).not.toBeInTheDocument();
  });

  it("allows admin_company for company-scoped route", () => {
    useAuthMock.mockReturnValue({
      token: "Bearer token",
      user: {
        id: 1,
        email: "company@example.com",
        username: "company-admin",
        role: "admin_company",
        status: "active"
      }
    });

    render(
      <MemoryRouter initialEntries={["/companies"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={["super_admin", "admin", "admin_company"]} />}>
              <Route path="/companies" element={<div>companies-page</div>} />
            </Route>
          </Route>
          <Route path="/dashboard" element={<div>dashboard-page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("companies-page")).toBeInTheDocument();
  });

  it("denies admin_storefront_ops for HR/company guard", () => {
    useAuthMock.mockReturnValue({
      token: "Bearer token",
      user: {
        id: 2,
        email: "ops@example.com",
        username: "ops",
        role: "admin_storefront_ops",
        status: "active"
      }
    });

    render(
      <MemoryRouter initialEntries={["/employees"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<RoleRoute allowed={["super_admin", "admin", "admin_company"]} />}>
              <Route path="/employees" element={<div>employees-page</div>} />
            </Route>
          </Route>
          <Route path="/dashboard" element={<div>dashboard-page</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("dashboard-page")).toBeInTheDocument();
    expect(screen.queryByText("employees-page")).not.toBeInTheDocument();
  });
});
