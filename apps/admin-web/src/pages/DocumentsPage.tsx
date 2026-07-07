import { FormEvent, useEffect, useState } from "react";
import { DataState } from "../components/DataState";
import { useAuth } from "../contexts/AuthContext";
import {
  archiveDocument,
  getDocumentDownloadUrl,
  listEmployeeDocuments,
  listEmployees,
  uploadEmployeeDocument
} from "../lib/api";
import type { Employee, EmployeeDocument } from "../lib/types";

const DOCUMENT_TYPES = [
  "national_id",
  "passport",
  "driver_license",
  "tax_id",
  "employment_contract",
  "education_certificate",
  "other"
];

export function DocumentsPage() {
  const { token } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [rows, setRows] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!token) return;

    listEmployees(token)
      .then((employeeRows) => {
        setEmployees(employeeRows);
        const first = employeeRows[0]?.id ?? null;
        setEmployeeId(first);
        if (first) {
          return listEmployeeDocuments(token, first).then(setRows);
        }
        return undefined;
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  async function refreshDocuments(nextEmployeeId: number) {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const docs = await listEmployeeDocuments(token, nextEmployeeId);
      setRows(docs);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onEmployeeChange(nextId: number) {
    setEmployeeId(nextId);
    await refreshDocuments(nextId);
  }

  async function onUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !employeeId) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File)) {
      setError("Please attach a document file.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      await uploadEmployeeDocument(token, employeeId, {
        documentType: String(formData.get("documentType") ?? "other"),
        notes: String(formData.get("notes") ?? "").trim() || undefined,
        expiryDate: String(formData.get("expiryDate") ?? "").trim() || undefined,
        file
      });
      form.reset();
      await refreshDocuments(employeeId);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function onDownload(documentId: number) {
    if (!token || !employeeId) return;

    try {
      const download = await getDocumentDownloadUrl(token, employeeId, documentId);
      window.open(download.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function onArchive(documentId: number) {
    if (!token || !employeeId) return;

    try {
      await archiveDocument(token, employeeId, documentId);
      await refreshDocuments(employeeId);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section>
      <h2>Documents</h2>
      <div className="card">
        <label>
          Employee
          <select value={employeeId ?? ""} onChange={(e) => void onEmployeeChange(Number(e.target.value))}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.full_name} ({employee.employee_id})
              </option>
            ))}
          </select>
        </label>
      </div>

      <form className="card form-grid" onSubmit={onUpload}>
        <h3>Upload Document</h3>
        <label>
          Type
          <select name="documentType" defaultValue="other">
            {DOCUMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <label>
          Expiry Date
          <input name="expiryDate" type="date" />
        </label>
        <label>
          Notes
          <input name="notes" type="text" placeholder="Optional note" />
        </label>
        <label>
          File
          <input name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" required />
        </label>
        <button className="primary" type="submit" disabled={uploading || !employeeId}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      <DataState loading={loading} error={error} empty={rows.length === 0} emptyLabel="No documents found.">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>File</th>
              <th>Expiry</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.document_type}</td>
                <td>{row.filename ?? "-"}</td>
                <td>{row.expiry_date ?? "-"}</td>
                <td className="actions">
                  <button className="ghost" onClick={() => void onDownload(row.id)}>
                    Download
                  </button>
                  <button className="danger" onClick={() => void onArchive(row.id)}>
                    Archive
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataState>
    </section>
  );
}
