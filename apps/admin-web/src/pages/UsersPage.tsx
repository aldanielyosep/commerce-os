import { useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { listUsers } from "../lib/api";
import type { UserRecord } from "../lib/types";

export function UsersPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listUsers(token)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <section>
      <h2>Users</h2>
      <p>Super Admin route: manage user visibility and status snapshot.</p>
      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No users found.">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.username ?? "-"}</td>
                <td>{row.role}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </section>
  );
}
