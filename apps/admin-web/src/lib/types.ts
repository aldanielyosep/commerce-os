export type UserRole = "super_admin" | "admin" | "admin_company" | "admin_storefront_ops";
export type UserStatus = "active" | "disabled";

export type AuthUser = {
  id: number;
  email: string;
  username: string | null;
  role: UserRole;
  status: UserStatus;
};

export type AuthSession = {
  token: string;
  refresh_token: string;
  refresh_token_expires_at: string;
  user: AuthUser;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: string[];
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type PaginationParams = {
  page?: number;
  per_page?: number;
};

export type SortDirection = "asc" | "desc";

export type EmployeeGender = "male" | "female";
export type EmployeeStatus = "active" | "probation" | "resigned" | "terminated" | "retired";

export type Employee = {
  id: number;
  employee_id: string;
  full_name: string;
  gender: EmployeeGender;
  birth_date: string;
  join_date: string;
  status: EmployeeStatus;
  identity_number: string;
  phone_number: string;
  city: string;
  email: string;
  address: string;
  postal_code: string;
  termination_date: string | null;
  departments?: Department[];
};

export type EmployeePayload = {
  full_name: string;
  gender: EmployeeGender;
  birth_date: string;
  join_date: string;
  identity_number: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  postal_code: string;
};

export type EmployeeUpdatePayload = Partial<EmployeePayload>;

export type EmployeeListFilters = {
  status?: EmployeeStatus;
  department_id?: number;
  q?: string;
};

export type EmployeeOrderBy = "employee_id" | "full_name" | "email" | "status" | "city" | "join_date";

export type Department = {
  id: number;
  code: string;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export type DepartmentPayload = {
  code: string;
  name: string;
};

export type DepartmentOrderBy = "code" | "name" | "created_at";

export type DepartmentUpdatePayload = Partial<DepartmentPayload>;

export type EmployeeDepartmentAssignment = {
  id: number;
  assigned_date: string;
  department: Department;
};

export type EmployeeDepartmentAssignmentPayload = {
  department_id: number;
  assigned_date: string;
};

export type UserRecord = {
  id: number;
  email: string;
  username: string | null;
  role: UserRole;
  status: UserStatus;
  employee_id: number | null;
  reset_password_sent_at: string | null;
  created_at?: string;
  updated_at?: string;
};

export type UserOrderBy = "id" | "email" | "username" | "role" | "status" | "created_at";

export type UserPayload = {
  email: string;
  username?: string;
  password: string;
  password_confirmation: string;
  employee_id?: number | null;
  role: UserRole;
  status: UserStatus;
};

export type UserUpdatePayload = {
  email?: string;
  username?: string;
  employee_id?: number | null;
};

export type CompanyAssignmentCompanyRef = {
  id: number;
  code: string;
  name: string;
};

export type UserCompanyAssignment = {
  id: number;
  user_id: number;
  company_id: number;
  role_in_company: string | null;
  company: CompanyAssignmentCompanyRef;
  created_at?: string;
  updated_at?: string;
};

export type UserCompanyAssignmentPayload = {
  company_id: number;
  role_in_company?: string;
};

export type PositionHistory = {
  id: number;
  position: string;
  effective_date: string;
  notes?: string;
};

export type SalaryRecord = {
  id: number;
  basic_salary_cents: number;
  allowance_cents: number;
  bonus_cents: number;
  effective_date: string;
  end_date: string | null;
};

export type EmployeeDocument = {
  id: number;
  document_type: string;
  filename?: string;
  expiry_date: string | null;
};

export type CompanyType = "individual" | "cv" | "pt";
export type CompanyStatus = "active" | "inactive";

export type CompanyOrderBy = "code" | "name" | "owner_name" | "status" | "city" | "created_at";

export type CompanyMarketplace =
  | "shopee"
  | "tokopedia"
  | "tiktok_shop"
  | "lazada"
  | "blibli"
  | "shopify"
  | "website";

export type CompanyMarketplaceLink = {
  id: number;
  marketplace: CompanyMarketplace;
  store_name: string;
  store_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Company = {
  id: number;
  code: string;
  name: string;
  owner_name: string;
  company_type: CompanyType;
  email: string;
  phone: string;
  website: string | null;
  description: string | null;
  address: string | null;
  province: string | null;
  city: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  status: CompanyStatus;
  company_registration_number: string | null;
  nib: string | null;
  siup: string | null;
  deed_number: string | null;
  pkp_number: string | null;
  logo_url: string | null;
  marketplace_links: CompanyMarketplaceLink[];
  created_at?: string;
  updated_at?: string;
};

export type CompanyPayload = {
  code: string;
  name: string;
  owner_name: string;
  company_type: CompanyType;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  address?: string;
  province?: string;
  city?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  status: CompanyStatus;
  company_registration_number?: string;
  nib?: string;
  siup?: string;
  deed_number?: string;
  pkp_number?: string;
};

export type CompanyUpdatePayload = Partial<CompanyPayload>;

export type CompanyMutationOptions = {
  logo?: File;
  remove_logo?: boolean;
};

export type CompanyMarketplaceLinkPayload = {
  marketplace: CompanyMarketplace;
  store_name: string;
  store_url: string;
  is_active: boolean;
};

export type CompanyMarketplaceLinkUpdatePayload = Partial<CompanyMarketplaceLinkPayload>;
