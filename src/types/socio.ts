export type SocioStatus = 'active' | 'inactive' | 'suspended';

/** Row returned from the socios + socio_status JOIN query */
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
  // from socio_status (null when no status row exists yet)
  joined_at: string | null;
  status: SocioStatus | null;
  paid_until: string | null;
  board_store: number | null; // SQLite returns 0 / 1
  utilization: number | null; // SQLite returns 0 / 1
  surf_lessons: number | null; // SQLite returns 0 / 1
}

export type MonthlyPaymentProduct = 'board_store' | 'utilization';

/** A single row from monthly_payments */
export interface MonthlyPayment {
  month: number; // 1–12
  paid: number;  // SQLite 0 / 1
}

/** Values managed by SocioForm — covers both socio and socio_status tables */
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
