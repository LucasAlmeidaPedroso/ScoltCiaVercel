export type PetStatus = {
  present: boolean;
  location: string;
  activity: string;
  lastUpdate: string;
  lastVisit: string;
};

export const tutor = {
  name: "",
  firstName: "",
  email: "",
  phone: "",
  address: "",
  avatar: "/img/logo-scolt-cia.png",
  memberSince: "",
  twoFactor: false
};

export const pet = {
  name: "",
  photo: "/img/logo-scolt-cia.png",
  cover: "/img/hero-dachshund-akita.png",
  breed: "",
  age: "",
  birthDate: "",
  weight: "",
  sex: "",
  size: "",
  microchip: "",
  neutered: false
};

export const petStatus: PetStatus = {
  present: false,
  location: "",
  activity: "",
  lastUpdate: "",
  lastVisit: ""
};

export const health = {
  allergies: [] as string[],
  restrictions: [] as string[],
  medications: [] as string[],
  notes: "",
  vet: "",
  emergencyContact: ""
};

export const personality: Array<{ emoji: string; text: string }> = [];

export type TimelineEvent = {
  time: string;
  icon: string;
  title: string;
  detail?: string;
  type: "checkin" | "social" | "play" | "food" | "photo" | "rest" | "checkout";
};

export const timeline: TimelineEvent[] = [];

export type Photo = {
  id: number;
  src: string;
  caption: string;
  time: string;
  by: string;
  place: string;
  period: "Hoje" | "Esta semana" | "Este mes" | "Todas";
  favorite: boolean;
};

export const photos: Photo[] = [];

export type Video = {
  id: number;
  thumb: string;
  caption: string;
  date: string;
  duration: string;
};

export const videos: Video[] = [];

export type Vaccine = {
  name: string;
  applied: string;
  valid: string;
  status: "em-dia" | "proxima" | "vencida";
  required: boolean;
};

export const vaccines: Vaccine[] = [];

export type Invoice = {
  date: string;
  description: string;
  method: "PIX" | "Cartao" | "Boleto";
  value: number;
  status: "Pago" | "Pendente" | "Atrasado";
};

export const financial = {
  monthlyValue: 0,
  plan: "",
  packagesLeft: 0,
  packageTotal: 0,
  nextDue: "",
  invoices: [] as Invoice[]
};

export type Message = {
  id: number;
  from: "tutor" | "team";
  author: string;
  text: string;
  time: string;
};

export const messages: Message[] = [];

export const quickReplies = [
  "Como esta meu pet?",
  "Pode me enviar uma atualizacao?",
  "Preciso falar com a equipe."
];

export type Notification = {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [];

export type AgendaItem = {
  date: string;
  weekday: string;
  time: string;
  service: string;
  status: "Confirmada" | "Aguardando" | "Concluida";
};

export const agenda: AgendaItem[] = [];

export const nextReservation: AgendaItem = {
  date: "",
  weekday: "",
  time: "",
  service: "Nenhuma reserva agendada",
  status: "Aguardando"
};

export const dailyReport = {
  date: "",
  summary: "",
  food: "",
  hydration: "",
  rest: "",
  social: "",
  mood: "",
  occurrences: "",
  responsible: ""
};

export type Achievement = {
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
};

export const achievements: Achievement[] = [];

export type LifeMoment = {
  icon: string;
  title: string;
  date: string;
  desc: string;
};

export const lifeTimeline: LifeMoment[] = [];

export const indicators = [
  { icon: "", label: "Dias frequentados", value: "0" },
  { icon: "", label: "Horas na creche", value: "0h" },
  { icon: "", label: "Fotos no album", value: "0" },
  { icon: "", label: "Videos no album", value: "0" }
];

export const weightHistory: Array<{ label: string; value: number }> = [];
export const aiInsights: Array<{ period: string; text: string }> = [];
export const dashboardAvisos: Array<{ icon: string; title: string; text: string; date: string }> = [];
