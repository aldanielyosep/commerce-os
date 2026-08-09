import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  createSubCategory,
  deleteSubCategory,
  getSubCategory,
  listCategories,
  listProductDepartments,
  listSubCategoriesPage,
  updateSubCategory
} from "../lib/api";
import type {
  PaginationMeta,
  ProductCategory,
  ProductDepartment,
  ProductSubCategory,
  ProductSubCategoryOrderBy,
  ProductSubCategoryPayload,
  SortDirection
} from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; subCategoryId: number };

type SubCategoryFormState = {
  category_id: string;
  name: string;
};

const EMPTY_FORM: SubCategoryFormState = {
  category_id: "",
  name: ""
};

const SUB_CATEGORY_SORT_FIELDS: ProductSubCategoryOrderBy[] = ["name", "created_at"];

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

function toPayload(form: SubCategoryFormState): ProductSubCategoryPayload {
  return {
    category_id: Number(form.category_id),
    name: form.name.trim()
  };
}

export function ProductSubCategoriesPage() {
  const { token } = useAuth();

  const [departments, setDepartments] = useState<ProductDepartment[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [rows, setRows] = useState<ProductSubCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductSubCategoryOrderBy>("name");
  const [sortDir, setSortDir] = useState<SortDirection>("asc");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>();

  const [departmentFilter, setDepartmentFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<SubCategoryFormState>(EMPTY_FORM);

  const categoryMap = useMemo(() => {
    const map = new Map<number, ProductCategory>();
    categories.forEach((item) => map.set(item.id, item));
    return map;
  }, [categories]);

  useEffect(() => {
    if (!token) return;

    listProductDepartments(token)
      .then((items) => setDepartments(items))
      .catch((err: Error) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!token) return;

    listCategories(token, {
      department_id: departmentFilter ? Number(departmentFilter) : undefined,
      per_page: 100
    })
      .then((items) => {
        setCategories(items);

        setCategoryFilter((current) => {
          if (!current) return current;
          return items.some((item) => String(item.id) === current) ? current : "";
        });

        setForm((current) => {
          if (drawer.mode === "none") return current;
          if (current.category_id && items.some((item) => String(item.id) === current.category_id)) return current;
          return {
            ...current,
            category_id: String(items[0]?.id ?? "")
          };
        });
      })
      .catch((err: Error) => setError(err.message));
  }, [token, departmentFilter, drawer.mode]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);

    listSubCategoriesPage(token, {
      page: currentPage,
      category_id: categoryFilter ? Number(categoryFilter) : undefined,
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
  }, [token, currentPage, categoryFilter, sortBy, sortDir, appliedQuery]);

  async function refreshSubCategories() {
    if (!token) return;

    const result = await listSubCategoriesPage(token, {
      page: currentPage,
      category_id: categoryFilter ? Number(categoryFilter) : undefined,
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

  function onChangeSortBy(value: ProductSubCategoryOrderBy) {
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
    setCategoryFilter("");
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setForm(EMPTY_FORM);
  }

  function openCreate() {
    setError(null);
    setForm({
      category_id: categoryFilter || String(categories[0]?.id ?? ""),
      name: ""
    });
    setDrawer({ mode: "create" });
  }

  async function openEdit(subCategoryId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);

    try {
      const record = await getSubCategory(token, subCategoryId);
      setForm({
        category_id: String(record.category_id),
        name: record.name
      });
      setDrawer({ mode: "edit", subCategoryId });
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
        await createSubCategory(token, payload);
      }

      if (drawer.mode === "edit") {
        await updateSubCategory(token, drawer.subCategoryId, payload);
      }

      await refreshSubCategories();
      closeDrawer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(subCategoryId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this sub category?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteSubCategory(token, subCategoryId);
      await refreshSubCategories();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <h2>Product Sub Categories</h2>
        <button
          className="primary"
          type="button"
          onClick={openCreate}
          disabled={busy || loading || categories.length === 0}
        >
          Add Sub Category
        </button>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No sub categories found.">
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
              Category
              <select
                value={categoryFilter}
                onChange={(event) => {
                  setCurrentPage(1);
                  setCategoryFilter(event.target.value);
                }}
              >
                <option value="">all</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Search
              <input
                value={queryFilter}
                onChange={(event) => setQueryFilter(event.target.value)}
                placeholder="Sub category name"
              />
            </label>
            <label>
              Sort By
              <select value={sortBy} onChange={(event) => onChangeSortBy(event.target.value as ProductSubCategoryOrderBy)}>
                {SUB_CATEGORY_SORT_FIELDS.map((field) => (
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
              <th>Category</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const category = categoryMap.get(row.category_id);
              const departmentId = category?.product_department_id ?? category?.department_id;
              const department = departments.find((item) => item.id === departmentId);

              return (
                <tr key={row.id}>
                  <td>{department ? `${department.code} - ${department.name}` : "-"}</td>
                  <td>{category?.name ?? row.category_id}</td>
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
              <h3>{drawer.mode === "create" ? "Create Sub Category" : "Edit Sub Category"}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmit}>
              <label>
                Category (Form)
                <select
                  required
                  value={form.category_id}
                  onChange={(event) => setForm((current) => ({ ...current, category_id: event.target.value }))}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Sub Category Name
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
