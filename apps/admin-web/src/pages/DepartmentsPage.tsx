import { FormEvent, useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { createDepartment, deleteDepartment, getDepartment, listDepartments, updateDepartment } from "../lib/api";
import type { Department, DepartmentPayload } from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; departmentId: number };

const EMPTY_FORM: DepartmentPayload = {
  code: "",
  name: ""
};

export function DepartmentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<DepartmentPayload>(EMPTY_FORM);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    listDepartments(token)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function refreshDepartments() {
    if (!token) return;
    const nextRows = await listDepartments(token);
    setRows(nextRows);
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setForm(EMPTY_FORM);
  }

  function openCreate() {
    setError(null);
    setForm(EMPTY_FORM);
    setDrawer({ mode: "create" });
  }

  async function openEdit(departmentId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const department = await getDepartment(token, departmentId);
      setForm({ code: department.code, name: department.name });
      setDrawer({ mode: "edit", departmentId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      if (drawer.mode === "create") {
        await createDepartment(token, form);
      }

      if (drawer.mode === "edit") {
        await updateDepartment(token, drawer.departmentId, form);
      }

      await refreshDepartments();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(departmentId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this department?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteDepartment(token, departmentId);
      await refreshDepartments();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h2>Departments</h2>
        <button className="primary" type="button" onClick={openCreate} disabled={busy || loading}>
          Add Department
        </button>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No departments found.">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td className="actions">
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => void openEdit(row.id)}
                    disabled={busy || loading}
                  >
                    Edit
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => void onDelete(row.id)}
                    disabled={busy || loading}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>

      {drawer.mode !== "none" ? (
        <div className="overlay" onClick={closeDrawer}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-head">
              <h3>{drawer.mode === "create" ? "Create Department" : "Edit Department"}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Code
                <input
                  required
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                />
              </label>
              <label>
                Name
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <div className="actions span-2">
                <button className="primary" type="submit" disabled={busy}>
                  {busy ? "Saving..." : "Save"}
                </button>
                <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
