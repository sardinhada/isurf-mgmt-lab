import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { AnnualPaymentsEditor } from './AnnualPaymentsEditor';
import { MonthlyPaymentsEditor } from './MonthlyPaymentsEditor';
import type { SocioFormValues, SocioStatus } from '../../types/socio';

const today = () => new Date().toISOString().split('T')[0];
const currentYearEnd = () => `${new Date().getFullYear()}-12-31`;

const BATCH_SIZE = 15;
const BATCH_START = 2013;
const BATCH_COUNT = 5;
const batchYears = (batch: number) =>
  Array.from({ length: BATCH_SIZE }, (_, i) => BATCH_START + batch * BATCH_SIZE + i);
const DEFAULT_VALUES: SocioFormValues = {
  name: '',
  email: '',
  adms_id: '',
  phone: '',
  address: '',
  observacoes: '',
  ncc: '',
  nif: '',
  birth_date: '',
  postal_code: '',
  localidade: '',
  joined_at: today(),
  status: 'active',
  paid_until: currentYearEnd(),
  board_store: false,
  utilization: false,
  surf_lessons: false,
};

type FormErrors = Partial<Record<keyof SocioFormValues, string>>;

interface Props {
  partnerId?: number; // provided when editing — enables monthly payment editors
  admsId?: number | null;
  initialValues?: Partial<SocioFormValues>;
  onSubmit: (values: SocioFormValues) => void;
  onCancel: () => void;
  onError?: (message: string) => void;
  submitLabel?: string;
  disabled?: boolean;
}

