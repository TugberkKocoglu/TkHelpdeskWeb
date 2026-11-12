export interface Company {
  id: number;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompanyFormValues {
  name: string;
  contactEmail: string;
  contactPhone: string;
}

export type CompanyApiResponse = {
  success: boolean;
  data: Company[];
  message?: string;
};
