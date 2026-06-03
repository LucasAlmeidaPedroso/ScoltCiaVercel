import type { PetOption, Reservation } from "./types";

export const demoPets: PetOption[] = [
  {
    id: 1,
    name: "Luna",
    breed: "Golden Retriever",
    size: "Grande",
    tutor_name: "Mariana Alves",
    tutor_phone: "11984130296",
    tutor_email: "mariana@email.com"
  },
  {
    id: 2,
    name: "Theo",
    breed: "Spitz Alemao",
    size: "Pequeno",
    tutor_name: "Mariana Alves",
    tutor_phone: "11984130296",
    tutor_email: "mariana@email.com"
  }
];

export const demoReservations: Reservation[] = [
  {
    id: 1,
    pet_id: 1,
    tutor_name: "Mariana Alves",
    phone: "11984130296",
    email: "mariana@email.com",
    pet_name: "Luna",
    breed: "Golden Retriever",
    size: "Grande",
    service: "Hospedagem",
    entry_date: "2026-06-10",
    exit_date: "2026-06-12",
    expected_time: "08:30",
    notes: "Exemplo de reserva aguardando aprovacao.",
    status: "Aguardando aprovacao",
    created_at: new Date().toISOString()
  }
];
