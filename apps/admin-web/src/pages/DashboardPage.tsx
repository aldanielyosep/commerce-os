import { useAuth } from "../contexts/AuthContext";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <section>
      <h2>Dashboard</h2>
      <p>
        Welcome back, <strong>{user?.username ?? user?.email}</strong>. Use the navigation to manage core
        operations across employees, departments, users, careers, and documents.
      </p>
      <div className="grid">
        <article className="card accent-a">
          <h3>Workforce</h3>
          <p>Track employee lifecycle and assignments.</p>
        </article>
        <article className="card accent-b">
          <h3>Governance</h3>
          <p>Control access, roles, and compliance activity.</p>
        </article>
        <article className="card accent-c">
          <h3>Compensation</h3>
          <p>Review salary and position timelines quickly.</p>
        </article>
      </div>
    </section>
  );
}
