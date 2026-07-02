export type PetOption = {
  id: number;
  name: string;
  breed: string | null;
  size: string | null;
  tutor_name: string | null;
  tutor_phone: string | null;
  tutor_email: string | null;
  tutor_id?: number | null;
  tutor_ids?: number[] | null;
  tutor_address?: string | null;
  birth_date?: string | null;
  photo_url?: string | null;
  created_at?: string | null;
  sex?: string | null;
  weight?: number | null;
  behavior?: string | null;
  food_restrictions?: string | null;
  medications?: string | null;
  important_notes?: string | null;
  veterinarian?: string | null;
  service_prices?: Record<string, number> | null;
};

export type PetPayload = {
  name: string;
  tutor_ids?: number[];
  breed?: string | null;
  size?: string | null;
  sex?: string | null;
  weight?: number | null;
  birth_date?: string | null;
  behavior?: string | null;
  food_restrictions?: string | null;
  medications?: string | null;
  important_notes?: string | null;
  veterinarian?: string | null;
  photo_url?: string | null;
  service_prices?: Record<string, number> | null;
};

export type ReservationPayload = {
  pet_id?: number | null;
  tutor_name: string;
  phone: string;
  email?: string;
  pet_name: string;
  breed?: string;
  size?: string;
  service: string;
  entry_date: string;
  exit_date?: string | null;
  expected_time?: string;
  exit_time?: string;
  daily_rate?: number | null;
  notes?: string;
};

export type Reservation = ReservationPayload & {
  id: number;
  status: string;
  created_at: string;
};

export type PermissionLevel = "none" | "read" | "write";

export type PermissionKey =
  | "dashboard"
  | "reservations"
  | "agenda"
  | "checkin"
  | "pets"
  | "clients"
  | "services"
  | "packages"
  | "daily_reports"
  | "activities"
  | "feeding"
  | "grooming"
  | "reports"
  | "users"
  | "settings";

export type BusinessEntity = "creche" | "hotel";

export type UserPermissions = Partial<Record<PermissionKey, PermissionLevel>>;

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "equipe" | "tutor";
  is_active: boolean;
  entities?: BusinessEntity[] | null;
  permissions?: UserPermissions | null;
  created_at: string;
};

export type UserPayload = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "equipe" | "tutor";
  entities?: BusinessEntity[];
  permissions?: UserPermissions;
};

export type DaycareSettings = {
  max_capacity: number;
};

export type TutorPayload = {
  full_name: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
};

export type Tutor = TutorPayload & {
  id: number;
  created_at?: string | null;
};

export type AdminRecord = {
  id: number;
  module_key: string;
  title: string;
  status: string;
  payload: Record<string, unknown>;
  created_at?: string | null;
  updated_at?: string | null;
};

export type AdminRecordPayload = {
  module_key: string;
  title: string;
  status?: string;
  payload?: Record<string, unknown>;
};
