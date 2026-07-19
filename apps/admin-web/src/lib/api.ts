import type {
  ApiEnvelope,
  AuthUser,
  Company,
  CompanyMarketplaceLink,
  CompanyMarketplaceLinkPayload,
  CompanyMarketplaceLinkUpdatePayload,
  CompanyMutationOptions,
  CompanyPayload,
  CompanyUpdatePayload,
  Department,
  DepartmentOrderBy,
  DepartmentPayload,
  DepartmentUpdatePayload,
  Employee,
  EmployeeDepartmentAssignment,
  EmployeeDepartmentAssignmentPayload,
  EmployeeDocument,
  EmployeeListFilters,
  EmployeeOrderBy,
  EmployeePayload,
  EmployeeUpdatePayload,
  PaginatedResult,
  PaginationMeta,
  PaginationParams,
  CompanyOrderBy,
  PositionHistory,
  SalaryRecord,
  SortDirection,
  UserOrderBy,
  UserCompanyAssignment,
  UserCompanyAssignmentPayload,
  UserRole,
  UserPayload,
  UserUpdatePayload,
  UserRecord
} from "./types";

function resolveApiBaseUrl(): string {
  const runtimeBaseUrl = window.__RUNTIME_CONFIG__?.API_BASE_URL;
  if (runtimeBaseUrl && runtimeBaseUrl.trim().length > 0) {
    return runtimeBaseUrl;
  }

  const viteBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (viteBaseUrl && viteBaseUrl.trim().length > 0) {
    return viteBaseUrl;
  }

  return "http://localhost:3000";
}

export const API_BASE_URL = resolveApiBaseUrl();
export const UNAUTHORIZED_EVENT = "commerce_os:unauthorized";

function notifyUnauthorized() {
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}

export class ApiError extends Error {
  status: number;
  details?: string[];

