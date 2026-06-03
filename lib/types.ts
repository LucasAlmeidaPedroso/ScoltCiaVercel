export type PetOption = {
  id: number;
  name: string;
  breed: string | null;
  size: string | null;
  tutor_name: string | null;
  tutor_phone: string | null;
  tutor_email: string | null;
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
  notes?: string;
};

export type Reservation = ReservationPayload & {
  id: number;
  status: string;
  created_at: string;
};

export type AppUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "equipe" | "tutor";
  is_active: boolean;
  created_at: string;
};

export type UserPayload = {
  name: string;
  email: string;
  password: string;
  role: "admin" | "equipe" | "tutor";
};
