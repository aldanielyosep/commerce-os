export type UserRole = "super_admin" | "admin";
export type UserStatus = "active" | "disabled";

export type AuthUser = {
  id: number;
  email: string;
  username: string | null;
  role: UserRole;
  status: UserStatus;
};

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  message?: string;
  errors?: string[];
};

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