  constructor(message: string, status: number, details?: string[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const DEFAULT_PAGINATION_META: PaginationMeta = {
  page: 1,
  per_page: 20,
  total_count: 0,
  total_pages: 0
};

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

function buildQueryString(filters: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    query.set(key, String(value));
  });

  const stringified = query.toString();
  return stringified ? `?${stringified}` : "";
}

function normalizePaginationMeta(meta?: Record<string, unknown>): PaginationMeta {
  const page = Number(meta?.page);
  const perPage = Number(meta?.per_page);
  const totalCount = Number(meta?.total_count);
  const totalPages = Number(meta?.total_pages);

  return {
    page: Number.isFinite(page) && page > 0 ? page : DEFAULT_PAGINATION_META.page,
    per_page: Number.isFinite(perPage) && perPage > 0 ? perPage : DEFAULT_PAGINATION_META.per_page,
    total_count: Number.isFinite(totalCount) && totalCount >= 0 ? totalCount : DEFAULT_PAGINATION_META.total_count,
    total_pages: Number.isFinite(totalPages) && totalPages >= 0 ? totalPages : DEFAULT_PAGINATION_META.total_pages
  };
}

async function collectAllPages<T>(
  fetchPage: (page: number) => Promise<PaginatedResult<T>>
): Promise<T[]> {
  const firstPage = await fetchPage(1);
  const items = [ ...firstPage.items ];

  for (let page = 2; page <= firstPage.meta.total_pages; page += 1) {
    const nextPage = await fetchPage(page);
    items.push(...nextPage.items);
  }

  return items;
}

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

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const envelope = payload as Partial<ApiEnvelope<unknown>> | null;
    if (response.status === 401 && token) {
      notifyUnauthorized();
    }

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

export async function listEmployees(token: string, filters: EmployeeListFilters = {}): Promise<Employee[]> {
  return collectAllPages((page) => listEmployeesPage(token, { ...filters, page }));
}

export async function listEmployeesPage(
  token: string,
  filters: EmployeeListFilters & PaginationParams & { order_by?: EmployeeOrderBy; order_dir?: SortDirection } = {}
): Promise<PaginatedResult<Employee>> {
  const query = buildQueryString({
    status: filters.status,
    department_id: filters.department_id,
    q: filters.q,
    page: filters.page,
    per_page: filters.per_page,
    order_by: filters.order_by,
    order_dir: filters.order_dir
  });
  const envelope = await request<ApiEnvelope<Employee[]>>(`/api/v1/employees${query}`, { token });
  return { items: envelope.data, meta: normalizePaginationMeta(envelope.meta) };
}

export async function getEmployee(token: string, employeeId: number): Promise<Employee> {
  const envelope = await request<ApiEnvelope<Employee>>(`/api/v1/employees/${employeeId}`, { token });
  return envelope.data;
}

export async function createEmployee(token: string, payload: EmployeePayload): Promise<Employee> {
  const envelope = await request<ApiEnvelope<Employee>>("/api/v1/employees", {
    method: "POST",
    token,
    body: { employee: payload }
  });
  return envelope.data;
}

export async function updateEmployee(
  token: string,
  employeeId: number,
  payload: EmployeeUpdatePayload
): Promise<Employee> {
  const envelope = await request<ApiEnvelope<Employee>>(`/api/v1/employees/${employeeId}`, {
    method: "PATCH",
    token,
    body: { employee: payload }
  });
  return envelope.data;
}

export async function terminateEmployee(token: string, employeeId: number): Promise<Employee> {
  const envelope = await request<ApiEnvelope<Employee>>(`/api/v1/employees/${employeeId}/terminate`, {
    method: "PATCH",
    token
  });
  return envelope.data;
}

export async function deleteEmployee(token: string, employeeId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(`/api/v1/employees/${employeeId}`, {
    method: "DELETE",
    token
  });
}

export async function listEmployeeDepartments(
  token: string,
  employeeId: number
): Promise<EmployeeDepartmentAssignment[]> {
  const envelope = await request<ApiEnvelope<EmployeeDepartmentAssignment[]>>(
    `/api/v1/employees/${employeeId}/employee_departments`,
    { token }
  );
  return envelope.data;
}

export async function assignEmployeeDepartment(
  token: string,
  employeeId: number,
  payload: EmployeeDepartmentAssignmentPayload
): Promise<EmployeeDepartmentAssignment> {
  const envelope = await request<ApiEnvelope<EmployeeDepartmentAssignment>>(
    `/api/v1/employees/${employeeId}/employee_departments`,
    {
      method: "POST",
      token,
      body: { employee_department: payload }
    }
  );
  return envelope.data;
}

export async function removeEmployeeDepartment(
  token: string,
  employeeId: number,
  assignmentId: number
): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(
    `/api/v1/employees/${employeeId}/employee_departments/${assignmentId}`,
    {
      method: "DELETE",
      token
    }
  );
}

export async function listDepartments(token: string): Promise<Department[]> {
  return collectAllPages((page) => listDepartmentsPage(token, { page }));
}

export async function listDepartmentsPage(
  token: string,
  pagination: PaginationParams & { order_by?: DepartmentOrderBy; order_dir?: SortDirection } = {}
): Promise<PaginatedResult<Department>> {
  const query = buildQueryString({
    page: pagination.page,
    per_page: pagination.per_page,
    order_by: pagination.order_by,
    order_dir: pagination.order_dir
  });
  const envelope = await request<ApiEnvelope<Department[]>>(`/api/v1/departments${query}`, { token });
  return { items: envelope.data, meta: normalizePaginationMeta(envelope.meta) };
}

export async function getDepartment(token: string, departmentId: number): Promise<Department> {
  const envelope = await request<ApiEnvelope<Department>>(`/api/v1/departments/${departmentId}`, { token });
  return envelope.data;
}

