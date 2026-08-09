import { FormEvent, useEffect, useMemo, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  ApiError,
  activateProduct,
  createProduct,
  deactivateProduct,
  deleteProduct,
  deleteProductImage,
  getProduct,
  listCategories,
  listCompanies,
  listProductDepartments,
  listProductImages,
  listProductTypes,
  listProductsPage,
  listSubCategories,
  updateProduct,
  updateProductImage,
  uploadProductImage
} from "../lib/api";
import type {
  Company,
  PaginationMeta,
  ProductCategory,
  ProductDepartment,
  Product,
  ProductImage,
  ProductOrderBy,
  ProductSubCategory,
  ProductTaxonomyType,
  ProductPayload,
  ProductStatus,
  ProductUpdatePayload,
  SortDirection
} from "../lib/types";

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; productId: number };

type ProductFormState = {
  company_id: string;
  product_name: string;
  department_id: string;
  category_id: string;
  sub_category_id: string;
  product_type_id: string;
  short_description: string;
  description_text: string;
  status: ProductStatus;
};

type ImageFormState = {
  file: File | null;
  alt_text: string;
  is_cover: boolean;
};

const PRODUCT_SORT_FIELDS: ProductOrderBy[] = ["created_at", "product_name", "product_code", "status"];

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

const EMPTY_PRODUCT_FORM: ProductFormState = {
  company_id: "",
  product_name: "",
  department_id: "",
  category_id: "",
  sub_category_id: "",
  product_type_id: "",
  short_description: "",
  description_text: "",
  status: "draft"
};

const EMPTY_IMAGE_FORM: ImageFormState = {
  file: null,
  alt_text: "",
  is_cover: false
};

function richTextFromInput(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { type: "doc", content: [] };
  }

  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: trimmed
          }
        ]
      }
    ]
  };
}

function toCreatePayload(form: ProductFormState): ProductPayload {
  return {
    company_id: Number(form.company_id),
    product_name: form.product_name.trim(),
    department_id: Number(form.department_id),
    category_id: Number(form.category_id),
    sub_category_id: Number(form.sub_category_id),
    product_type_id: Number(form.product_type_id),
    short_description: form.short_description.trim(),
    description_richtext: richTextFromInput(form.description_text),
    status: form.status
  };
}

function toUpdatePayload(form: ProductFormState): ProductUpdatePayload {
  return {
    product_name: form.product_name.trim(),
    department_id: Number(form.department_id),
    category_id: Number(form.category_id),
    sub_category_id: Number(form.sub_category_id),
    product_type_id: Number(form.product_type_id),
    short_description: form.short_description.trim(),
    description_richtext: richTextFromInput(form.description_text),
    status: form.status
  };
}

function productToForm(product: Product): ProductFormState {
  return {
    company_id: String(product.company_id),
    product_name: product.product_name,
    department_id: String(product.department_id),
    category_id: String(product.category_id),
    sub_category_id: String(product.sub_category_id),
    product_type_id: String(product.product_type_id),
    short_description: product.short_description,
    description_text: product.description_text ?? "",
    status: product.status
  };
}

