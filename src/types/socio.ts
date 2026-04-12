export type SocioStatus = 'active' | 'inactive' | 'suspended';

/** Flat socio row returned by GET /api/socios (status fields merged in) */
export interface Socio {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  observacoes: string | null;
  ncc: string | null;
  nif: string | null;
  birth_date: string | null;
  postal_code: string | null;
  // merged from socio_status (null when no status row exists)
  joined_at: string | null;
  status: SocioStatus | null;
  paid_until: string | null;
  board_store: boolean | null;
  utilization: boolean | null;
  surf_lessons: boolean | null;
}

export type MonthlyPaymentProduct = 'board_store' | 'utilization';

/** Monthly payment record as returned by the API */
export interface MonthlyPayment {
  product: MonthlyPaymentProduct;
  year: number;
  month: number; // 1–12
  paid: boolean;
}

/** Response from GET /api/socios/:id */
export interface SocioDetail {
  socio: Omit<Socio, 'joined_at' | 'status' | 'paid_until' | 'board_store' | 'utilization' | 'surf_lessons'>;
  status: {
    joined_at: string | null;
    status: SocioStatus;
    paid_until: string | null;
    board_store: boolean;
    utilization: boolean;
    surf_lessons: boolean;
    monthly_payments: MonthlyPayment[];
  } | null;
}

/** Values managed by SocioForm — covers both socio and socio_status */
export interface SocioFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  observacoes: string;
  ncc: string;
  nif: string;
  birth_date: string;
  postal_code: string;
  joined_at: string;
  status: SocioStatus;
  paid_until: string;
  board_store: boolean;
  utilization: boolean;
  surf_lessons: boolean;
}