export async function createDepartment(token: string, payload: DepartmentPayload): Promise<Department> {
  const envelope = await request<ApiEnvelope<Department>>("/api/v1/departments", {
    method: "POST",
    token,
    body: { department: payload }
  });
  return envelope.data;
}

export async function updateDepartment(
  token: string,
  departmentId: number,
  payload: DepartmentUpdatePayload
): Promise<Department> {
  const envelope = await request<ApiEnvelope<Department>>(`/api/v1/departments/${departmentId}`, {
    method: "PATCH",
    token,
    body: { department: payload }
  });
  return envelope.data;
}

export async function deleteDepartment(token: string, departmentId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(`/api/v1/departments/${departmentId}`, {
    method: "DELETE",
    token
  });
}

export async function listUsers(token: string): Promise<UserRecord[]> {
  return collectAllPages((page) => listUsersPage(token, { page }));
}

export async function listUsersPage(
  token: string,
  pagination: PaginationParams & { order_by?: UserOrderBy; order_dir?: SortDirection } = {}
): Promise<PaginatedResult<UserRecord>> {
  const query = buildQueryString({
    page: pagination.page,
    per_page: pagination.per_page,
    order_by: pagination.order_by,
    order_dir: pagination.order_dir
  });
  const envelope = await request<ApiEnvelope<UserRecord[]>>(`/api/v1/users${query}`, { token });
  return { items: envelope.data, meta: normalizePaginationMeta(envelope.meta) };
}

export async function getUser(token: string, userId: number): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>(`/api/v1/users/${userId}`, { token });
  return envelope.data;
}

export async function createUser(token: string, payload: UserPayload): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>("/api/v1/users", {
    method: "POST",
    token,
    body: { user: payload }
  });
  return envelope.data;
}

export async function updateUser(token: string, userId: number, payload: UserUpdatePayload): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>(`/api/v1/users/${userId}`, {
    method: "PATCH",
    token,
    body: { user: payload }
  });
  return envelope.data;
}

export async function deleteUser(token: string, userId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; deleted: boolean }>>(`/api/v1/users/${userId}`, {
    method: "DELETE",
    token
  });
}

export async function enableUser(token: string, userId: number): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>(`/api/v1/users/${userId}/enable`, {
    method: "PATCH",
    token
  });
  return envelope.data;
}

export async function disableUser(token: string, userId: number): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>(`/api/v1/users/${userId}/disable`, {
    method: "PATCH",
    token
  });
  return envelope.data;
}

export async function changeUserRole(token: string, userId: number, role: UserRole): Promise<UserRecord> {
  const envelope = await request<ApiEnvelope<UserRecord>>(`/api/v1/users/${userId}/change_role`, {
    method: "PATCH",
    token,
    body: { user: { role } }
  });
  return envelope.data;
}

export async function resetUserPassword(token: string, userId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; reset_password_sent: boolean }>>(`/api/v1/users/${userId}/reset_password`, {
    method: "POST",
    token
  });
}

export async function listUserCompanyAssignments(
  token: string,
  userId: number
): Promise<UserCompanyAssignment[]> {
  const envelope = await request<ApiEnvelope<UserCompanyAssignment[]>>(
    `/api/v1/users/${userId}/company_assignments`,
    { token }
  );
  return envelope.data;
}

export async function createUserCompanyAssignment(
  token: string,
  userId: number,
  payload: UserCompanyAssignmentPayload
): Promise<UserCompanyAssignment> {
  const envelope = await request<ApiEnvelope<UserCompanyAssignment>>(
    `/api/v1/users/${userId}/company_assignments`,
    {
      method: "POST",
      token,
      body: { company_assignment: payload }
    }
  );
  return envelope.data;
}

export async function deleteUserCompanyAssignment(
  token: string,
  userId: number,
  assignmentId: number
): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(
    `/api/v1/users/${userId}/company_assignments/${assignmentId}`,
    {
      method: "DELETE",
      token
    }
  );
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

