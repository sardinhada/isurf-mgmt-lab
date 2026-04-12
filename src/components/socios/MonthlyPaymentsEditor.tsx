import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Chip, CircularProgress, IconButton, Typography } from '@mui/material';
import type { MonthlyPayment, MonthlyPaymentProduct, SocioDetail } from '../../types/socio';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface Props {
  partnerId: number;
  product: MonthlyPaymentProduct;
  label: string;
}

export const MonthlyPaymentsEditor = ({ partnerId, product, label }: Props) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [paid, setPaid] = useState<boolean[]>(Array(12).fill(false));
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<{ data: SocioDetail }>('get_socio', { id: partnerId });
      const payments: MonthlyPayment[] = result.data.status?.monthly_payments ?? [];
      const arr = Array(12).fill(false);
      for (const p of payments) {
        if (p.product === product && p.year === year) {
          arr[p.month - 1] = p.paid;
        }
      }
      setPaid(arr);
    } finally {
      setLoading(false);
    }
  }, [partnerId, product, year]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (monthIndex: number) => {
    if (toggling !== null) return;
    const newPaid = !paid[monthIndex];
    setToggling(monthIndex);
    try {
      await invoke('update_socio', {
        id: partnerId,
        body: {
          monthly_payments: [
            { product, year, month: monthIndex + 1, paid: newPaid },
          ],
        },
      });
      setPaid((prev) => {
        const next = [...prev];
        next[monthIndex] = newPaid;
        return next;
      });
    } finally {
      setToggling(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          {label}
        </Typography>
        <IconButton size="small" onClick={() => setYear((y) => y - 1)} disabled={loading}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'center' }}>
          {year}
        </Typography>
        <IconButton size="small" onClick={() => setYear((y) => y + 1)} disabled={loading}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {MONTH_LABELS.map((month, i) => (
            <Chip
              key={i}
              label={month}
              size="small"
              color={paid[i] ? 'success' : 'default'}
              onClick={() => toggle(i)}
              disabled={toggling !== null}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
