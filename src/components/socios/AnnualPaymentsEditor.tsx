import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, Chip, CircularProgress, IconButton, Typography } from '@mui/material';
import type { SocioDetail } from '../../types/socio';

const BATCH_SIZE = 15;
const BATCH_START = 2013;
const BATCH_COUNT = 5;

const batchYears = (batch: number) =>
  Array.from({ length: BATCH_SIZE }, (_, i) => BATCH_START + batch * BATCH_SIZE + i);

interface Props {
  partnerId: number;
  onError?: (message: string) => void;
}

export const AnnualPaymentsEditor = ({ partnerId, onError }: Props) => {
  const [paidYears, setPaidYears] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);
  const [batch, setBatch] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<{ data: SocioDetail }>('get_socio', { id: partnerId });
      const years: number[] = result.data.status?.annual_payments ?? [];
      setPaidYears(new Set(years));
    } catch (e) {
      onError?.(String(e));
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => { load(); }, [load]);

  const toggle = async (year: number) => {
    if (toggling !== null) return;
    setToggling(year);
    try {
      const result = await invoke<{ data: { paid_years: number[] } }>(
        'toggle_annual_payment',
        { id: partnerId, year },
      );
      setPaidYears(new Set(result.data.paid_years));
    } catch (e) {
      onError?.(String(e));
    } finally {
      setToggling(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Anos Pagos
        </Typography>
        <IconButton
          size="small"
          onClick={() => setBatch((b) => b - 1)}
          disabled={batch === 0 || loading}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography variant="caption" sx={{ minWidth: 90, textAlign: 'center' }}>
          {BATCH_START + batch * BATCH_SIZE} – {BATCH_START + batch * BATCH_SIZE + BATCH_SIZE - 1}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setBatch((b) => b + 1)}
          disabled={batch === BATCH_COUNT - 1 || loading}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      {loading ? (
        <CircularProgress size={16} />
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {batchYears(batch).map((year) => (
            <Chip
              key={year}
              label={year}
              size="small"
              color={paidYears.has(year) ? 'success' : 'default'}
              onClick={() => toggle(year)}
              disabled={toggling !== null}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};
