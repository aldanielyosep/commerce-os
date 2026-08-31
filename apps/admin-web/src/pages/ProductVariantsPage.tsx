import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  createProductVariant,
  deleteProductVariant,
  getProduct,
  listProductVariants,
  updateProductVariant,
  updateProductVariantPrice,
  updateProductVariantStock
} from "../lib/api";
import { formatDecimal, formatInteger, parseFormattedNumber } from "../lib/numberFormat";
import type { Product, ProductVariant, ProductVariantPayload, ProductVariantStatus } from "../lib/types";

type VariantFormState = {
  sku: string;
  barcode: string;
  status: ProductVariantStatus;
  current_price: string;
  current_stock: string;
  attributes: string;
};

type PriceFormState = {
  value: string;
  effective_from: string;
  reason: string;
};

type StockFormState = {
  delta: string;
  event_type: string;
  reason: string;
};

type DrawerState = { mode: "none" } | { mode: "create" } | { mode: "edit"; variantId: number };

const EMPTY_FORM: VariantFormState = {
  sku: "",
  barcode: "",
  status: "draft",
  current_price: "",
  current_stock: "",
  attributes: "ukuran:M;warna:Putih"
};

const EMPTY_PRICE_FORM: PriceFormState = {
  value: "",
  effective_from: new Date().toISOString().slice(0, 16),
  reason: ""
};

