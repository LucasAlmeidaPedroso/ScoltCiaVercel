// =====================================================================
// Dados demo da Area do Tutor (Scolt & Cia)
// ---------------------------------------------------------------------
// Centro de toda a experiencia do tutor enquanto o backend nao esta
// conectado. Cada estrutura mapeia 1:1 com uma futura tabela Supabase
// (timeline_events, photos, vaccines, invoices, messages, achievements...).
// Trocar este modulo por chamadas reais nao muda nenhuma tela.
// =====================================================================

export type PetStatus = {
  present: boolean;
  location: string;
  activity: string;
  lastUpdate: string;
  lastVisit: string;
};

export const tutor = {
  name: "Mariana Alves",
  firstName: "Mariana",
  email: "mariana@email.com",
  phone: "(11) 98413-0296",
  address: "Rua das Flores, 120 - Sao Paulo - SP",
  avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
  memberSince: "Marco de 2024",
  twoFactor: false
};

export const pet = {
  name: "Thor",
  photo: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=400&q=85",
  cover: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=85",
  breed: "Golden Retriever",
  age: "3 anos",
  birthDate: "12/03/2022",
  weight: "28,4 kg",
  sex: "Macho",
  size: "Grande",
  microchip: "982000412345678",
  neutered: true
};

export const petStatus: PetStatus = {
  present: true,
  location: "Piscina",
  activity: "Brincando na piscina",
  lastUpdate: "10:05",
  lastVisit: "Ontem"
};

export const health = {
  allergies: ["Frango", "Picada de pulga"],
  restrictions: ["Sem petiscos industrializados"],
  medications: ["Antialergico 1x ao dia (manha)"],
  notes: "Tem displasia leve no quadril - evitar saltos altos.",
  vet: "Dra. Carina Mendes - Clinica VidaPet",
  emergencyContact: "Carina - (11) 97755-2805"
};

export const personality = [
  { emoji: "🎾", text: "Ama brincar de bolinha" },
  { emoji: "🌧️", text: "Nao gosta de chuva" },
  { emoji: "🎆", text: "Tem medo de fogos" },
  { emoji: "🏊", text: "Gosta muito de agua" },
  { emoji: "😴", text: "Prefere descansar depois do almoco" },
  { emoji: "🤝", text: "Muito sociavel com outros pets" }
];

export type TimelineEvent = {
  time: string;
  icon: string;
  title: string;
  detail?: string;
  type: "checkin" | "social" | "play" | "food" | "photo" | "rest" | "checkout";
};

export const timeline: TimelineEvent[] = [
  { time: "08:02", icon: "🚪", title: "Check-in realizado", detail: "Thor chegou animado e foi recebido pela equipe.", type: "checkin" },
  { time: "08:20", icon: "🐶", title: "Conheceu dois novos amigos", detail: "Fez amizade com a Mel e o Bento no parquinho.", type: "social" },
  { time: "09:15", icon: "🏊", title: "Brincou na piscina", detail: "Mergulhou atras da bolinha por 20 minutos.", type: "play" },
  { time: "10:05", icon: "🍖", title: "Recebeu petisco", detail: "Petisco natural de batata-doce.", type: "food" },
  { time: "11:40", icon: "📸", title: "Foto adicionada", detail: "Nova foto na galeria do dia.", type: "photo" },
  { time: "13:00", icon: "🍽️", title: "Almocou normalmente", detail: "Comeu toda a racao sem restricoes.", type: "food" },
  { time: "14:30", icon: "💤", title: "Descansou", detail: "Soneca tranquila na sala climatizada.", type: "rest" },
  { time: "16:10", icon: "🎾", title: "Brincou novamente", detail: "Sessao de recreacao monitorada com o grupo.", type: "play" },
  { time: "17:00", icon: "🏠", title: "Check-out realizado", detail: "Dia completo! Thor foi embora cansado e feliz.", type: "checkout" }
];

export type Photo = {
  id: number;
  src: string;
  caption: string;
  time: string;
  by: string;
  place: string;
  period: "Hoje" | "Esta semana" | "Este mes";
  favorite: boolean;
};

