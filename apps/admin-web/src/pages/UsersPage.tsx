import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  changeUserRole,
  createUser,
  deleteUser,
  disableUser,
  enableUser,
  getUser,
  listEmployees,
  listUsers,
  resetUserPassword,
  updateUser
} from "../lib/api";
import type { Employee, UserPayload, UserRecord, UserRole, UserStatus, UserUpdatePayload } from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; userId: number };

type CreateFormState = {
  email: string;
  username: string;
  password: string;
  password_confirmation: string;
  role: UserRole;
  status: UserStatus;
  employee_id: string;
};

type EditFormState = {
  email: string;
  username: string;
  employee_id: string;
};

const EMPTY_CREATE_FORM: CreateFormState = {
  email: "",
  username: "",
  password: "",
  password_confirmation: "",
  role: "admin",
  status: "active",
  employee_id: ""
};

const EMPTY_EDIT_FORM: EditFormState = {
  email: "",
  username: "",
  employee_id: ""
};

export function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM);

  const employeeOptions = useMemo(() => employees.map((employee) => ({
    id: employee.id,
    label: `${employee.full_name} (${employee.employee_id})`
  })), [employees]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    Promise.all([listUsers(token), listEmployees(token)])
      .then(([userRows, employeeRows]) => {
        setRows(userRows);
        setEmployees(employeeRows);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function refreshUsers() {
    if (!token) return;
    const userRows = await listUsers(token);
    setRows(userRows);
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setCreateForm(EMPTY_CREATE_FORM);
    setEditForm(EMPTY_EDIT_FORM);
  }

  function openCreate() {
    setError(null);
    setCreateForm(EMPTY_CREATE_FORM);
    setDrawer({ mode: "create" });
  }

  async function openEdit(userId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const targetUser = await getUser(token, userId);
      setEditForm({
        email: targetUser.email,
        username: targetUser.username ?? "",
        employee_id: targetUser.employee_id ? String(targetUser.employee_id) : ""
      });
      setDrawer({ mode: "edit", userId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const payload: UserPayload = {
        email: createForm.email,
        username: createForm.username.trim() || undefined,
        password: createForm.password,
        password_confirmation: createForm.password_confirmation,
        role: "admin",
        status: createForm.status,
        employee_id: createForm.employee_id ? Number(createForm.employee_id) : null
      };

      await createUser(token, payload);
      await refreshUsers();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || drawer.mode !== "edit") return;

    setBusy(true);
    setError(null);

    try {
      const payload: UserUpdatePayload = {
        email: editForm.email.trim() || undefined,
        username: editForm.username.trim() || undefined,
        employee_id: editForm.employee_id ? Number(editForm.employee_id) : null
      };

      await updateUser(token, drawer.userId, payload);
      await refreshUsers();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onToggleStatus(targetUser: UserRecord) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      if (targetUser.status === "active") {
        await disableUser(token, targetUser.id);
      } else {
        await enableUser(token, targetUser.id);
      }

      await refreshUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onChangeRole(targetUser: UserRecord, nextRole: UserRole) {
    if (!token) return;
    if (nextRole === targetUser.role) return;

    setBusy(true);
    setError(null);

    try {
      await changeUserRole(token, targetUser.id, nextRole);
      await refreshUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onResetPassword(userId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      await resetUserPassword(token, userId);
      await refreshUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteUser(targetUser: UserRecord) {
    if (!token) return;
    if (!window.confirm(`Delete user ${targetUser.email}?`)) return;

    setBusy(true);
    setError(null);

    try {
      await deleteUser(token, targetUser.id);
      await refreshUsers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Users</h2>
          <p>Super Admin route: manage user account lifecycle and access.</p>
        </div>
        <button className="primary" type="button" onClick={openCreate} disabled={busy || loading}>
          Add User
        </button>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No users found.">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Username</th>
              <th>Employee</th>
              <th>Role</th>
              <th>Status</th>
              <th>Password Reset</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.email}</td>
                <td>{row.username ?? "-"}</td>
                <td>{row.employee_id ?? "-"}</td>
                <td>{row.role}</td>
                <td>{row.status}</td>
                <td>{row.reset_password_sent_at ?? "-"}</td>
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
                    className="ghost"
                    type="button"
                    onClick={() => void onToggleStatus(row)}
                    disabled={busy || loading || row.id === currentUser?.id}
                  >
                    {row.status === "active" ? "Disable" : "Enable"}
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => void onChangeRole(row, "admin")}
                    disabled={busy || loading || row.role === "admin"}
                  >
                    Set Admin
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => void onResetPassword(row.id)}
                    disabled={busy || loading}
                  >
                    Reset Password
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => void onDeleteUser(row)}
                    disabled={busy || loading || row.id === currentUser?.id}
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
              <h3>{drawer.mode === "create" ? "Create User" : "Edit User"}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            {drawer.mode === "create" ? (
              <form className="form-grid" onSubmit={onCreateSubmit}>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={createForm.email}
                    onChange={(event) => setCreateForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </label>
                <label>
                  Username
                  <input
                    value={createForm.username}
                    onChange={(event) => setCreateForm((current) => ({ ...current, username: event.target.value }))}
                  />
                </label>
                <label>
                  Password
                  <input
                    required
                    type="password"
                    value={createForm.password}
                    onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))}
                  />
                </label>
                <label>
                  Confirm Password
                  <input
                    required
                    type="password"
                    value={createForm.password_confirmation}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, password_confirmation: event.target.value }))
                    }
                  />
                </label>
                <label>
                  Role
                  <input value="admin" disabled />
                </label>
                <label>
                  Status
                  <select
                    value={createForm.status}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, status: event.target.value as UserStatus }))
                    }
                  >
                    <option value="active">active</option>
                    <option value="disabled">disabled</option>
                  </select>
                </label>
                <label className="span-2">
                  Employee Link
                  <select
                    value={createForm.employee_id}
                    onChange={(event) => setCreateForm((current) => ({ ...current, employee_id: event.target.value }))}
                  >
                    <option value="">No employee link</option>
                    {employeeOptions.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.label}
                      </option>
                    ))}
                  </select>
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
            ) : null}

            {drawer.mode === "edit" ? (
              <form className="form-grid" onSubmit={onEditSubmit}>
                <label>
                  Email
                  <input
                    required
                    type="email"
                    value={editForm.email}
                    onChange={(event) => setEditForm((current) => ({ ...current, email: event.target.value }))}
                  />
                </label>
                <label>
                  Username
                  <input
                    value={editForm.username}
                    onChange={(event) => setEditForm((current) => ({ ...current, username: event.target.value }))}
                  />
                </label>
                <label className="span-2">
                  Employee Link
                  <select
                    value={editForm.employee_id}
                    onChange={(event) => setEditForm((current) => ({ ...current, employee_id: event.target.value }))}
                  >
                    <option value="">No employee link</option>
                    {employeeOptions.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.label}
                      </option>
                    ))}
                  </select>
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
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
