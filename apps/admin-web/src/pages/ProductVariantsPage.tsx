import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import { createProductVariant, getProduct, listProductVariants } from "../lib/api";
import type { Product, ProductVariant, ProductVariantPayload, ProductVariantStatus } from "../lib/types";

type VariantFormState = {
  sku: string;
  barcode: string;
  status: ProductVariantStatus;
  current_price: string;
  current_stock: string;
  attributes: string;
};

const EMPTY_FORM: VariantFormState = {
  sku: "",
  barcode: "",
  status: "draft",
  current_price: "",
  current_stock: "",
  attributes: "ukuran:M;warna:Putih"
};

function parseAttributes(raw: string) {
  if (!raw.trim()) return [];

  return raw
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [name, ...valueParts] = entry.split(":");
      const value = valueParts.join(":").trim();
      return { name: name?.trim() ?? "", value: value || "" };
    })
    .filter((item) => item.name && item.value);
}

function toPayload(form: VariantFormState): ProductVariantPayload {
  return {
    sku: form.sku.trim(),
    barcode: form.barcode.trim(),
    status: form.status,
    current_price: Number(form.current_price || 0),
    current_stock: Number(form.current_stock || 0),
    attributes: parseAttributes(form.attributes)
  };
}

export function ProductVariantsPage() {
  const { token } = useAuth();
  const { productId } = useParams();

  const productIdNumber = useMemo(() => Number(productId), [productId]);
  const [product, setProduct] = useState<Product | null>(null);
  const [rows, setRows] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<VariantFormState>(EMPTY_FORM);

  function setApiError(err: unknown, fallback: string) {
    setError(err instanceof Error ? err.message : fallback);
  }

  async function refreshVariants() {
    if (!token || !Number.isFinite(productIdNumber)) return;

    const result = await listProductVariants(token, productIdNumber, { page: 1, per_page: 50 });
    setRows(result.items);
  }

  useEffect(() => {
    if (!token || !Number.isFinite(productIdNumber)) {
      setLoading(false);
      setError("Product is required.");
      return;
    }

    setLoading(true);
    setError(null);

    Promise.all([getProduct(token, productIdNumber), listProductVariants(token, productIdNumber, { page: 1, per_page: 50 })])
      .then(([nextProduct, nextVariants]) => {
        setProduct(nextProduct);
        setRows(nextVariants.items);
      })
      .catch((err) => setApiError(err, "Unable to load product variants."))
      .finally(() => setLoading(false));
  }, [token, productIdNumber]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !Number.isFinite(productIdNumber)) return;

    setBusy(true);
    setError(null);

    try {
      await createProductVariant(token, productIdNumber, toPayload(form));
      setForm(EMPTY_FORM);
      await refreshVariants();
    } catch (err) {
      setApiError(err, "Unable to create variant.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <h2>Product Variants</h2>
          {product ? <p>{product.product_name}</p> : null}
        </div>
      </div>

      <DataState loading={loading} error={error} empty={rows.length === 0 && !loading && !error} emptyLabel="No variants found for this product.">
        <div style={{ display: "grid", gap: 24 }}>
          <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 560 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              <label>
                <span>SKU</span>
                <input value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
              </label>
              <label>
                <span>Barcode</span>
                <input value={form.barcode} onChange={(event) => setForm((current) => ({ ...current, barcode: event.target.value }))} />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 12 }}>
              <label>
                <span>Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as ProductVariantStatus }))}
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                <span>Price</span>
                <input
                  type="number"
                  value={form.current_price}
                  onChange={(event) => setForm((current) => ({ ...current, current_price: event.target.value }))}
                />
              </label>
              <label>
                <span>Stock</span>
                <input
                  type="number"
                  value={form.current_stock}
                  onChange={(event) => setForm((current) => ({ ...current, current_stock: event.target.value }))}
                />
              </label>
            </div>

            <label>
              <span>Attributes</span>
              <input
                value={form.attributes}
                onChange={(event) => setForm((current) => ({ ...current, attributes: event.target.value }))}
              />
            </label>

            <button type="submit" disabled={busy}>
              {busy ? "Saving..." : "Create Variant"}
            </button>
          </form>

          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Attributes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.sku}</td>
                  <td>{variant.barcode}</td>
                  <td>{variant.status}</td>
                  <td>{variant.current_price}</td>
                  <td>{variant.current_stock}</td>
                  <td>{variant.attributes.map((attribute) => `${attribute.name}:${attribute.value}`).join("; ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>
    </div>
  );
}
