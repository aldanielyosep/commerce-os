import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  assignEmployeeDepartment,
  createEmployee,
  deleteEmployee,
  getEmployee,
  listDepartments,
  listEmployeeDepartments,
  listEmployees,
  removeEmployeeDepartment,
  terminateEmployee,
  updateEmployee
} from "../lib/api";
import type {
  Department,
  Employee,
  EmployeeDepartmentAssignment,
  EmployeeGender,
  EmployeePayload,
  EmployeeStatus
} from "../lib/types";

const STATUSES: EmployeeStatus[] = ["active", "probation", "resigned", "terminated", "retired"];

type EmployeeFormState = EmployeePayload;

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; employeeId: number }
  | { mode: "view"; employeeId: number };

const EMPTY_FORM: EmployeeFormState = {
  full_name: "",
  gender: "male",
  birth_date: "",
  join_date: "",
  identity_number: "",
  phone_number: "",
  email: "",
  address: "",
  city: "",
  postal_code: ""
};

export function EmployeesPage() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedFilters, setAppliedFilters] = useState<{ status?: EmployeeStatus; department_id?: number; q?: string }>({});

  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [assignmentRows, setAssignmentRows] = useState<EmployeeDepartmentAssignment[]>([]);
  const [form, setForm] = useState<EmployeeFormState>(EMPTY_FORM);
  const [assignDepartmentId, setAssignDepartmentId] = useState<string>("");
  const [assignedDate, setAssignedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const canTerminate = user?.role === "super_admin";

  const selectedDepartment = useMemo(
    () => departments.find((department) => String(department.id) === assignDepartmentId),
    [assignDepartmentId, departments]
  );

  useEffect(() => {
    if (!token) return;

    listDepartments(token)
      .then(setDepartments)
      .catch((err: Error) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    listEmployees(token, appliedFilters)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, appliedFilters]);

  async function refreshEmployeeList() {
    if (!token) return;

    const refreshed = await listEmployees(token, appliedFilters);
    setRows(refreshed);
  }

  async function openCreate() {
    setError(null);
    setSelectedEmployee(null);
    setAssignmentRows([]);
    setForm(EMPTY_FORM);
    setDrawer({ mode: "create" });
  }

  async function openEdit(employeeId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    try {
      const employee = await getEmployee(token, employeeId);
      setSelectedEmployee(employee);
      setForm({
        full_name: employee.full_name,
        gender: employee.gender,
        birth_date: employee.birth_date,
        join_date: employee.join_date,
        identity_number: employee.identity_number,
        phone_number: employee.phone_number,
        email: employee.email,
        address: employee.address,
        city: employee.city,
        postal_code: employee.postal_code
      });
      setDrawer({ mode: "edit", employeeId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function openView(employeeId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    try {
      const [employee, assignments] = await Promise.all([
        getEmployee(token, employeeId),
        listEmployeeDepartments(token, employeeId)
      ]);

      setSelectedEmployee(employee);
      setAssignmentRows(assignments);
      setAssignDepartmentId(String(departments[0]?.id ?? ""));
      setAssignedDate(new Date().toISOString().slice(0, 10));
      setDrawer({ mode: "view", employeeId });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setSelectedEmployee(null);
    setAssignmentRows([]);
    setForm(EMPTY_FORM);
  }

  function applyFilters() {
    setAppliedFilters({
      status: statusFilter ? (statusFilter as EmployeeStatus) : undefined,
      department_id: departmentFilter ? Number(departmentFilter) : undefined,
      q: queryFilter.trim() ? queryFilter.trim() : undefined
    });
  }

  function resetFilters() {
    setStatusFilter("");
    setDepartmentFilter("");
    setQueryFilter("");
    setAppliedFilters({});
  }

  function onFormFieldChange<K extends keyof EmployeeFormState>(field: K, value: EmployeeFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function onSubmitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      if (drawer.mode === "create") {
        await createEmployee(token, form);
      }

      if (drawer.mode === "edit") {
        await updateEmployee(token, drawer.employeeId, form);
      }

      await refreshEmployeeList();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onTerminate(employeeId: number) {
    if (!token || !canTerminate) return;
    if (!window.confirm("Terminate this employee now?")) return;

    setBusy(true);
    setError(null);

    try {
      await terminateEmployee(token, employeeId);
      await refreshEmployeeList();
      if (selectedEmployee?.id === employeeId) {
        await openView(employeeId);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(employeeId: number) {
    if (!token || !canTerminate) return;
    if (!window.confirm("Soft delete this employee record?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteEmployee(token, employeeId);
      await refreshEmployeeList();
      if (selectedEmployee?.id === employeeId) closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onAssignDepartment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || drawer.mode !== "view" || !assignDepartmentId || !assignedDate) return;

    setBusy(true);
    setError(null);

    try {
      await assignEmployeeDepartment(token, drawer.employeeId, {
        department_id: Number(assignDepartmentId),
        assigned_date: assignedDate
      });

      const assignments = await listEmployeeDepartments(token, drawer.employeeId);
      setAssignmentRows(assignments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onRemoveAssignment(assignmentId: number) {
    if (!token || drawer.mode !== "view") return;

    setBusy(true);
    setError(null);

    try {
      await removeEmployeeDepartment(token, drawer.employeeId, assignmentId);
      const assignments = await listEmployeeDepartments(token, drawer.employeeId);
      setAssignmentRows(assignments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const actionDisabled = busy || loading;

  return (
    <section>
      <div className="page-head">
        <h2>Employees</h2>
        <button className="primary" onClick={() => void openCreate()} disabled={actionDisabled}>
          Add Employee
        </button>
      </div>

      <div className="card inline-form">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
            <option value="">All</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.code} - {department.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Search
          <input
            type="text"
            placeholder="Employee ID, name, or email"
            value={queryFilter}
            onChange={(event) => setQueryFilter(event.target.value)}
          />
        </label>
        <div className="actions">
          <button className="primary" onClick={applyFilters} disabled={actionDisabled}>
            Apply
          </button>
          <button className="ghost" onClick={resetFilters} disabled={actionDisabled}>
            Reset
          </button>
        </div>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No employees found.">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Status</th>
              <th>Email</th>
              <th>City</th>
              <th>Actions</th>
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
                <td className="actions">
                  <button className="ghost" onClick={() => void openView(row.id)} disabled={actionDisabled}>
                    View
                  </button>
                  <button className="ghost" onClick={() => void openEdit(row.id)} disabled={actionDisabled}>
                    Edit
                  </button>
                  {canTerminate ? (
                    <>
                      <button className="danger" onClick={() => void onTerminate(row.id)} disabled={actionDisabled}>
                        Terminate
                      </button>
                      <button className="danger" onClick={() => void onDelete(row.id)} disabled={actionDisabled}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>

      {drawer.mode !== "none" ? (
        <div className="overlay" onClick={closeDrawer}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            {drawer.mode === "create" || drawer.mode === "edit" ? (
              <>
                <div className="page-head">
                  <h3>{drawer.mode === "create" ? "Create Employee" : "Edit Employee"}</h3>
                  <button className="ghost" onClick={closeDrawer}>
                    Close
                  </button>
                </div>
                <form className="form-grid" onSubmit={onSubmitForm}>
                  <label>
                    Full Name
                    <input
                      required
                      value={form.full_name}
                      onChange={(event) => onFormFieldChange("full_name", event.target.value)}
                    />
                  </label>
                  <label>
                    Gender
                    <select
                      value={form.gender}
                      onChange={(event) => onFormFieldChange("gender", event.target.value as EmployeeGender)}
                    >
                      <option value="male">male</option>
                      <option value="female">female</option>
                    </select>
                  </label>
                  <label>
                    Birth Date
                    <input
                      required
                      type="date"
                      value={form.birth_date}
                      onChange={(event) => onFormFieldChange("birth_date", event.target.value)}
                    />
                  </label>
                  <label>
                    Join Date
                    <input
                      required
                      type="date"
                      value={form.join_date}
                      onChange={(event) => onFormFieldChange("join_date", event.target.value)}
                    />
                  </label>
                  <label>
                    Identity Number
                    <input
                      required
                      value={form.identity_number}
                      onChange={(event) => onFormFieldChange("identity_number", event.target.value)}
                    />
                  </label>
                  <label>
                    Phone Number
                    <input
                      required
                      type="tel"
                      placeholder="+6281234567890"
                      value={form.phone_number}
                      onChange={(event) => onFormFieldChange("phone_number", event.target.value)}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(event) => onFormFieldChange("email", event.target.value)}
                    />
                  </label>
                  <label>
                    City
                    <input required value={form.city} onChange={(event) => onFormFieldChange("city", event.target.value)} />
                  </label>
                  <label>
                    Postal Code
                    <input
                      required
                      value={form.postal_code}
                      onChange={(event) => onFormFieldChange("postal_code", event.target.value)}
                    />
                  </label>
                  <label className="span-2">
                    Address
                    <input
                      required
                      value={form.address}
                      onChange={(event) => onFormFieldChange("address", event.target.value)}
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
              </>
            ) : null}

            {drawer.mode === "view" && selectedEmployee ? (
              <>
                <div className="page-head">
                  <h3>
                    {selectedEmployee.full_name} ({selectedEmployee.employee_id})
                  </h3>
                  <button className="ghost" onClick={closeDrawer}>
                    Close
                  </button>
                </div>

                <div className="grid two-col">
                  <article className="card">
                    <h4>Profile</h4>
                    <ul className="list">
                      <li>
                        <span>Status</span>
                        <strong>{selectedEmployee.status}</strong>
                      </li>
                      <li>
                        <span>Gender</span>
                        <strong>{selectedEmployee.gender}</strong>
                      </li>
                      <li>
                        <span>Birth Date</span>
                        <strong>{selectedEmployee.birth_date}</strong>
                      </li>
                      <li>
                        <span>Join Date</span>
                        <strong>{selectedEmployee.join_date}</strong>
                      </li>
                      <li>
                        <span>Identity Number</span>
                        <strong>{selectedEmployee.identity_number}</strong>
                      </li>
                      <li>
                        <span>Phone</span>
                        <strong>{selectedEmployee.phone_number}</strong>
                      </li>
                      <li>
                        <span>Email</span>
                        <strong>{selectedEmployee.email}</strong>
                      </li>
                      <li>
                        <span>City</span>
                        <strong>{selectedEmployee.city}</strong>
                      </li>
                      <li>
                        <span>Postal Code</span>
                        <strong>{selectedEmployee.postal_code}</strong>
                      </li>
                    </ul>
                  </article>

                  <article className="card">
                    <h4>Department Assignments</h4>
                    {assignmentRows.length === 0 ? <p className="state">No assignments found.</p> : null}
                    {assignmentRows.length > 0 ? (
                      <ul className="list">
                        {assignmentRows.map((assignment) => (
                          <li key={assignment.id}>
                            <span>
                              {assignment.department.code} - {assignment.department.name} ({assignment.assigned_date})
                            </span>
                            <button
                              className="danger"
                              onClick={() => void onRemoveAssignment(assignment.id)}
                              disabled={busy}
                            >
                              Remove
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <form className="inline-form" onSubmit={onAssignDepartment}>
                      <label>
                        Department
                        <select
                          required
                          value={assignDepartmentId}
                          onChange={(event) => setAssignDepartmentId(event.target.value)}
                        >
                          <option value="">Select department</option>
                          {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.code} - {department.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Assigned Date
                        <input
                          required
                          type="date"
                          value={assignedDate}
                          onChange={(event) => setAssignedDate(event.target.value)}
                        />
                      </label>
                      <button
                        className="primary"
                        type="submit"
                        disabled={busy || !assignedDate || !assignDepartmentId || !selectedDepartment}
                      >
                        Assign
                      </button>
                    </form>

                    {canTerminate ? (
                      <div className="actions">
                        <button
                          className="danger"
                          onClick={() => void onTerminate(selectedEmployee.id)}
                          disabled={busy}
                        >
                          Terminate
                        </button>
                        <button className="danger" onClick={() => void onDelete(selectedEmployee.id)} disabled={busy}>
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </article>
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
