import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employees", label: "Employees" },
  { to: "/departments", label: "Departments" },
  { to: "/users", label: "Users" },
  { to: "/career", label: "Career" },
  { to: "/documents", label: "Documents" },
  { to: "/password", label: "Password" }
];

export function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function onLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Commerce OS</h1>
        <p className="sidebar-subtitle">Internal Operating Panel</p>
        <nav>
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <header className="topbar">
          <div>
            <strong>{user?.username ?? user?.email}</strong>
            <span className="pill">{user?.role}</span>
          </div>
          <button className="ghost" onClick={onLogout}>
            Logout
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