export const SocioForm = ({
  partnerId,
  admsId,
  initialValues,
  onSubmit,
  onCancel,
  onError,
  submitLabel = 'Guardar',
  disabled = false,
}: Props) => {
  const [values, setValues] = useState<SocioFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [admsIdWarning, setAdmsIdWarning] = useState<string | null>(null);
  const [paidUntilBatch, setPaidUntilBatch] = useState(0);

  const handleAdmsIdBlur = async () => {
    const num = Number(values.adms_id);
    if (!values.adms_id || !Number.isInteger(num) || num <= 0) {
      setAdmsIdWarning(null);
      return;
    }
    try {
      const result = await invoke<{ id: number; name: string } | null>(
        'find_socio_by_adms_id',
        { admsId: num },
      );
      if (result && result.id !== partnerId) {
        setAdmsIdWarning(result.name);
      } else {
        setAdmsIdWarning(null);
      }
    } catch {
      setAdmsIdWarning(null);
    }
  };

  const set = <K extends keyof SocioFormValues>(key: K, value: SocioFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!values.name.trim()) e.name = 'Nome é obrigatório';
    if (!values.email.trim()) e.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(values.email)) e.email = 'Email inválido';
    if (!values.joined_at) e.joined_at = 'Obrigatório';
    if (!partnerId && !values.paid_until) e.paid_until = 'Obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit(values);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* ── Dados Pessoais ──────────────────────────────────── */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="overline" color="text.secondary">
            Dados Pessoais
          </Typography>
          {admsId != null && (
            <Chip label={`ADMS #${admsId}`} size="small" variant="outlined" />
          )}
        </Box>

        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome"
            required
            size="small"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            disabled={disabled}
          />

          <TextField
            label="Email"
            required
            type="email"
            size="small"
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            disabled={disabled}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Telefone"
              size="small"
              value={values.phone}
              onChange={(e) => set('phone', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Data de Nascimento"
              type="date"
              size="small"
              value={values.birth_date}
              onChange={(e) => set('birth_date', e.target.value)}
              disabled={disabled}
              slotProps={{
                inputLabel: { shrink: true },
                input: (() => {
                  if (!values.birth_date) return {};
                  const birth = new Date(values.birth_date);
                  const now = new Date();
                  let age = now.getFullYear() - birth.getFullYear();
                  const m = now.getMonth() - birth.getMonth();
                  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
                  if (age >= 18) return {};
                  return {
                    endAdornment: (
                      <Typography variant="caption" color="error" fontWeight="bold" sx={{ whiteSpace: 'nowrap' }}>
                        {age}a
                      </Typography>
                    ),
                  };
                })(),
              }}
              sx={{ flex: 1 }}
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="NCC"
              size="small"
              value={values.ncc}
              onChange={(e) => set('ncc', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              label="NIF"
              size="small"
              value={values.nif}
              onChange={(e) => set('nif', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Nº ADMS"
              size="small"
              type="number"
              value={values.adms_id}
              onChange={(e) => { set('adms_id', e.target.value); setAdmsIdWarning(null); }}
              onBlur={handleAdmsIdBlur}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
          </Stack>

          {admsIdWarning && (
            <FormHelperText sx={{ color: 'warning.main', mx: 0.25 }}>
              ⚠ Nº ADMS já atribuído a <strong>{admsIdWarning}</strong> — podes continuar mesmo assim.
            </FormHelperText>
          )}

          <TextField
            label="Endereço"
            size="small"
            value={values.address}
            onChange={(e) => set('address', e.target.value)}
            disabled={disabled}
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="Código Postal"
              size="small"
              value={values.postal_code}
              onChange={(e) => set('postal_code', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Localidade"
              size="small"
              value={values.localidade}
              onChange={(e) => set('localidade', e.target.value)}
              disabled={disabled}
              sx={{ flex: 2 }}
            />
          </Stack>

          <TextField
            label="Observações"
            size="small"
            multiline
            rows={3}
            value={values.observacoes}
            onChange={(e) => set('observacoes', e.target.value)}
            disabled={disabled}
          />
        </Stack>
      </Box>

      <Divider />

      {/* ── Adesão ──────────────────────────────────────────── */}
      <Box>
        <Typography variant="overline" color="text.secondary">
          Adesão
        </Typography>

        <Stack spacing={2} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Estado</InputLabel>
              <Select
                label="Estado"
                value={values.status}
                onChange={(e: SelectChangeEvent) =>
                  set('status', e.target.value as SocioStatus)
                }
                disabled={disabled}
              >
                <MenuItem value="active">Ativo</MenuItem>
                <MenuItem value="inactive">Inativo</MenuItem>
                <MenuItem value="suspended">Suspenso</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Data de Adesão"
              required
              type="date"
              size="small"
              value={values.joined_at}
              onChange={(e) => set('joined_at', e.target.value)}
              error={!!errors.joined_at}
              helperText={errors.joined_at}
              disabled={disabled}
              slotProps={{ inputLabel: { shrink: true } }}
              sx={{ flex: 1 }}
            />
          </Stack>

          {partnerId ? (
            <AnnualPaymentsEditor partnerId={partnerId} onError={onError} />
          ) : (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
                  Pago Até (Ano) *
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPaidUntilBatch((b) => b - 1)}
                  disabled={paidUntilBatch === 0 || disabled}
                >
                  <ChevronLeftIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ minWidth: 90, textAlign: 'center' }}>
                  {BATCH_START + paidUntilBatch * BATCH_SIZE} – {BATCH_START + paidUntilBatch * BATCH_SIZE + BATCH_SIZE - 1}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setPaidUntilBatch((b) => b + 1)}
                  disabled={paidUntilBatch === BATCH_COUNT - 1 || disabled}
                >
                  <ChevronRightIcon fontSize="small" />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {batchYears(paidUntilBatch).map((year) => {
                  const selected = values.paid_until?.startsWith(String(year));
                  return (
                    <Chip
                      key={year}
                      label={year}
                      size="small"
                      color={selected ? 'success' : 'default'}
                      onClick={() => set('paid_until', selected ? '' : `${year}-12-31`)}
                      disabled={disabled}
                    />
                  );
                })}
              </Box>

              {errors.paid_until && (
                <FormHelperText error sx={{ mt: 0.5 }}>{errors.paid_until}</FormHelperText>
              )}
            </Box>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={values.surf_lessons}
                onChange={(e) => set('surf_lessons', e.target.checked)}
                disabled={disabled}
              />
            }
            label="Formação"
          />

          {partnerId && values.surf_lessons && (
            <MonthlyPaymentsEditor
              partnerId={partnerId}
              product="surf_lessons"
              label="Pagamentos — Formação"
              onError={onError}
            />
          )}

          <Divider />

          <FormControlLabel
            control={
              <Switch
                checked={values.board_store}
                onChange={(e) => set('board_store', e.target.checked)}
                disabled={disabled}
              />
            }
            label="Guardaria de Prancha"
          />

          {partnerId && values.board_store && (
            <MonthlyPaymentsEditor
              partnerId={partnerId}
              product="board_store"
              label="Pagamentos — Guardaria"
              onError={onError}
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={values.utilization}
                onChange={(e) => set('utilization', e.target.checked)}
                disabled={disabled}
              />
            }
            label="Utilização"
          />

          {partnerId && values.utilization && (
            <MonthlyPaymentsEditor
              partnerId={partnerId}
              product="utilization"
              label="Pagamentos — Utilização"
              onError={onError}
            />
          )}
        </Stack>
      </Box>

      {/* ── Actions ─────────────────────────────────────────── */}
      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" color="inherit" onClick={onCancel} disabled={disabled}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={disabled}>
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
};
