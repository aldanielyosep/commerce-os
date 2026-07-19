import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  changeUserRole,
  createUserCompanyAssignment,
  createUser,
  deleteUserCompanyAssignment,
  deleteUser,
  disableUser,
  enableUser,
  getUser,
  listCompanies,
  listEmployees,
  listUserCompanyAssignments,
  listUsersPage,
  resetUserPassword,
  updateUser
} from "../lib/api";
import type {
  Company,
  Employee,
  PaginationMeta,
  SortDirection,
  UserCompanyAssignment,
  UserOrderBy,
  UserPayload,
  UserRecord,
  UserRole,
  UserStatus,
  UserUpdatePayload
} from "../lib/types";

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

type AssignmentFormState = {
  company_id: string;
  role_in_company: string;
};

const EMPTY_CREATE_FORM: CreateFormState = {
  email: "",
  username: "",
  password: "",
  password_confirmation: "",
  role: "admin_company",
  status: "active",
  employee_id: ""
};

const EMPTY_EDIT_FORM: EditFormState = {
  email: "",
  username: "",
  employee_id: ""
};

const EMPTY_ASSIGNMENT_FORM: AssignmentFormState = {
  company_id: "",
  role_in_company: ""
};
const USER_SORT_FIELDS: UserOrderBy[] = ["id", "email", "username", "role", "status", "created_at"];

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

