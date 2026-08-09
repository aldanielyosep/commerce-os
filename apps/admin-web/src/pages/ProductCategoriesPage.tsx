import { FormEvent, useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  createCategory,
  deleteCategory,
  getCategory,
  listCategoriesPage,
  listProductDepartments,
  updateCategory
} from "../lib/api";
import type {
  PaginationMeta,
  ProductCategory,
  ProductCategoryOrderBy,
  ProductCategoryPayload,
  ProductDepartment,
  SortDirection
} from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; categoryId: number };

type CategoryFormState = {
  department_id: string;
  name: string;
};

const EMPTY_FORM: CategoryFormState = {
  department_id: "",
  name: ""
};

const CATEGORY_SORT_FIELDS: ProductCategoryOrderBy[] = ["name", "created_at"];

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

function toPayload(form: CategoryFormState): ProductCategoryPayload {
  return {
    department_id: Number(form.department_id),
    name: form.name.trim()
  };
}

export function ProductCategoriesPage() {
  const { token } = useAuth();
  const [departments, setDepartments] = useState<ProductDepartment[]>([]);
  const [rows, setRows] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductCategoryOrderBy>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>();
  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);

  useEffect(() => {
    if (!token) return;

    listProductDepartments(token)
      .then((items) => {
        setDepartments(items);
        setForm((current) => ({
          ...current,
          department_id: current.department_id || String(items[0]?.id ?? "")
        }));
      })
      .catch((err: Error) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    listCategoriesPage(token, {
      page: currentPage,
      department_id: departmentFilter ? Number(departmentFilter) : undefined,
      q: appliedQuery,
      order_by: sortBy === "name" ? undefined : sortBy,
      order_dir: sortDir === "asc" ? undefined : sortDir
    })
      .then((result) => {
        setRows(result.items);
        setPagination(result.meta);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, currentPage, departmentFilter, sortBy, sortDir, appliedQuery]);

  async function refreshCategories() {
    if (!token) return;

    const result = await listCategoriesPage(token, {
      page: currentPage,
      department_id: departmentFilter ? Number(departmentFilter) : undefined,
      q: appliedQuery,
      order_by: sortBy === "name" ? undefined : sortBy,
      order_dir: sortDir === "asc" ? undefined : sortDir
    });

    setRows(result.items);
    setPagination(result.meta);
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

  function onChangeSortBy(value: ProductCategoryOrderBy) {
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
    setDepartmentFilter("");
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setForm({
      department_id: String(departments[0]?.id ?? ""),
      name: ""
    });
  }

  function openCreate() {
    setError(null);
    setForm({
      department_id: departmentFilter || String(departments[0]?.id ?? ""),
      name: ""
    });
    setDrawer({ mode: "create" });
  }

  async function openEdit(categoryId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const record = await getCategory(token, categoryId);
      setForm({
        department_id: String(record.product_department_id ?? record.department_id),
        name: record.name
      });
      setDrawer({ mode: "edit", categoryId });
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
      const payload = toPayload(form);

      if (drawer.mode === "create") {
        await createCategory(token, payload);
      }

      if (drawer.mode === "edit") {
        await updateCategory(token, drawer.categoryId, payload);
      }

      await refreshCategories();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(categoryId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this category?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteCategory(token, categoryId);
      await refreshCategories();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h2>Product Categories</h2>
        <button className="primary" type="button" onClick={openCreate} disabled={busy || loading || departments.length === 0}>
          Add Category
        </button>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No categories found.">
        <div className="actions" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <div className="actions">
            <label>
              Department
              <select
                value={departmentFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setDepartmentFilter(event.target.value);
                }}
              >
                <option value="">all</option>
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
                value={queryFilter}
                onChange={(event) => setQueryFilter(event.target.value)}
                placeholder="Category name"
              />
            </label>
            <label>
              Sort By
              <select value={sortBy} onChange={(event) => onChangeSortBy(event.target.value as ProductCategoryOrderBy)}>
                {CATEGORY_SORT_FIELDS.map((field) => (
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
              <th>Department</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const departmentId = row.product_department_id ?? row.department_id;
              const department = departments.find((item) => item.id === departmentId);

              return (
                <tr key={row.id}>
                  <td>{department ? `${department.code} - ${department.name}` : departmentId}</td>
                  <td>{row.name}</td>
                  <td className="actions">
                    <button className="ghost" type="button" onClick={() => void openEdit(row.id)} disabled={busy || loading}>
                      Edit
                    </button>
                    <button className="danger" type="button" onClick={() => void onDelete(row.id)} disabled={busy || loading}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DataState>

      {drawer.mode !== "none" ? (
        <div className="overlay" onClick={closeDrawer}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-head">
              <h3>{drawer.mode === "create" ? "Create Category" : "Edit Category"}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Product Department
                <select
                  required
                  value={form.department_id}
                  onChange={(event) => setForm((current) => ({ ...current, department_id: event.target.value }))}
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.code} - {department.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Category Name
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