function appendCompanyFormData(form: FormData, payload: CompanyPayload | CompanyUpdatePayload) {
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(`company[${key}]`, String(value));
  });
}

export async function listCompanies(token: string): Promise<Company[]> {
  return collectAllPages((page) => listCompaniesPage(token, { page }));
}

export async function listCompaniesPage(
  token: string,
  pagination: PaginationParams & { order_by?: CompanyOrderBy; order_dir?: SortDirection } = {}
): Promise<PaginatedResult<Company>> {
  const query = buildQueryString({
    page: pagination.page,
    per_page: pagination.per_page,
    order_by: pagination.order_by,
    order_dir: pagination.order_dir
  });
  const envelope = await request<ApiEnvelope<Company[]>>(`/api/v1/companies${query}`, { token });
  return { items: envelope.data, meta: normalizePaginationMeta(envelope.meta) };
}

export async function getCompany(token: string, companyId: number): Promise<Company> {
  const envelope = await request<ApiEnvelope<Company>>(`/api/v1/companies/${companyId}`, { token });
  return envelope.data;
}

export async function createCompany(
  token: string,
  payload: CompanyPayload,
  options: CompanyMutationOptions = {}
): Promise<Company> {
  const form = new FormData();
  appendCompanyFormData(form, payload);

  if (options.logo) {
    form.append("company[logo]", options.logo);
  }

  if (options.remove_logo) {
    form.append("company[remove_logo]", "true");
  }

  const envelope = await request<ApiEnvelope<Company>>("/api/v1/companies", {
    method: "POST",
    token,
    body: form
  });

  return envelope.data;
}

export async function updateCompany(
  token: string,
  companyId: number,
  payload: CompanyUpdatePayload,
  options: CompanyMutationOptions = {}
): Promise<Company> {
  const form = new FormData();
  appendCompanyFormData(form, payload);

  if (options.logo) {
    form.append("company[logo]", options.logo);
  }

  if (options.remove_logo) {
    form.append("company[remove_logo]", "true");
  }

  const envelope = await request<ApiEnvelope<Company>>(`/api/v1/companies/${companyId}`, {
    method: "PATCH",
    token,
    body: form
  });

  return envelope.data;
}

export async function deleteCompany(token: string, companyId: number): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(`/api/v1/companies/${companyId}`, {
    method: "DELETE",
    token
  });
}

export async function listCompanyMarketplaceLinks(
  token: string,
  companyId: number
): Promise<CompanyMarketplaceLink[]> {
  const envelope = await request<ApiEnvelope<CompanyMarketplaceLink[]>>(
    `/api/v1/companies/${companyId}/marketplace_links`,
    { token }
  );
  return envelope.data;
}

export async function createCompanyMarketplaceLink(
  token: string,
  companyId: number,
  payload: CompanyMarketplaceLinkPayload
): Promise<CompanyMarketplaceLink> {
  const envelope = await request<ApiEnvelope<CompanyMarketplaceLink>>(
    `/api/v1/companies/${companyId}/marketplace_links`,
    {
      method: "POST",
      token,
      body: { company_marketplace_link: payload }
    }
  );
  return envelope.data;
}

export async function updateCompanyMarketplaceLink(
  token: string,
  companyId: number,
  linkId: number,
  payload: CompanyMarketplaceLinkUpdatePayload
): Promise<CompanyMarketplaceLink> {
  const envelope = await request<ApiEnvelope<CompanyMarketplaceLink>>(
    `/api/v1/companies/${companyId}/marketplace_links/${linkId}`,
    {
      method: "PATCH",
      token,
      body: { company_marketplace_link: payload }
    }
  );
  return envelope.data;
}

export async function deleteCompanyMarketplaceLink(
  token: string,
  companyId: number,
  linkId: number
): Promise<void> {
  await request<ApiEnvelope<{ id: number; discarded: boolean }>>(
    `/api/v1/companies/${companyId}/marketplace_links/${linkId}`,
    {
      method: "DELETE",
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
