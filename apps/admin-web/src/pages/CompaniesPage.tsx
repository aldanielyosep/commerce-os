import { FormEvent, useEffect, useMemo, useState } from "react";
import { CoordinateMapPicker } from "../components/CoordinateMapPicker";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  API_BASE_URL,
  ApiError,
  createCompany,
  createCompanyMarketplaceLink,
  deleteCompany,
  deleteCompanyMarketplaceLink,
  getCompany,
  listCompanies,
  listCompanyMarketplaceLinks,
  updateCompany,
  updateCompanyMarketplaceLink
} from "../lib/api";
import type {
  Company,
  CompanyMarketplace,
  CompanyMarketplaceLink,
  CompanyPayload,
  CompanyStatus,
  CompanyType
} from "../lib/types";

const MARKETPLACE_OPTIONS: CompanyMarketplace[] = [
  "shopee",
  "tokopedia",
  "tiktok_shop",
  "lazada",
  "blibli",
  "shopify",
  "website"
];

type DrawerState =
  | { mode: "none" }
  | { mode: "create" }
  | { mode: "edit"; companyId: number };

type CompanyFormState = {
  code: string;
  name: string;
  owner_name: string;
  company_type: CompanyType;
  email: string;
  phone: string;
  website: string;
  description: string;
  address: string;
  province: string;
  city: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  status: CompanyStatus;
  company_registration_number: string;
  nib: string;
  siup: string;
  deed_number: string;
  pkp_number: string;
  logo: File | null;
  remove_logo: boolean;
};

type MarketplaceFormState = {
  id: number | null;
  marketplace: CompanyMarketplace;
  store_name: string;
  store_url: string;
  is_active: boolean;
};

const EMPTY_COMPANY_FORM: CompanyFormState = {
  code: "",
  name: "",
  owner_name: "",
  company_type: "individual",
  email: "",
  phone: "",
  website: "",
  description: "",
  address: "",
  province: "",
  city: "",
  postal_code: "",
  latitude: "",
  longitude: "",
  status: "active",
  company_registration_number: "",
  nib: "",
  siup: "",
  deed_number: "",
  pkp_number: "",
  logo: null,
  remove_logo: false
};

const EMPTY_MARKETPLACE_FORM: MarketplaceFormState = {
  id: null,
  marketplace: "shopee",
  store_name: "",
  store_url: "",
  is_active: true
};

function companyToForm(company: Company): CompanyFormState {
  return {
    code: company.code,
    name: company.name,
    owner_name: company.owner_name,
    company_type: company.company_type,
    email: company.email,
    phone: company.phone,
    website: company.website ?? "",
    description: company.description ?? "",
    address: company.address ?? "",
    province: company.province ?? "",
    city: company.city ?? "",
    postal_code: company.postal_code ?? "",
    latitude: company.latitude == null ? "" : String(company.latitude),
    longitude: company.longitude == null ? "" : String(company.longitude),
    status: company.status,
    company_registration_number: company.company_registration_number ?? "",
    nib: company.nib ?? "",
    siup: company.siup ?? "",
    deed_number: company.deed_number ?? "",
    pkp_number: company.pkp_number ?? "",
    logo: null,
    remove_logo: false
  };
}

function cleanOptional(value: string): string | undefined {
  const next = value.trim();
  return next.length > 0 ? next : undefined;
}

function buildCompanyPayload(form: CompanyFormState): CompanyPayload {
  const payload: CompanyPayload = {
    code: form.code.trim(),
    name: form.name.trim(),
    owner_name: form.owner_name.trim(),
    company_type: form.company_type,
    email: form.email.trim(),
    phone: form.phone.trim(),
    status: form.status
  };

  payload.website = cleanOptional(form.website);
  payload.description = cleanOptional(form.description);
  payload.address = cleanOptional(form.address);
  payload.province = cleanOptional(form.province);
  payload.city = cleanOptional(form.city);
  payload.postal_code = cleanOptional(form.postal_code);
  payload.company_registration_number = cleanOptional(form.company_registration_number);
  payload.nib = cleanOptional(form.nib);
  payload.siup = cleanOptional(form.siup);
  payload.deed_number = cleanOptional(form.deed_number);
  payload.pkp_number = cleanOptional(form.pkp_number);

  if (form.latitude.trim().length > 0) payload.latitude = Number(form.latitude);
  if (form.longitude.trim().length > 0) payload.longitude = Number(form.longitude);

  if (form.company_type === "individual") {
    payload.company_registration_number = undefined;
    payload.nib = undefined;
    payload.siup = undefined;
    payload.deed_number = undefined;
    payload.pkp_number = undefined;
  }

  return payload;
}

