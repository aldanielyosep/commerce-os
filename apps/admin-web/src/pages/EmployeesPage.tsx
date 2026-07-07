import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { listEmployees } from "../lib/api";
import type { Employee } from "../lib/types";

export function EmployeesPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listEmployees(token)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section>
      <h2>Employees</h2>
      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No employees found.">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Email</th>
              <th>City</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.employee_id}</td>
                <td>{row.full_name}</td>
                <td>{row.status}</td>
                <td>{row.email}</td>
                <td>{row.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </section>
  );
}