export function UsersPage() {
  const { token, user: currentUser } = useAuth();
  const [rows, setRows] = useState<UserRecord[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [assignmentRows, setAssignmentRows] = useState<UserCompanyAssignment[]>([]);
  const [selectedAssignmentUserId, setSelectedAssignmentUserId] = useState<string>("");
  const [assignmentForm, setAssignmentForm] = useState<AssignmentFormState>(EMPTY_ASSIGNMENT_FORM);
  const [loading, setLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [assignmentBusy, setAssignmentBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<UserOrderBy>("id");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>();
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [createForm, setCreateForm] = useState<CreateFormState>(EMPTY_CREATE_FORM);
  const [editForm, setEditForm] = useState<EditFormState>(EMPTY_EDIT_FORM);

  const employeeOptions = useMemo(() => employees.map((employee) => ({
    id: employee.id,
    label: `${employee.full_name} (${employee.employee_id})`
  })), [employees]);

  const selectedAssignmentUser = useMemo(() => {
    if (!selectedAssignmentUserId) return null;
    return rows.find((row) => row.id === Number(selectedAssignmentUserId)) ?? null;
  }, [rows, selectedAssignmentUserId]);

  const availableCompanyOptions = useMemo(() => {
    const assignedCompanyIds = new Set(assignmentRows.map((assignment) => assignment.company_id));
    return companies.filter((company) => !assignedCompanyIds.has(company.id));
  }, [assignmentRows, companies]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    Promise.all([
      listUsersPage(token, {
        page: currentPage,
        q: appliedQuery,
        order_by: sortBy === "id" ? undefined : sortBy,
        order_dir: sortDir === "asc" ? undefined : sortDir
      }),
      listEmployees(token),
      listCompanies(token)
    ])
      .then(([usersPage, employeeRows, companyRows]) => {
        setRows(usersPage.items);
        setPagination(usersPage.meta);
        setEmployees(employeeRows);
        setCompanies(companyRows);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, currentPage, sortBy, sortDir, appliedQuery]);

  async function refreshUsers() {
    if (!token) return;
    const usersPage = await listUsersPage(token, {
      page: currentPage,
      q: appliedQuery,
      order_by: sortBy === "id" ? undefined : sortBy,
      order_dir: sortDir === "asc" ? undefined : sortDir
    });
    setRows(usersPage.items);
    setPagination(usersPage.meta);
    if (usersPage.meta.total_pages > 0 && currentPage > usersPage.meta.total_pages) {
      setCurrentPage(usersPage.meta.total_pages);
    }
  }

  function onChangeSortBy(value: UserOrderBy) {
    setCurrentPage(1);
    setSortBy(value);
  }

  function onChangeSortDir(value: SortDirection) {
    setCurrentPage(1);
    setSortDir(value);
  }

  function applyQuery() {
    setCurrentPage(1);
    setAppliedQuery(queryFilter.trim() || undefined);
  }

  function resetQuery() {
    setQueryFilter("");
    setCurrentPage(1);
    setAppliedQuery(undefined);
  }

  function goToPreviousPage() {
    setCurrentPage((page) => Math.max(1, page - 1));
  }

  function goToNextPage() {
    setCurrentPage((page) => {
      if (pagination.total_pages <= 0) return page;
      return Math.min(pagination.total_pages, page + 1);
    });
  }

  async function refreshAssignments(userId: number) {
    if (!token) return;

    setAssignmentsLoading(true);
    setAssignmentError(null);

    try {
      const assignments = await listUserCompanyAssignments(token, userId);
      setAssignmentRows(assignments);
    } catch (err) {
      setAssignmentError((err as Error).message);
    } finally {
      setAssignmentsLoading(false);
    }
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
        role: createForm.role,
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

  async function onSelectAssignmentUser(nextUserId: string) {
    setSelectedAssignmentUserId(nextUserId);
    setAssignmentRows([]);
    setAssignmentForm(EMPTY_ASSIGNMENT_FORM);
    setAssignmentError(null);

    if (!nextUserId) return;
    await refreshAssignments(Number(nextUserId));
  }

  async function onCreateAssignment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedAssignmentUserId || !assignmentForm.company_id) return;

    setAssignmentBusy(true);
    setAssignmentError(null);

    try {
      await createUserCompanyAssignment(token, Number(selectedAssignmentUserId), {
        company_id: Number(assignmentForm.company_id),
        role_in_company: assignmentForm.role_in_company.trim() || undefined
      });
      setAssignmentForm(EMPTY_ASSIGNMENT_FORM);
      await refreshAssignments(Number(selectedAssignmentUserId));
    } catch (err) {
      setAssignmentError((err as Error).message);
    } finally {
      setAssignmentBusy(false);
    }
  }

  async function onDeleteAssignment(assignment: UserCompanyAssignment) {
    if (!token || !selectedAssignmentUserId) return;

    setAssignmentBusy(true);
    setAssignmentError(null);

    try {
      await deleteUserCompanyAssignment(token, Number(selectedAssignmentUserId), assignment.id);
      await refreshAssignments(Number(selectedAssignmentUserId));
    } catch (err) {
      setAssignmentError((err as Error).message);
    } finally {
      setAssignmentBusy(false);
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
        <div className="actions" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <div className="actions">
            <label>
              Search
              <input value={queryFilter} onChange={(event) => setQueryFilter(event.target.value)} placeholder="Email, username, employee" />
            </label>
            <label>
              Sort By
              <select value={sortBy} onChange={(event) => onChangeSortBy(event.target.value as UserOrderBy)}>
                {USER_SORT_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Direction
              <select value={sortDir} onChange={(event) => onChangeSortDir(event.target.value as SortDirection)}>
                <option value="asc">asc</option>
                <option value="desc">desc</option>
              </select>
            </label>
            <button className="primary" type="button" onClick={applyQuery} disabled={busy || loading}>
              Apply
            </button>
            <button className="ghost" type="button" onClick={resetQuery} disabled={busy || loading}>
              Reset
            </button>
          </div>
          <div className="actions">
            <span>
              Page {pagination.page} of {Math.max(pagination.total_pages, 1)} ({pagination.total_count} total)
            </span>
            <button className="ghost" type="button" onClick={goToPreviousPage} disabled={busy || loading || currentPage <= 1}>
              Previous
            </button>
            <button
              className="ghost"
              type="button"
              onClick={goToNextPage}
              disabled={busy || loading || pagination.total_pages <= 1 || currentPage >= pagination.total_pages}
            >
              Next
            </button>
          </div>
        </div>
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
                    onClick={() => void onChangeRole(row, "admin_company")}
                    disabled={busy || loading || row.role === "admin_company"}
                  >
                    Set Company Admin
                  </button>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => void onChangeRole(row, "admin_storefront_ops")}
                    disabled={busy || loading || row.role === "admin_storefront_ops"}
                  >
                    Set Storefront Ops
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

      <div className="card accent-b">
        <div className="page-head">
          <div>
            <h3>Company Assignments</h3>
            <p>Assign admin users to allowed companies for scoped company access.</p>
          </div>
        </div>

        <div className="inline-form">
          <label>
            User
            <select
              value={selectedAssignmentUserId}
              onChange={(event) => void onSelectAssignmentUser(event.target.value)}
              disabled={loading || assignmentBusy || busy}
            >
              <option value="">Select user</option>
              {rows.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.email}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedAssignmentUser ? (
          <>
            <form className="inline-form" onSubmit={onCreateAssignment}>
              <label>
                Company
                <select
                  value={assignmentForm.company_id}
                  onChange={(event) =>
                    setAssignmentForm((current) => ({ ...current, company_id: event.target.value }))
                  }
                  disabled={assignmentBusy || assignmentsLoading}
                  required
                >
                  <option value="">Select company</option>
                  {availableCompanyOptions.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name} ({company.code})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Role in Company
                <input
                  value={assignmentForm.role_in_company}
                  onChange={(event) =>
                    setAssignmentForm((current) => ({ ...current, role_in_company: event.target.value }))
                  }
                  disabled={assignmentBusy || assignmentsLoading}
                  placeholder="optional"
                />
              </label>

              <button
                className="primary"
                type="submit"
                disabled={assignmentBusy || assignmentsLoading || availableCompanyOptions.length === 0}
              >
                {assignmentBusy ? "Assigning..." : "Assign Company"}
              </button>
            </form>

            <DataState
              loading={assignmentsLoading}
              error={assignmentError}
              empty={assignmentRows.length === 0}
              emptyLabel="No company assignments for this user."
            >
              <table>
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Code</th>
                    <th>Role in Company</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignmentRows.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>{assignment.company.name}</td>
                      <td>{assignment.company.code}</td>
                      <td>{assignment.role_in_company ?? "-"}</td>
                      <td className="actions">
                        <button
                          className="danger"
                          type="button"
                          onClick={() => void onDeleteAssignment(assignment)}
                          disabled={assignmentBusy || assignmentsLoading}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataState>
          </>
        ) : null}
      </div>

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
                  <select
                    value={createForm.role}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, role: event.target.value as UserRole }))
                    }
                  >
                    <option value="admin_company">admin_company</option>
                    <option value="admin_storefront_ops">admin_storefront_ops</option>
                    <option value="admin">admin (legacy)</option>
                  </select>
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