export function ProductsPage() {
  const { token } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [rows, setRows] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>(DEFAULT_PAGINATION_META);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<ProductOrderBy>("created_at");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [queryFilter, setQueryFilter] = useState("");
  const [appliedQuery, setAppliedQuery] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<ProductStatus | "">("");
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);
  const [productDepartments, setProductDepartments] = useState<ProductDepartment[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [subCategories, setSubCategories] = useState<ProductSubCategory[]>([]);
  const [productTypes, setProductTypes] = useState<ProductTaxonomyType[]>([]);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [imageRows, setImageRows] = useState<ProductImage[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [imageForm, setImageForm] = useState<ImageFormState>(EMPTY_IMAGE_FORM);

  const selectedProduct = useMemo(() => rows.find((row) => row.id === selectedProductId) ?? null, [rows, selectedProductId]);

  function setApiError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      setError(err.message || fallback);
      setErrorDetails(err.details ?? []);
      return;
    }

    setError((err as Error).message || fallback);
    setErrorDetails([]);
  }

  useEffect(() => {
    if (!token) return;

    Promise.all([listCompanies(token), listProductDepartments(token)])
      .then(([nextCompanies, nextProductDepartments]) => {
        setCompanies(nextCompanies);
        setProductDepartments(nextProductDepartments);

        setForm((current) => ({
          ...current,
          company_id: current.company_id || String(nextCompanies[0]?.id ?? ""),
          department_id: current.department_id || String(nextProductDepartments[0]?.id ?? "")
        }));
      })
      .catch((err) => setApiError(err, "Unable to load product form references."));
  }, [token]);

  useEffect(() => {
    if (!token || !form.department_id) {
      setCategories([]);
      setSubCategories([]);
      setProductTypes([]);
      return;
    }

    const departmentId = Number(form.department_id);
    if (Number.isNaN(departmentId)) return;

    listCategories(token, { department_id: departmentId })
      .then((items) => {
        setCategories(items);

        setForm((current) => {
          if (current.department_id !== String(departmentId)) return current;

          if (current.category_id && items.some((item) => String(item.id) === current.category_id)) {
            return current;
          }

          return {
            ...current,
            category_id: String(items[0]?.id ?? ""),
            sub_category_id: "",
            product_type_id: ""
          };
        });
      })
      .catch((err) => setApiError(err, "Unable to load categories."));
  }, [token, form.department_id]);

  useEffect(() => {
    if (!token || !form.category_id) {
      setSubCategories([]);
      setProductTypes([]);
      return;
    }

    const categoryId = Number(form.category_id);
    if (Number.isNaN(categoryId)) return;

    listSubCategories(token, { category_id: categoryId })
      .then((items) => {
        setSubCategories(items);

        setForm((current) => {
          if (current.category_id !== String(categoryId)) return current;

          if (current.sub_category_id && items.some((item) => String(item.id) === current.sub_category_id)) {
            return current;
          }

          return {
            ...current,
            sub_category_id: String(items[0]?.id ?? ""),
            product_type_id: ""
          };
        });
      })
      .catch((err) => setApiError(err, "Unable to load sub categories."));
  }, [token, form.category_id]);

  useEffect(() => {
    if (!token || !form.sub_category_id) {
      setProductTypes([]);
      return;
    }

    const subCategoryId = Number(form.sub_category_id);
    if (Number.isNaN(subCategoryId)) return;

    listProductTypes(token, { sub_category_id: subCategoryId })
      .then((items) => {
        setProductTypes(items);

        setForm((current) => {
          if (current.sub_category_id !== String(subCategoryId)) return current;

          if (current.product_type_id && items.some((item) => String(item.id) === current.product_type_id)) {
            return current;
          }

          return {
            ...current,
            product_type_id: String(items[0]?.id ?? "")
          };
        });
      })
      .catch((err) => setApiError(err, "Unable to load product types."));
  }, [token, form.sub_category_id]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setErrorDetails([]);

    listProductsPage(token, {
      page: currentPage,
      q: appliedQuery,
      status: statusFilter || undefined,
      order_by: sortBy,
      order_dir: sortDir
    })
      .then((result) => {
        setRows(result.items);
        setPagination(result.meta);
        setSelectedProductId((current) => {
          if (current && result.items.some((item) => item.id === current)) return current;
          return result.items[0]?.id ?? null;
        });
      })
      .catch((err) => setApiError(err, "Unable to load products."))
      .finally(() => setLoading(false));
  }, [token, currentPage, appliedQuery, statusFilter, sortBy, sortDir]);

  useEffect(() => {
    if (!token || !selectedProductId) {
      setImageRows([]);
      return;
    }

    setImageLoading(true);
    listProductImages(token, selectedProductId)
      .then(setImageRows)
      .catch((err) => setApiError(err, "Unable to load product images."))
      .finally(() => setImageLoading(false));
  }, [token, selectedProductId]);

  async function refreshProducts() {
    if (!token) return;

    const result = await listProductsPage(token, {
      page: currentPage,
      q: appliedQuery,
      status: statusFilter || undefined,
      order_by: sortBy,
      order_dir: sortDir
    });

    setRows(result.items);
    setPagination(result.meta);
  }

  async function refreshImages() {
    if (!token || !selectedProductId) return;
    const images = await listProductImages(token, selectedProductId);
    setImageRows(images);
  }

  function applyQuery() {
    setCurrentPage(1);
    setAppliedQuery(queryFilter.trim() || undefined);
  }

  function resetFilters() {
    setCurrentPage(1);
    setQueryFilter("");
    setAppliedQuery(undefined);
    setStatusFilter("");
    setSortBy("created_at");
    setSortDir("desc");
  }

  function openCreate() {
    setError(null);
    setErrorDetails([]);
    setForm((current) => ({
      ...EMPTY_PRODUCT_FORM,
      company_id: current.company_id || String(companies[0]?.id ?? ""),
      department_id: current.department_id || String(productDepartments[0]?.id ?? ""),
      category_id: String(categories[0]?.id ?? ""),
      sub_category_id: String(subCategories[0]?.id ?? ""),
      product_type_id: String(productTypes[0]?.id ?? "")
    }));
    setDrawer({ mode: "create" });
  }

  async function openEdit(productId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      const product = await getProduct(token, productId);
      setForm(productToForm(product));
      setDrawer({ mode: "edit", productId });
      setSelectedProductId(productId);
    } catch (err) {
      setApiError(err, "Unable to load product.");
    } finally {
      setBusy(false);
    }
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    setForm((current) => ({
      ...EMPTY_PRODUCT_FORM,
      company_id: current.company_id || String(companies[0]?.id ?? ""),
      department_id: current.department_id || String(productDepartments[0]?.id ?? ""),
      category_id: String(categories[0]?.id ?? ""),
      sub_category_id: String(subCategories[0]?.id ?? ""),
      product_type_id: String(productTypes[0]?.id ?? "")
    }));
  }

  async function onSubmitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      if (drawer.mode === "create") {
        const created = await createProduct(token, toCreatePayload(form));
        await refreshProducts();
        setSelectedProductId(created.id);
      }

      if (drawer.mode === "edit") {
        await updateProduct(token, drawer.productId, toUpdatePayload(form));
        await refreshProducts();
        setSelectedProductId(drawer.productId);
      }

      closeDrawer();
    } catch (err) {
      setApiError(err, "Unable to save product.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteProduct(productId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this product?")) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await deleteProduct(token, productId);
      await refreshProducts();
    } catch (err) {
      setApiError(err, "Unable to delete product.");
    } finally {
      setBusy(false);
    }
  }

  async function onActivateProduct(productId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await activateProduct(token, productId);
      await refreshProducts();
    } catch (err) {
      setApiError(err, "Unable to activate product.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeactivateProduct(productId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await deactivateProduct(token, productId);
      await refreshProducts();
    } catch (err) {
      setApiError(err, "Unable to deactivate product.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedProductId || !imageForm.file) return;

    setImageBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await uploadProductImage(token, selectedProductId, {
        image: imageForm.file,
        alt_text: imageForm.alt_text.trim() || undefined,
        is_cover: imageForm.is_cover
      });
      setImageForm(EMPTY_IMAGE_FORM);
      await refreshImages();
      await refreshProducts();
    } catch (err) {
      setApiError(err, "Unable to upload image.");
    } finally {
      setImageBusy(false);
    }
  }

  async function onSetCover(imageId: number) {
    if (!token || !selectedProductId) return;

    setImageBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await updateProductImage(token, selectedProductId, imageId, { is_cover: true });
      await refreshImages();
    } catch (err) {
      setApiError(err, "Unable to set cover image.");
    } finally {
      setImageBusy(false);
    }
  }

  async function onDeleteImage(imageId: number) {
    if (!token || !selectedProductId) return;
    if (!window.confirm("Delete this product image?")) return;

    setImageBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await deleteProductImage(token, selectedProductId, imageId);
      await refreshImages();
      await refreshProducts();
    } catch (err) {
      setApiError(err, "Unable to delete product image.");
    } finally {
      setImageBusy(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Products</h2>
          <p>Manage product SPU, lifecycle, and gallery images.</p>
        </div>
        <button className="primary" type="button" onClick={openCreate} disabled={busy || loading}>
          Add Product
        </button>
      </div>

      {errorDetails.length > 0 ? (
        <div className="card">
          <p className="state error">{error}</p>
          <ul className="list">
            {errorDetails.map((detail, index) => (
              <li key={`${detail}-${index}`}>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="card inline-form">
        <label>
          Search
          <input
            value={queryFilter}
            onChange={(event) => setQueryFilter(event.target.value)}
            placeholder="Code or product name"
          />
        </label>
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProductStatus | "")}>
            <option value="">all</option>
            <option value="draft">draft</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
        </label>
        <label>
          Sort By
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value as ProductOrderBy)}>
            {PRODUCT_SORT_FIELDS.map((field) => (
              <option key={field} value={field}>
                {field}
              </option>
            ))}
          </select>
        </label>
        <label>
          Direction
          <select value={sortDir} onChange={(event) => setSortDir(event.target.value as SortDirection)}>
            <option value="asc">asc</option>
            <option value="desc">desc</option>
          </select>
        </label>
        <button className="primary" type="button" onClick={applyQuery} disabled={busy || loading}>
          Apply
        </button>
        <button className="ghost" type="button" onClick={resetFilters} disabled={busy || loading}>
          Reset
        </button>
      </div>

      <DataState loading={loading} error={errorDetails.length === 0 ? error : null} empty={rows.length === 0} emptyLabel="No products found.">
        <div className="actions" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <span>
            Page {pagination.page} of {Math.max(pagination.total_pages, 1)} ({pagination.total_count} total)
          </span>
          <div className="actions">
            <button className="ghost" type="button" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={busy || loading || currentPage <= 1}>
              Previous
            </button>
            <button
              className="ghost"
              type="button"
              onClick={() => setCurrentPage((page) => (pagination.total_pages <= 0 ? page : Math.min(pagination.total_pages, page + 1)))}
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
              <th>Status</th>
              <th>Company</th>
              <th>Images</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.product_code}</td>
                <td>{row.product_name}</td>
                <td>{row.status}</td>
                <td>{companies.find((company) => company.id === row.company_id)?.name ?? row.company_id}</td>
                <td>{row.images_count}</td>
                <td className="actions">
                  <button className="ghost" type="button" onClick={() => setSelectedProductId(row.id)} disabled={busy || loading}>
                    Images
                  </button>
                  <button className="ghost" type="button" onClick={() => void openEdit(row.id)} disabled={busy || loading}>
                    Edit
                  </button>
                  {row.status !== "active" ? (
                    <button className="primary" type="button" onClick={() => void onActivateProduct(row.id)} disabled={busy || loading}>
                      Activate
                    </button>
                  ) : (
                    <button className="ghost" type="button" onClick={() => void onDeactivateProduct(row.id)} disabled={busy || loading}>
                      Deactivate
                    </button>
                  )}
                  <button className="danger" type="button" onClick={() => void onDeleteProduct(row.id)} disabled={busy || loading}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>

      <article className="card">
        <div className="page-head">
          <h3>Product Images</h3>
          {selectedProduct ? <span className="pill">{selectedProduct.product_name}</span> : null}
        </div>

        {!selectedProduct ? <p className="state">Select a product to manage images.</p> : null}

        {selectedProduct ? (
          <>
            <DataState loading={imageLoading} error={null} empty={imageRows.length === 0} emptyLabel="No images yet.">
              <table>
                <thead>
                  <tr>
                    <th>Preview</th>
                    <th>Alt Text</th>
                    <th>Position</th>
                    <th>Cover</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {imageRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        {row.image_url ? (
                          <img src={row.image_url} alt={row.alt_text ?? "product image"} style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8 }} />
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{row.alt_text ?? "-"}</td>
                      <td>{row.position}</td>
                      <td>{row.is_cover ? "yes" : "no"}</td>
                      <td className="actions">
                        {!row.is_cover ? (
                          <button className="ghost" type="button" onClick={() => void onSetCover(row.id)} disabled={imageBusy}>
                            Set Cover
                          </button>
                        ) : null}
                        <button className="danger" type="button" onClick={() => void onDeleteImage(row.id)} disabled={imageBusy}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataState>

            <form className="form-grid" onSubmit={onSubmitImage}>
              <label className="span-2">
                Image
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  onChange={(event) => setImageForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
                  required
                />
              </label>
              <label>
                Alt Text
                <input
                  value={imageForm.alt_text}
                  onChange={(event) => setImageForm((current) => ({ ...current, alt_text: event.target.value }))}
                />
              </label>
              <label>
                Is Cover
                <select
                  value={imageForm.is_cover ? "yes" : "no"}
                  onChange={(event) => setImageForm((current) => ({ ...current, is_cover: event.target.value === "yes" }))}
                >
                  <option value="no">no</option>
                  <option value="yes">yes</option>
                </select>
              </label>
              <div className="actions span-2">
                <button className="primary" type="submit" disabled={imageBusy || !imageForm.file}>
                  {imageBusy ? "Uploading..." : "Upload"}
                </button>
                <button className="ghost" type="button" onClick={() => setImageForm(EMPTY_IMAGE_FORM)} disabled={imageBusy}>
                  Reset
                </button>
              </div>
            </form>
          </>
        ) : null}
      </article>

      {drawer.mode !== "none" ? (
        <div className="overlay" onClick={closeDrawer}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-head">
              <h3>{drawer.mode === "create" ? "Create Product" : "Edit Product"}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmitProduct}>
              <label>
                Company
                <select
                  value={form.company_id}
                  onChange={(event) => setForm((current) => ({ ...current, company_id: event.target.value }))}
                  disabled={drawer.mode === "edit"}
                  required
                >
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Product Name
                <input
                  required
                  value={form.product_name}
                  onChange={(event) => setForm((current) => ({ ...current, product_name: event.target.value }))}
                />
              </label>

              <label>
                Product Department
                <select
                  required
                  value={form.department_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      department_id: event.target.value,
                      category_id: "",
                      sub_category_id: "",
                      product_type_id: ""
                    }))
                  }
                >
                  <option value="" disabled>
                    Select department
                  </option>
                  {productDepartments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.code} - {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Category
                <select
                  required
                  value={form.category_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      category_id: event.target.value,
                      sub_category_id: "",
                      product_type_id: ""
                    }))
                  }
                  disabled={!form.department_id || categories.length === 0}
                >
                  <option value="" disabled>
                    Select category
                  </option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Sub Category
                <select
                  required
                  value={form.sub_category_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sub_category_id: event.target.value,
                      product_type_id: ""
                    }))
                  }
                  disabled={!form.category_id || subCategories.length === 0}
                >
                  <option value="" disabled>
                    Select sub category
                  </option>
                  {subCategories.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Product Type
                <select
                  required
                  value={form.product_type_id}
                  onChange={(event) => setForm((current) => ({ ...current, product_type_id: event.target.value }))}
                  disabled={!form.sub_category_id || productTypes.length === 0}
                >
                  <option value="" disabled>
                    Select product type
                  </option>
                  {productTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="span-2">
                Short Description
                <textarea
                  required
                  rows={2}
                  value={form.short_description}
                  onChange={(event) => setForm((current) => ({ ...current, short_description: event.target.value }))}
                />
              </label>

              <label className="span-2">
                Description (text)
                <textarea
                  rows={4}
                  value={form.description_text}
                  onChange={(event) => setForm((current) => ({ ...current, description_text: event.target.value }))}
                />
              </label>

              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductStatus }))}
                >
                  <option value="draft">draft</option>
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
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
          </div>
        </div>
      ) : null}
    </section>
  );
}