export const photos: Photo[] = [
  { id: 1, src: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=700&q=85", caption: "Correria no jardim 🌿", time: "11:40", by: "Equipe Scolt", place: "Playground", period: "Hoje", favorite: true },
  { id: 2, src: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=700&q=85", caption: "Caca a bolinha 🎾", time: "10:22", by: "Cuidadora Bia", place: "Piscina", period: "Hoje", favorite: false },
  { id: 3, src: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=700&q=85", caption: "Hora da soneca 😴", time: "14:35", by: "Equipe Scolt", place: "Sala climatizada", period: "Hoje", favorite: true },
  { id: 4, src: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=700&q=85", caption: "Novos amigos 🐾", time: "Ter, 08:50", by: "Cuidador Léo", place: "Parque", period: "Esta semana", favorite: false },
  { id: 5, src: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=700&q=85", caption: "Banho relaxante 🛁", time: "Seg, 16:10", by: "Equipe Banho", place: "Banho e Tosa", period: "Esta semana", favorite: false },
  { id: 6, src: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&w=700&q=85", caption: "Olhar de campeao 🏅", time: "10 jun, 09:30", by: "Equipe Scolt", place: "Playground", period: "Este mes", favorite: true },
  { id: 7, src: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=85", caption: "Amizade do mes 💛", time: "06 jun, 11:00", by: "Cuidadora Bia", place: "Parque", period: "Este mes", favorite: false },
  { id: 8, src: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=700&q=85", caption: "Pose pro album 📷", time: "02 jun, 15:20", by: "Equipe Scolt", place: "Jardim", period: "Este mes", favorite: false }
];

export type Video = {
  id: number;
  thumb: string;
  caption: string;
  date: string;
  duration: string;
};

export const videos: Video[] = [
  { id: 1, thumb: "https://images.unsplash.com/photo-1546238232-20216dec9f72?auto=format&fit=crop&w=700&q=85", caption: "Mergulho na piscina", date: "Hoje, 09:18", duration: "0:24" },
  { id: 2, thumb: "https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=700&q=85", caption: "Recreacao em grupo", date: "Ontem, 16:05", duration: "0:41" },
  { id: 3, thumb: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=700&q=85", caption: "Brincadeira com a Mel", date: "Ter, 10:30", duration: "0:33" }
];

export type Vaccine = {
  name: string;
  applied: string;
  valid: string;
  status: "em-dia" | "proxima" | "vencida";
  required: boolean;
};

export const vaccines: Vaccine[] = [
  { name: "V10 (Polivalente)", applied: "15/04/2025", valid: "15/04/2026", status: "em-dia", required: true },
  { name: "Antirrabica", applied: "20/06/2025", valid: "20/07/2026", status: "proxima", required: true },
  { name: "Giardia", applied: "10/01/2025", valid: "10/01/2026", status: "vencida", required: false },
  { name: "Gripe Canina", applied: "05/05/2025", valid: "05/05/2026", status: "em-dia", required: false }
];

export type Invoice = {
  date: string;
  description: string;
  method: "PIX" | "Cartao" | "Boleto";
  value: number;
  status: "Pago" | "Pendente" | "Atrasado";
};

export const financial = {
  monthlyValue: 780,
  plan: "Day Care - Plano Mensal",
  packagesLeft: 4,
  packageTotal: 10,
  nextDue: "05/07/2026",
  invoices: [
    { date: "05/06/2026", description: "Mensalidade Junho", method: "PIX", value: 780, status: "Pago" },
    { date: "05/05/2026", description: "Mensalidade Maio", method: "Cartao", value: 780, status: "Pago" },
    { date: "22/05/2026", description: "Banho e Tosa avulso", method: "PIX", value: 120, status: "Pago" },
    { date: "05/04/2026", description: "Mensalidade Abril", method: "Boleto", value: 780, status: "Pago" }
  ] as Invoice[]
};

export type Message = {
  id: number;
  from: "tutor" | "team";
  author: string;
  text: string;
  time: string;
};

export const messages: Message[] = [
  { id: 1, from: "team", author: "Equipe Scolt", text: "Bom dia, Mariana! O Thor chegou super animado hoje 🐶", time: "08:05" },
  { id: 2, from: "tutor", author: "Voce", text: "Que otimo! Ele dormiu pouco ontem, fica de olho 😅", time: "08:12" },
  { id: 3, from: "team", author: "Equipe Scolt", text: "Pode deixar! Ja separamos a sala climatizada pra soneca dele.", time: "08:14" },
  { id: 4, from: "team", author: "Cuidadora Bia", text: "Ele acabou de brincar na piscina, mandei um video na galeria 🏊", time: "09:20" },
  { id: 5, from: "tutor", author: "Voce", text: "Amei! Obrigada pelo carinho de sempre 💛", time: "09:25" }
];

export const quickReplies = [
  "Obrigada pelo carinho! 💛",
  "Como ele esta se comportando?",
  "Podem dar o remedio dele?",
  "A que horas busco hoje?"
];

export type Notification = {
  id: number;
  icon: string;
  text: string;
  time: string;
  read: boolean;
};

export const notifications: Notification[] = [
  { id: 1, icon: "📸", text: "Nova foto do Thor adicionada.", time: "agora", read: false },
  { id: 2, icon: "🏊", text: "Thor esta brincando na piscina.", time: "10:05", read: false },
  { id: 3, icon: "🍖", text: "Thor acabou de receber um petisco.", time: "10:05", read: false },
  { id: 4, icon: "🐶", text: "Thor entrou na creche.", time: "08:02", read: true },
  { id: 5, icon: "❤️", text: "Seu relatorio diario esta pronto.", time: "Ontem", read: true }
];

export type AgendaItem = {
  date: string;
  weekday: string;
  time: string;
  service: string;
  status: "Confirmada" | "Aguardando" | "Concluida";
};

export const agenda: AgendaItem[] = [
  { date: "26/06", weekday: "Qui", time: "07:30", service: "Day Care", status: "Confirmada" },
  { date: "27/06", weekday: "Sex", time: "07:30", service: "Day Care", status: "Confirmada" },
  { date: "28/06", weekday: "Sab", time: "09:00", service: "Banho e Tosa", status: "Aguardando" },
  { date: "01/07", weekday: "Ter", time: "07:30", service: "Day Care", status: "Confirmada" }
];

export const nextReservation = agenda[0];

export const dailyReport = {
  date: "25 de Junho de 2026",
  summary: "Thor teve um dia excelente! Muito ativo pela manha, socializou bem e descansou no periodo da tarde.",
  food: "Comeu 100% da racao no almoco. Aceitou bem o petisco natural.",
  hydration: "Boa hidratacao ao longo do dia.",
  rest: "Soneca de 1h40 na sala climatizada.",
  social: "Interagiu com 6 pets diferentes. Destaque para Mel e Bento.",
  mood: "Alegre e brincalhao",
  occurrences: "Nenhuma ocorrencia.",
  responsible: "Bia Camargo"
};

export type Achievement = {
  icon: string;
  title: string;
  desc: string;
  earned: boolean;
};

export const achievements: Achievement[] = [
  { icon: "🏅", title: "Primeira Visita", desc: "O comeco de tudo!", earned: true },
  { icon: "🎉", title: "10 Visitas", desc: "Ja virou de casa.", earned: true },
  { icon: "🤝", title: "Sociavel", desc: "Fez 20+ amigos.", earned: true },
  { icon: "🏊", title: "Nadador", desc: "Ama a piscina.", earned: true },
  { icon: "⭐", title: "Bom Comportamento", desc: "Exemplo de educacao.", earned: true },
  { icon: "💛", title: "Melhor Amigo", desc: "Parceiro inseparavel.", earned: false },
  { icon: "🎖️", title: "Veterano da Creche", desc: "100 visitas completas.", earned: false },
  { icon: "🦴", title: "Comilao", desc: "Nunca recusa comida.", earned: true }
];

export type LifeMoment = {
  icon: string;
  title: string;
  date: string;
  desc: string;
};

export const lifeTimeline: LifeMoment[] = [
  { icon: "🐾", title: "Primeira visita", date: "Mar 2024", desc: "Thor pisou na creche pela primeira vez." },
  { icon: "🤝", title: "Primeira amizade", date: "Mar 2024", desc: "Conheceu a Mel, sua melhor amiga." },
  { icon: "🛁", title: "Primeiro banho", date: "Abr 2024", desc: "Estreia no banho e tosa." },
  { icon: "🎂", title: "Aniversario de 2 anos", date: "Mar 2024", desc: "Festinha com bolo de pet." },
  { icon: "🎉", title: "100a visita", date: "Jan 2026", desc: "Marco de fidelidade!" },
  { icon: "🏊", title: "Conquistou a piscina", date: "Fev 2026", desc: "Perdeu o medo da agua." }
];

export const indicators = [
  { icon: "📅", label: "Dias frequentados", value: "128" },
  { icon: "⏱️", label: "Horas na creche", value: "1.024h" },
  { icon: "🤝", label: "Amigos frequentes", value: "Mel, Bento" },
  { icon: "🎾", label: "Brincadeira favorita", value: "Piscina" },
  { icon: "📸", label: "Fotos no album", value: "342" },
  { icon: "🎬", label: "Videos no album", value: "57" },
  { icon: "🛁", label: "Ultimo banho", value: "22/05/2026" },
  { icon: "⚖️", label: "Peso atual", value: "28,4 kg" }
];

export const weightHistory = [
  { label: "Jan", value: 27.1 },
  { label: "Fev", value: 27.6 },
  { label: "Mar", value: 27.9 },
  { label: "Abr", value: 28.0 },
  { label: "Mai", value: 28.2 },
  { label: "Jun", value: 28.4 }
];

export const aiInsights = [
  { period: "Semana", text: "Thor apresentou maior nivel de atividade nesta semana em comparacao as anteriores." },
  { period: "Mes", text: "Thor brincou com 12 pets diferentes durante o mes." },
  { period: "Semana", text: "Thor descansou menos do que sua media habitual - de olho no sono." },
  { period: "Semana", text: "Excelente socializacao: ele liderou as brincadeiras em grupo." }
];

export const dashboardAvisos = [
  { icon: "📢", title: "Feriado de Corpus Christi", text: "Funcionaremos em horario reduzido: 8h as 14h.", date: "Hoje" },
  { icon: "💉", title: "Campanha de vacinacao", text: "Traga a carteirinha atualizada ate 30/06.", date: "2 dias atras" }
];