const EMPTY_STOCK_FORM: StockFormState = {
  delta: "",
  event_type: "restock",
  reason: ""
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

function attributesToString(attributes: { name: string; value: string }[] = []) {
  return attributes.map((attribute) => `${attribute.name}:${attribute.value}`).join(";");
}

function toPayload(form: VariantFormState): ProductVariantPayload {
  return {
    sku: form.sku.trim(),
    barcode: form.barcode.trim(),
    status: form.status,
    current_price: parseFormattedNumber(form.current_price),
    current_stock: Math.trunc(parseFormattedNumber(form.current_stock)),
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
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<VariantFormState>(EMPTY_FORM);
  const [priceForm, setPriceForm] = useState<PriceFormState>(EMPTY_PRICE_FORM);
  const [stockForm, setStockForm] = useState<StockFormState>(EMPTY_STOCK_FORM);

  function setApiError(err: unknown, fallback: string) {
    setError(err instanceof Error ? err.message : fallback);
  }

  function resetDrawer() {
    setDrawer({ mode: "none" });
    setForm(EMPTY_FORM);
  }

  function openCreate() {
    setDrawer({ mode: "create" });
    setForm(EMPTY_FORM);
  }

  function openEdit(variant: ProductVariant) {
    setDrawer({ mode: "edit", variantId: variant.id });
    setForm({
      sku: variant.sku,
      barcode: variant.barcode,
      status: variant.status,
      current_price: formatDecimal(variant.current_price),
      current_stock: formatInteger(variant.current_stock),
      attributes: attributesToString(variant.attributes)
    });
    setPriceForm({
      value: formatDecimal(variant.current_price),
      effective_from: new Date().toISOString().slice(0, 16),
      reason: ""
    });
    setStockForm({
      delta: "",
      event_type: "restock",
      reason: ""
    });
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
      if (drawer.mode === "create") {
        await createProductVariant(token, productIdNumber, toPayload(form));
      }

      if (drawer.mode === "edit") {
        await updateProductVariant(token, productIdNumber, drawer.variantId, {
          sku: form.sku.trim(),
          barcode: form.barcode.trim(),
          status: form.status,
          current_price: parseFormattedNumber(form.current_price),
          current_stock: Math.trunc(parseFormattedNumber(form.current_stock)),
          attributes: parseAttributes(form.attributes)
        });
      }

      setForm(EMPTY_FORM);
      setDrawer({ mode: "none" });
      await refreshVariants();
    } catch (err) {
      setApiError(err, drawer.mode === "create" ? "Unable to create variant." : "Unable to update variant.");
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(variantId: number) {
    if (!token || !Number.isFinite(productIdNumber)) return;
    if (!window.confirm("Delete this variant?")) return;

    setBusy(true);
    setError(null);

    try {
      await deleteProductVariant(token, productIdNumber, variantId);
      await refreshVariants();
    } catch (err) {
      setApiError(err, "Unable to delete variant.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitPrice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !Number.isFinite(productIdNumber) || drawer.mode !== "edit") return;

    setBusy(true);
    setError(null);

    try {
      await updateProductVariantPrice(token, productIdNumber, drawer.variantId, {
        value: parseFormattedNumber(priceForm.value),
        effective_from: priceForm.effective_from ? new Date(priceForm.effective_from).toISOString() : new Date().toISOString(),
        reason: priceForm.reason.trim() || undefined
      });
      await refreshVariants();
      const currentVariant = rows.find((item) => item.id === drawer.variantId) ?? null;
      if (currentVariant) {
        setPriceForm({
          value: formatDecimal(currentVariant.current_price),
          effective_from: new Date().toISOString().slice(0, 16),
          reason: ""
        });
      }
    } catch (err) {
      setApiError(err, "Unable to update price.");
    } finally {
      setBusy(false);
    }
  }

  async function onSubmitStock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !Number.isFinite(productIdNumber) || drawer.mode !== "edit") return;

    setBusy(true);
    setError(null);

    try {
      await updateProductVariantStock(token, productIdNumber, drawer.variantId, {
        delta: Math.trunc(parseFormattedNumber(stockForm.delta)),
        event_type: stockForm.event_type,
        reason: stockForm.reason.trim() || undefined
      });
      await refreshVariants();
      setStockForm({ delta: "", event_type: "restock", reason: "" });
    } catch (err) {
      setApiError(err, "Unable to update stock.");
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
        <button type="button" className="primary" onClick={openCreate} disabled={busy || loading}>
          Add Variant
        </button>
      </div>

      {error ? <p className="state error">{error}</p> : null}

      <DataState
        loading={loading}
        error={error}
        empty={rows.length === 0 && !loading && !error}
        emptyLabel="No variants found for this product."
      >
        <div style={{ display: "grid", gap: 24 }}>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Barcode</th>
                <th>Status</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Attributes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((variant) => (
                <tr key={variant.id}>
                  <td>{variant.sku}</td>
                  <td>{variant.barcode}</td>
                  <td>{variant.status}</td>
                  <td>{formatDecimal(variant.current_price)}</td>
                  <td>{formatInteger(variant.current_stock)}</td>
                  <td>{variant.attributes.map((attribute) => `${attribute.name}:${attribute.value}`).join("; ")}</td>
                  <td className="actions">
                    <button type="button" className="ghost" onClick={() => openEdit(variant)}>
                      Edit
                    </button>
                    <button type="button" className="danger" onClick={() => void onDelete(variant.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataState>

      {drawer.mode !== "none" ? (
        <div className="overlay" onClick={resetDrawer}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="page-head">
              <h3>{drawer.mode === "create" ? "Create Variant" : "Edit Variant"}</h3>
              <button type="button" className="ghost" onClick={resetDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
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
                    inputMode="decimal"
                    value={form.current_price}
                    onChange={(event) => setForm((current) => ({ ...current, current_price: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Stock</span>
                  <input
                    inputMode="numeric"
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

              <button type="submit" className="primary" disabled={busy}>
                {busy ? "Saving..." : drawer.mode === "create" ? "Create Variant" : "Save Changes"}
              </button>
            </form>

            {drawer.mode === "edit" ? (
              <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
                <form onSubmit={onSubmitPrice} style={{ display: "grid", gap: 8 }}>
                  <strong>Price History</strong>
                  <input
                    inputMode="decimal"
                    value={priceForm.value}
                    onChange={(event) => setPriceForm((current) => ({ ...current, value: event.target.value }))}
                    placeholder="Price"
                  />
                  <input
                    type="datetime-local"
                    value={priceForm.effective_from}
                    onChange={(event) => setPriceForm((current) => ({ ...current, effective_from: event.target.value }))}
                  />
                  <input
                    value={priceForm.reason}
                    onChange={(event) => setPriceForm((current) => ({ ...current, reason: event.target.value }))}
                    placeholder="Reason"
                  />
                  <button type="submit" className="primary" disabled={busy}>
                    Update Price
                  </button>
                </form>

                <form onSubmit={onSubmitStock} style={{ display: "grid", gap: 8 }}>
                  <strong>Stock Ledger</strong>
                  <input
                    inputMode="numeric"
                    value={stockForm.delta}
                    onChange={(event) => setStockForm((current) => ({ ...current, delta: event.target.value }))}
                    placeholder="Delta"
                  />
                  <select
                    value={stockForm.event_type}
                    onChange={(event) => setStockForm((current) => ({ ...current, event_type: event.target.value }))}
                  >
                    <option value="restock">Restock</option>
                    <option value="sale">Sale</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                  <input
                    value={stockForm.reason}
                    onChange={(event) => setStockForm((current) => ({ ...current, reason: event.target.value }))}
                    placeholder="Reason"
                  />
                  <button type="submit" className="primary" disabled={busy}>
                    Update Stock
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
