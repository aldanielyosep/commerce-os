import type {
  ApiEnvelope,
  AuthUser,
  Department,
  Employee,
  EmployeeDocument,
  PositionHistory,
  SalaryRecord,
  UserRecord
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", token, body, headers = {} } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: token } : {}),
      ...headers
    },
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const envelope = payload as Partial<ApiEnvelope<unknown>> | null;
    throw new ApiError(
      envelope?.message ?? "Request failed",
      response.status,
      envelope?.errors ?? undefined
    );
  }

  return payload as T;
}

export async function signIn(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/sign_in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user: { email, password } })
  });

  const payload = (await response.json()) as ApiEnvelope<AuthUser>;
  const authHeader = response.headers.get("Authorization") ?? response.headers.get("authorization");

  if (!response.ok || !payload.success || !payload.data || !authHeader) {
    throw new ApiError(payload.message ?? "Unable to sign in", response.status, payload.errors);
  }

  return {
    token: authHeader,
    user: payload.data
  };
}

export async function signOut(token: string): Promise<void> {
  await request<ApiEnvelope<{ message: string }>>("/api/v1/users/sign_out", {
    method: "DELETE",
    token
  });
}

export async function listEmployees(token: string): Promise<Employee[]> {
  const envelope = await request<ApiEnvelope<Employee[]>>("/api/v1/employees", { token });
  return envelope.data;
}

export async function listDepartments(token: string): Promise<Department[]> {
  const envelope = await request<ApiEnvelope<Department[]>>("/api/v1/departments", { token });
  return envelope.data;
}

export async function listUsers(token: string): Promise<UserRecord[]> {
  const envelope = await request<ApiEnvelope<UserRecord[]>>("/api/v1/users", { token });
  return envelope.data;
}

export async function listPositionTimeline(token: string, employeeId: number): Promise<PositionHistory[]> {
  const envelope = await request<ApiEnvelope<PositionHistory[]>>(
    `/api/v1/employees/${employeeId}/position_histories`,
    { token }
  );
  return envelope.data;
}

export async function listSalaryTimeline(token: string, employeeId: number): Promise<SalaryRecord[]> {
  const envelope = await request<ApiEnvelope<SalaryRecord[]>>(
    `/api/v1/employees/${employeeId}/salary_records`,
    { token }
  );
  return envelope.data;
}

export async function listEmployeeDocuments(token: string, employeeId: number): Promise<EmployeeDocument[]> {
  const envelope = await request<ApiEnvelope<EmployeeDocument[]>>(
    `/api/v1/employees/${employeeId}/employee_documents`,
    { token }
  );
  return envelope.data;
}

export async function uploadEmployeeDocument(
  token: string,
  employeeId: number,
  input: { documentType: string; notes?: string; expiryDate?: string; file: File }
): Promise<EmployeeDocument> {
  const form = new FormData();
  form.append("employee_document[document_type]", input.documentType);
  if (input.notes) form.append("employee_document[notes]", input.notes);
  if (input.expiryDate) form.append("employee_document[expiry_date]", input.expiryDate);
  form.append("employee_document[file]", input.file);

  const envelope = await request<ApiEnvelope<EmployeeDocument>>(
    `/api/v1/employees/${employeeId}/employee_documents`,
    {
      method: "POST",
      token,
      body: form
    }
  );

  return envelope.data;
}

export async function getDocumentDownloadUrl(
  token: string,
  employeeId: number,
  documentId: number
): Promise<{ url: string; expires_at: string }> {
  const envelope = await request<ApiEnvelope<{ id: number; url: string; expires_at: string }>>(
    `/api/v1/employees/${employeeId}/employee_documents/${documentId}/download`,
    { token }
  );

  return {
    url: envelope.data.url,
    expires_at: envelope.data.expires_at
  };
}

export async function archiveDocument(token: string, employeeId: number, documentId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(
    `/api/v1/employees/${employeeId}/employee_documents/${documentId}/archive`,
    {
      method: "PATCH",
      token
    }
  );
}

export async function requestPasswordReset(email: string): Promise<void> {
  await request<unknown>("/api/v1/users/password", {
    method: "POST",
    body: { user: { email } }
  });
}
