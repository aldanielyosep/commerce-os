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

export type Employee = {
  id: number;
  employee_id: string;
  full_name: string;
  status: string;
  city: string;
  email: string;
};

export type Department = {
  id: number;
  code: string;
  name: string;
};

export type UserRecord = {
  id: number;
  email: string;
  username: string | null;
  role: UserRole;
  status: UserStatus;
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