function marketplaceToForm(link: CompanyMarketplaceLink): MarketplaceFormState {
  return {
    id: link.id,
    marketplace: link.marketplace,
    store_name: link.store_name,
    store_url: link.store_url,
    is_active: link.is_active
  };
}

function resolveLogoPreviewUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path}`;
}

export function CompaniesPage() {
  const { token } = useAuth();

  const [rows, setRows] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [drawer, setDrawer] = useState<DrawerState>({ mode: "none" });
  const [form, setForm] = useState<CompanyFormState>(EMPTY_COMPANY_FORM);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedLogoPreviewUrl, setSelectedLogoPreviewUrl] = useState<string | null>(null);

  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [marketplaceRows, setMarketplaceRows] = useState<CompanyMarketplaceLink[]>([]);
  const [marketplaceLoading, setMarketplaceLoading] = useState(false);
  const [marketplaceBusy, setMarketplaceBusy] = useState(false);
  const [marketplaceForm, setMarketplaceForm] = useState<MarketplaceFormState>(EMPTY_MARKETPLACE_FORM);

  const selectedCompany = useMemo(
    () => rows.find((row) => row.id === selectedCompanyId) ?? null,
    [rows, selectedCompanyId]
  );

  useEffect(() => {
    if (!form.logo) {
      setSelectedLogoPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(form.logo);
    setSelectedLogoPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [form.logo]);

  useEffect(() => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setErrorDetails([]);

    listCompanies(token)
      .then((companies) => {
        setRows(companies);
        setSelectedCompanyId((current) => current ?? companies[0]?.id ?? null);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!token || !selectedCompanyId) {
      setMarketplaceRows([]);
      return;
    }

    setMarketplaceLoading(true);

    listCompanyMarketplaceLinks(token, selectedCompanyId)
      .then(setMarketplaceRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setMarketplaceLoading(false));
  }, [token, selectedCompanyId]);

  async function refreshCompanies() {
    if (!token) return;

    const companies = await listCompanies(token);
    setRows(companies);

    if (selectedCompanyId && !companies.some((company) => company.id === selectedCompanyId)) {
      setSelectedCompanyId(companies[0]?.id ?? null);
    }
  }

  async function refreshMarketplaceLinks(companyId: number) {
    if (!token) return;

    const links = await listCompanyMarketplaceLinks(token, companyId);
    setMarketplaceRows(links);
  }

  function resetCompanyForm() {
    setForm(EMPTY_COMPANY_FORM);
    setEditingCompany(null);
  }

  function closeDrawer() {
    setDrawer({ mode: "none" });
    resetCompanyForm();
  }

  function openCreate() {
    setError(null);
    setErrorDetails([]);
    resetCompanyForm();
    setDrawer({ mode: "create" });
  }

  async function openEdit(companyId: number) {
    if (!token) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      const company = await getCompany(token, companyId);
      setForm(companyToForm(company));
      setEditingCompany(company);
      setDrawer({ mode: "edit", companyId });
      setSelectedCompanyId(companyId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function setApiError(err: unknown, fallbackMessage: string) {
    if (err instanceof ApiError) {
      setError(err.message || fallbackMessage);
      setErrorDetails(err.details ?? []);
      return;
    }

    setError((err as Error).message || fallbackMessage);
    setErrorDetails([]);
  }

  function onCompanyTypeChange(nextType: CompanyType) {
    setForm((current) => {
      if (nextType !== "individual") {
        return { ...current, company_type: nextType };
      }

      return {
        ...current,
        company_type: nextType,
        company_registration_number: "",
        nib: "",
        siup: "",
        deed_number: "",
        pkp_number: ""
      };
    });
  }

  async function onSubmitCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;

    if (form.remove_logo && form.logo) {
      setError("Cannot upload logo and remove logo in the same request.");
      setErrorDetails([]);
      return;
    }

    if (form.company_type !== "individual") {
      if (!form.company_registration_number.trim() || !form.nib.trim()) {
        setError("Company registration number and NIB are required for CV/PT companies.");
        setErrorDetails([]);
        return;
      }
    }

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      const payload = buildCompanyPayload(form);
      const options = {
        logo: form.logo ?? undefined,
        remove_logo: form.remove_logo || undefined
      };

      if (drawer.mode === "create") {
        const created = await createCompany(token, payload, options);
        await refreshCompanies();
        setSelectedCompanyId(created.id);
      }

      if (drawer.mode === "edit") {
        await updateCompany(token, drawer.companyId, payload, options);
        await refreshCompanies();
        setSelectedCompanyId(drawer.companyId);
      }

      closeDrawer();
    } catch (err) {
      setApiError(err, "Unable to save company.");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCompany(companyId: number) {
    if (!token) return;
    if (!window.confirm("Soft delete this company?")) return;

    setBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await deleteCompany(token, companyId);
      await refreshCompanies();
    } catch (err) {
      setApiError(err, "Unable to delete company.");
    } finally {
      setBusy(false);
    }
  }

  function resetMarketplaceForm() {
    setMarketplaceForm(EMPTY_MARKETPLACE_FORM);
  }

  async function onSubmitMarketplace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedCompanyId) return;

    if (!marketplaceForm.id) {
      const duplicate = marketplaceRows.some((row) => row.marketplace === marketplaceForm.marketplace);
      if (duplicate) {
        setError("Marketplace already exists for this company.");
        setErrorDetails([]);
        return;
      }
    }

    setMarketplaceBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      if (marketplaceForm.id) {
        await updateCompanyMarketplaceLink(token, selectedCompanyId, marketplaceForm.id, {
          store_name: marketplaceForm.store_name.trim(),
          store_url: marketplaceForm.store_url.trim(),
          is_active: marketplaceForm.is_active
        });
      } else {
        await createCompanyMarketplaceLink(token, selectedCompanyId, {
          marketplace: marketplaceForm.marketplace,
          store_name: marketplaceForm.store_name.trim(),
          store_url: marketplaceForm.store_url.trim(),
          is_active: marketplaceForm.is_active
        });
      }

      await refreshMarketplaceLinks(selectedCompanyId);
      await refreshCompanies();
      resetMarketplaceForm();
    } catch (err) {
      setApiError(err, "Unable to save marketplace link.");
    } finally {
      setMarketplaceBusy(false);
    }
  }

  async function onDeleteMarketplaceLink(linkId: number) {
    if (!token || !selectedCompanyId) return;
    if (!window.confirm("Delete this marketplace link?")) return;

    setMarketplaceBusy(true);
    setError(null);
    setErrorDetails([]);

    try {
      await deleteCompanyMarketplaceLink(token, selectedCompanyId, linkId);
      await refreshMarketplaceLinks(selectedCompanyId);
      await refreshCompanies();
      if (marketplaceForm.id === linkId) {
        resetMarketplaceForm();
      }
    } catch (err) {
      setApiError(err, "Unable to delete marketplace link.");
    } finally {
      setMarketplaceBusy(false);
    }
  }

  const actionDisabled = loading || busy;
  const showBusinessFields = form.company_type !== "individual";
  const formTitle = drawer.mode === "create" ? "Create Company" : "Edit Company";
  const latitudeValue = form.latitude.trim().length > 0 ? Number(form.latitude) : null;
  const longitudeValue = form.longitude.trim().length > 0 ? Number(form.longitude) : null;
  const existingLogoPath = editingCompany?.logo_url ?? null;
  const existingLogoUrl =
    existingLogoPath && !form.remove_logo ? resolveLogoPreviewUrl(existingLogoPath) : null;

  return (
    <section>
      <div className="page-head">
        <div>
          <h2>Companies</h2>
          <p>Manage companies, logo, and marketplace links.</p>
        </div>
        <button className="primary" type="button" onClick={openCreate} disabled={actionDisabled}>
          Add Company
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

      <DataState loading={loading} error={errorDetails.length === 0 ? error : null} empty={rows.length === 0} emptyLabel="No companies found.">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Owner</th>
              <th>Type</th>
              <th>Status</th>
              <th>City</th>
              <th>Website</th>
              <th>Logo</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.code}</td>
                <td>{row.name}</td>
                <td>{row.owner_name}</td>
                <td>{row.company_type}</td>
                <td>{row.status}</td>
                <td>{row.city ?? "-"}</td>
                <td>{row.website ?? "-"}</td>
                <td>{row.logo_url ? "Yes" : "No"}</td>
                <td className="actions">
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => setSelectedCompanyId(row.id)}
                    disabled={actionDisabled}
                  >
                    Select
                  </button>
                  <button className="ghost" type="button" onClick={() => void openEdit(row.id)} disabled={actionDisabled}>
                    Edit
                  </button>
                  <button
                    className="danger"
                    type="button"
                    onClick={() => void onDeleteCompany(row.id)}
                    disabled={actionDisabled}
                  >
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
          <h3>Marketplace Links</h3>
          {selectedCompany ? <span className="pill">{selectedCompany.name}</span> : null}
        </div>

        {!selectedCompany ? <p className="state">Select a company to manage marketplace links.</p> : null}

        {selectedCompany ? (
          <>
            <DataState
              loading={marketplaceLoading}
              error={null}
              empty={marketplaceRows.length === 0}
              emptyLabel="No marketplace links yet."
            >
              <table>
                <thead>
                  <tr>
                    <th>Marketplace</th>
                    <th>Store Name</th>
                    <th>Store URL</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {marketplaceRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.marketplace}</td>
                      <td>{row.store_name}</td>
                      <td>{row.store_url}</td>
                      <td>{row.is_active ? "yes" : "no"}</td>
                      <td className="actions">
                        <button
                          className="ghost"
                          type="button"
                          onClick={() => setMarketplaceForm(marketplaceToForm(row))}
                          disabled={marketplaceBusy}
                        >
                          Edit
                        </button>
                        <button
                          className="danger"
                          type="button"
                          onClick={() => void onDeleteMarketplaceLink(row.id)}
                          disabled={marketplaceBusy}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataState>

            <form className="form-grid" onSubmit={onSubmitMarketplace}>
              <label>
                Marketplace
                <select
                  value={marketplaceForm.marketplace}
                  onChange={(event) =>
                    setMarketplaceForm((current) => ({
                      ...current,
                      marketplace: event.target.value as CompanyMarketplace
                    }))
                  }
                  disabled={marketplaceBusy || marketplaceForm.id !== null}
                >
                  {MARKETPLACE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Store Name
                <input
                  required
                  value={marketplaceForm.store_name}
                  onChange={(event) =>
                    setMarketplaceForm((current) => ({ ...current, store_name: event.target.value }))
                  }
                />
              </label>

              <label className="span-2">
                Store URL
                <input
                  required
                  type="url"
                  placeholder="https://"
                  value={marketplaceForm.store_url}
                  onChange={(event) =>
                    setMarketplaceForm((current) => ({ ...current, store_url: event.target.value }))
                  }
                />
              </label>

              <label>
                Active
                <select
                  value={marketplaceForm.is_active ? "true" : "false"}
                  onChange={(event) =>
                    setMarketplaceForm((current) => ({ ...current, is_active: event.target.value === "true" }))
                  }
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </label>

              <div className="actions span-2">
                <button className="primary" type="submit" disabled={marketplaceBusy}>
                  {marketplaceBusy ? "Saving..." : marketplaceForm.id ? "Update Link" : "Add Link"}
                </button>
                <button
                  className="ghost"
                  type="button"
                  onClick={resetMarketplaceForm}
                  disabled={marketplaceBusy}
                >
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
              <h3>{formTitle}</h3>
              <button className="ghost" type="button" onClick={closeDrawer} disabled={busy}>
                Close
              </button>
            </div>

            <form className="form-grid" onSubmit={onSubmitCompany}>
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
              <label>
                Owner Name
                <input
                  required
                  value={form.owner_name}
                  onChange={(event) => setForm((current) => ({ ...current, owner_name: event.target.value }))}
                />
              </label>
              <label>
                Company Type
                <select
                  value={form.company_type}
                  onChange={(event) => onCompanyTypeChange(event.target.value as CompanyType)}
                >
                  <option value="individual">individual</option>
                  <option value="cv">cv</option>
                  <option value="pt">pt</option>
                </select>
              </label>
              <label>
                Email
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Phone
                <input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                />
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as CompanyStatus }))
                  }
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </label>
              <label>
                Website
                <input
                  type="url"
                  placeholder="https://"
                  value={form.website}
                  onChange={(event) => setForm((current) => ({ ...current, website: event.target.value }))}
                />
              </label>
              <label className="span-2">
                Description
                <input
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                />
              </label>
              <label className="span-2">
                Address
                <input
                  value={form.address}
                  onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                />
              </label>
              <label>
                Province
                <input
                  value={form.province}
                  onChange={(event) => setForm((current) => ({ ...current, province: event.target.value }))}
                />
              </label>
              <label>
                City
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                />
              </label>
              <label>
                Postal Code
                <input
                  value={form.postal_code}
                  onChange={(event) => setForm((current) => ({ ...current, postal_code: event.target.value }))}
                />
              </label>
              <div className="span-2">
                <label>
                  Location (Map)
                  <CoordinateMapPicker
                    latitude={latitudeValue}
                    longitude={longitudeValue}
                    onChange={({ latitude, longitude }) =>
                      setForm((current) => ({
                        ...current,
                        latitude: String(latitude),
                        longitude: String(longitude)
                      }))
                    }
                  />
                </label>
                <div className="coordinate-readout">
                  <label>
                    Latitude
                    <input value={form.latitude} readOnly placeholder="Set from map" />
                  </label>
                  <label>
                    Longitude
                    <input value={form.longitude} readOnly placeholder="Set from map" />
                  </label>
                  <button
                    className="ghost"
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, latitude: "", longitude: "" }))}
                  >
                    Clear Coordinate
                  </button>
                </div>
              </div>

              {showBusinessFields ? (
                <>
                  <label>
                    Company Registration Number
                    <input
                      required
                      value={form.company_registration_number}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, company_registration_number: event.target.value }))
                      }
                    />
                  </label>
                  <label>
                    NIB
                    <input
                      required
                      value={form.nib}
                      onChange={(event) => setForm((current) => ({ ...current, nib: event.target.value }))}
                    />
                  </label>
                  <label>
                    SIUP
                    <input
                      value={form.siup}
                      onChange={(event) => setForm((current) => ({ ...current, siup: event.target.value }))}
                    />
                  </label>
                  <label>
                    Deed Number
                    <input
                      value={form.deed_number}
                      onChange={(event) => setForm((current) => ({ ...current, deed_number: event.target.value }))}
                    />
                  </label>
                  <label>
                    PKP Number
                    <input
                      value={form.pkp_number}
                      onChange={(event) => setForm((current) => ({ ...current, pkp_number: event.target.value }))}
                    />
                  </label>
                </>
              ) : null}

              <label className="span-2">
                Logo Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      logo: event.target.files?.[0] ?? null,
                      remove_logo: event.target.files?.[0] ? false : current.remove_logo
                    }))
                  }
                />
              </label>

              {selectedLogoPreviewUrl ? (
                <div className="logo-preview-wrap span-2">
                  <img className="logo-preview-image" src={selectedLogoPreviewUrl} alt="Selected logo preview" />
                  <p className="state">Selected file preview</p>
                </div>
              ) : null}

              {existingLogoUrl ? (
                <div className="logo-preview-wrap span-2">
                  <img className="logo-preview-image" src={existingLogoUrl} alt="Current company logo" />
                  <p className="state">Current logo from server</p>
                </div>
              ) : null}

              {drawer.mode === "edit" ? (
                <label className="span-2">
                  <input
                    type="checkbox"
                    checked={form.remove_logo}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        remove_logo: event.target.checked,
                        logo: event.target.checked ? null : current.logo
                      }))
                    }
                  />
                  Remove existing logo
                </label>
              ) : null}

              {drawer.mode === "edit" && existingLogoPath ? (
                <p className="state span-2">
                  Current logo path: {existingLogoPath}
                </p>
              ) : null}

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
