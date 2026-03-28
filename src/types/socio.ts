export type SocioStatus = 'active' | 'inactive' | 'suspended';

/** Row returned from the socios + socio_status JOIN query */
export interface Socio {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  nss: string | null;
  // from socio_status (null when no status row exists yet)
  joined_at: string | null;
  status: SocioStatus | null;
  paid_until: string | null;
  board_store: number | null; // SQLite returns 0 / 1
  store_paid_until: string | null;
}

/** Values managed by SocioForm — covers both socio and socio_status tables */
export interface SocioFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  nss: string;
  joined_at: string;
  status: SocioStatus;
  paid_until: string;
  board_store: boolean;
  store_paid_until: string;
}
