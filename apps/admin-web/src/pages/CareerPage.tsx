import { FormEvent, useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { listEmployees, listPositionTimeline, listSalaryTimeline } from "../lib/api";
import type { Employee, PositionHistory, SalaryRecord } from "../lib/types";

export function CareerPage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [positions, setPositions] = useState<PositionHistory[]>([]);
  const [salaries, setSalaries] = useState<SalaryRecord[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    listEmployees(token)
      .then((rows) => {
        setEmployees(rows);
        if (rows[0]) setEmployeeId(rows[0].id);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoadingEmployees(false));
  }, [token]);

  async function loadTimeline(event: FormEvent) {
    event.preventDefault();
    if (!token || !employeeId) return;

    setLoadingTimeline(true);
    setError(null);

    try {
      const [positionRows, salaryRows] = await Promise.all([
        listPositionTimeline(token, employeeId),
        listSalaryTimeline(token, employeeId)
      ]);

      setPositions(positionRows);
      setSalaries(salaryRows);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingTimeline(false);
    }
  }

  return (
    <section>
      <h2>Salary and Position Timelines</h2>
      <form className="inline-form" onSubmit={loadTimeline}>
        <label>
          Employee
          <select
            value={employeeId ?? ""}
            onChange={(e) => setEmployeeId(Number(e.target.value))}
            disabled={loadingEmployees || employees.length === 0}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} ({employee.employee_id})
              </option>
            ))}
          </select>
        </label>
        <button className="primary" type="submit" disabled={loadingEmployees || !employeeId || loadingTimeline}>
          {loadingTimeline ? "Refreshing..." : "Load Timeline"}
        </button>
      </form>

      <DataState
        loading={loadingEmployees}
        error={error}
        empty={employees.length === 0}
        emptyLabel="No employees available."
      >
        <div className="grid two-col">
          <article className="card">
            <h3>Position Timeline</h3>
            {positions.length === 0 ? (
              <p className="state">No position records loaded.</p>
            ) : (
              <ul className="list">
                {positions.map((row) => (
                  <li key={row.id}>
                    <strong>{row.position}</strong>
                    <span>{row.effective_date}</span>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="card">
            <h3>Salary Timeline</h3>
            {salaries.length === 0 ? (
              <p className="state">No salary records loaded.</p>
            ) : (
              <ul className="list">
                {salaries.map((row) => (
                  <li key={row.id}>
                    <strong>IDR {(row.basic_salary_cents / 100).toLocaleString()}</strong>
                    <span>
                      {row.effective_date} {row.end_date ? `to ${row.end_date}` : "to present"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </DataState>
    </section>
  );
}
