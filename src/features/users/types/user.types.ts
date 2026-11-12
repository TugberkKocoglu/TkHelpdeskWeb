export type UserRole = "Helpdesk" | "Employee";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  department_id: number;
  is_active: boolean;
  created_at?: string;
  department?: {
    id: number;
    name: string;
  } | null;
}

export interface Department {
  id: number;
  name: string;
  is_active?: boolean;
}

export interface UserFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: number;
}

export interface UpdateUserValues {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: number;
}
