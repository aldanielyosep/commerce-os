import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { listDepartments } from "../lib/api";
import type { Department } from "../lib/types";

export function DepartmentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listDepartments(token)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section>
      <h2>Departments</h2>
      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No departments found.">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.code}</td>
                <td>{row.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </section>
  );
}
