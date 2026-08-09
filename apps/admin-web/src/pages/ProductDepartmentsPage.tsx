import { FormEvent, useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  createProductDepartment,
  deleteProductDepartment,
  getProductDepartment,
  listProductDepartmentsPage,
  updateProductDepartment
} from "../lib/api";
import type {
  PaginationMeta,
  ProductDepartment,
  ProductDepartmentOrderBy,
  ProductDepartmentPayload,
  SortDirection
} from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; productDepartmentId: number };

const EMPTY_FORM: ProductDepartmentPayload = {
  code: "",
  name: ""
};

const PRODUCT_DEPARTMENT_SORT_FIELDS: ProductDepartmentOrderBy[] = ["name", "code", "created_at"];

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

export function ProductDepartmentsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<ProductDepartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductDepartmentOrderBy>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>();
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<ProductDepartmentPayload>(EMPTY_FORM);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    listProductDepartmentsPage(token, {
      page: currentPage,
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
  }, [token, currentPage, sortBy, sortDir, appliedQuery]);

  async function refreshProductDepartments() {
    if (!token) return;

    const result = await listProductDepartmentsPage(token, {
      page: currentPage,
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

  function onChangeSortBy(value: ProductDepartmentOrderBy) {
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

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setForm(EMPTY_FORM);
  }

  function openCreate() {
    setError(null);
    setForm(EMPTY_FORM);
    setDrawer({ mode: "create" });
  }

  async function openEdit(productDepartmentId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const record = await getProductDepartment(token, productDepartmentId);
      setForm({ code: record.code, name: record.name });
      setDrawer({ mode: "edit", productDepartmentId });
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
        await createProductDepartment(token, form);
      }

      if (drawer.mode === "edit") {
        await updateProductDepartment(token, drawer.productDepartmentId, form);
      }

      await refreshProductDepartments();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(productDepartmentId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this product department?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteProductDepartment(token, productDepartmentId);
      await refreshProductDepartments();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h2>Product Departments</h2>
        <button className="primary" type="button" onClick={openCreate} disabled={busy || loading}>
          Add Product Department
        </button>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={rows.length === 0}
        emptyLabel="No product departments found."
      >
        <div className="actions" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <div className="actions">
            <label>
              Search
              <input
                value={queryFilter}
                onChange={(event) => setQueryFilter(event.target.value)}
                placeholder="Code or name"
              />
            </label>
            <label>
              Sort By
              <select
                value={sortBy}
                onChange={(event) => onChangeSortBy(event.target.value as ProductDepartmentOrderBy)}
              >
                {PRODUCT_DEPARTMENT_SORT_FIELDS.map((field) => (
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
            <button
              className="ghost"
              type="button"
              onClick={goToPreviousPage}
              disabled={busy || loading || currentPage <= 1}
            >
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
              <h3>{drawer.mode === "create" ? "Create Product Department" : "Edit Product Department"}</h3>
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
