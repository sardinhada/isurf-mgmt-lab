import { useState } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { MonthlyPaymentsEditor } from './MonthlyPaymentsEditor';
import type { SocioFormValues, SocioStatus } from '../../types/socio';

const today = () => new Date().toISOString().split('T')[0];
const nextYear = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
};
const DEFAULT_VALUES: SocioFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  observacoes: '',
  ncc: '',
  nif: '',
  birth_date: '',
  postal_code: '',
  joined_at: today(),
  status: 'active',
  paid_until: nextYear(),
  board_store: false,
  utilization: false,
  surf_lessons: false,
};

type FormErrors = Partial<Record<keyof SocioFormValues, string>>;

interface Props {
  partnerId?: number; // provided when editing — enables monthly payment editors
  initialValues?: Partial<SocioFormValues>;
  onSubmit: (values: SocioFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
  disabled?: boolean;
}

export const SocioForm = ({
  partnerId,
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Guardar',
  disabled = false,
}: Props) => {
  const [values, setValues] = useState<SocioFormValues>({
    ...DEFAULT_VALUES,
    ...initialValues,
  });
  const [errors, setErrors] = useState<FormErrors>({});

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
    if (!values.paid_until) e.paid_until = 'Obrigatório';
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
        <Typography variant="overline" color="text.secondary">
          Dados Pessoais
        </Typography>

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
              slotProps={{ inputLabel: { shrink: true } }}
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
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Endereço"
              size="small"
              value={values.address}
              onChange={(e) => set('address', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
            />
            <TextField
              label="Código Postal"
              size="small"
              value={values.postal_code}
              onChange={(e) => set('postal_code', e.target.value)}
              disabled={disabled}
              sx={{ flex: 1 }}
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

          <TextField
            label="Pago Até"
            required
            type="date"
            size="small"
            value={values.paid_until}
            onChange={(e) => set('paid_until', e.target.value)}
            error={!!errors.paid_until}
            helperText={errors.paid_until}
            disabled={disabled}
            slotProps={{ inputLabel: { shrink: true } }}
          />

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
            />
          )}

          <FormControlLabel
            control={
              <Switch
                checked={values.surf_lessons}
                onChange={(e) => set('surf_lessons', e.target.checked)}
                disabled={disabled}
              />
            }
            label="Aulas de Surf"
          />
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
