import { useCallback, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { SocioForm } from '../components/socios/SocioForm';
import type { Socio, SocioFormValues, SocioStatus } from '../types/socio';

const STATUS_LABEL: Record<SocioStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  suspended: 'Suspenso',
};

const STATUS_COLOR: Record<SocioStatus, 'success' | 'default' | 'warning'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
};

type DialogState = { mode: 'create' } | { mode: 'edit'; socio: Socio } | null;

const socioToFormValues = (s: Socio): SocioFormValues => ({
  name: s.name,
  email: s.email,
  phone: s.phone ?? '',
  address: s.address ?? '',
  observacoes: s.observacoes ?? '',
  ncc: s.ncc ?? '',
  nif: s.nif ?? '',
  birth_date: s.birth_date ?? '',
  postal_code: s.postal_code ?? '',
  joined_at: s.joined_at ?? new Date().toISOString().split('T')[0],
  status: s.status ?? 'active',
  paid_until: s.paid_until ?? '',
  board_store: !!s.board_store,
  utilization: !!s.utilization,
  surf_lessons: !!s.surf_lessons,
});

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const today = new Date().toISOString().split('T')[0];

export const Socios = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SocioStatus>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'due'>('all');
  const [filterGuardaria, setFilterGuardaria] = useState<'all' | 'yes' | 'no'>('all');
  const [filterUtilization, setFilterUtilization] = useState<'all' | 'yes' | 'no'>('all');
  const [filterSurfLessons, setFilterSurfLessons] = useState<'all' | 'yes' | 'no'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSocios = useCallback(async () => {
    setLoading(true);
    try {
      const result = await invoke<{ data: { socios: Socio[]; total: number; page: number; limit: number } }>(
        'list_socios',
        {
          page: page + 1, // API is 1-based
          limit: rowsPerPage,
          search: search.trim() || undefined,
          state: filterStatus !== 'all' ? filterStatus : undefined,
          payment: filterPayment !== 'all' ? filterPayment : undefined,
          boardStore: filterGuardaria !== 'all' ? filterGuardaria : undefined,
          utilization: filterUtilization !== 'all' ? filterUtilization : undefined,
          surfLessons: filterSurfLessons !== 'all' ? filterSurfLessons : undefined,
        },
      );
      setSocios(result.data.socios);
      setTotal(result.data.total);
    } catch (e) {
      console.error('[socios] fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, filterStatus, filterPayment, filterGuardaria, filterUtilization, filterSurfLessons]);

  useEffect(() => {
    fetchSocios();
  }, [fetchSocios]);

  const resetPage = () => setPage(0);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleCreate = async (values: SocioFormValues) => {
    setSaving(true);
    try {
      await invoke('create_socio', {
        body: {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          address: values.address || null,
          observacoes: values.observacoes || null,
          ncc: values.ncc || null,
          nif: values.nif || null,
          birth_date: values.birth_date || null,
          postal_code: values.postal_code || null,
          joined_at: values.joined_at || null,
          status: values.status,
          paid_until: values.paid_until || null,
          board_store: values.board_store,
          utilization: values.utilization,
          surf_lessons: values.surf_lessons,
        },
      });
      setDialog(null);
      await fetchSocios();
    } catch (e) {
      console.error('[socios] create failed:', e);
      alert(`Erro ao criar sócio:\n${e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values: SocioFormValues) => {
    if (dialog?.mode !== 'edit') return;
    const { id } = dialog.socio;
    setSaving(true);
    try {
      await invoke('update_socio', {
        id,
        body: {
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          address: values.address || null,
          observacoes: values.observacoes || null,
          ncc: values.ncc || null,
          nif: values.nif || null,
          birth_date: values.birth_date || null,
          postal_code: values.postal_code || null,
          joined_at: values.joined_at || null,
          status: values.status,
          paid_until: values.paid_until || null,
          board_store: values.board_store,
          utilization: values.utilization,
          surf_lessons: values.surf_lessons,
        },
      });
      setDialog(null);
      await fetchSocios();
    } catch (e) {
      console.error('[socios] update failed:', e);
      alert(`Erro ao guardar sócio:\n${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Header ────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography variant="h5" fontWeight={600}>
          Sócios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialog({ mode: 'create' })}
        >
          Novo Sócio
        </Button>
      </Box>

      {/* ── Search + Filters ──────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Pesquisar por nome ou email…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          sx={{ width: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>Estado</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterStatus}
            onChange={(_, v) => { if (v) { setFilterStatus(v); resetPage(); } }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="active">Ativo</ToggleButton>
            <ToggleButton value="inactive">Inativo</ToggleButton>
            <ToggleButton value="suspended">Suspenso</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>Pagamento</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterPayment}
            onChange={(_, v) => { if (v) { setFilterPayment(v); resetPage(); } }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="paid">Em dia</ToggleButton>
            <ToggleButton value="due">Vencido</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>Guardaria</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterGuardaria}
            onChange={(_, v) => { if (v) { setFilterGuardaria(v); resetPage(); } }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="yes">Sim</ToggleButton>
            <ToggleButton value="no">Não</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>Utilização</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterUtilization}
            onChange={(_, v) => { if (v) { setFilterUtilization(v); resetPage(); } }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="yes">Sim</ToggleButton>
            <ToggleButton value="no">Não</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary" noWrap>Aulas de Surf</Typography>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={filterSurfLessons}
            onChange={(_, v) => { if (v) { setFilterSurfLessons(v); resetPage(); } }}
          >
            <ToggleButton value="all">Todos</ToggleButton>
            <ToggleButton value="yes">Sim</ToggleButton>
            <ToggleButton value="no">Não</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* ── Table ─────────────────────────────────────────────── */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <TableContainer sx={{ flex: 1, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell align="center">Quota Anual Paga?</TableCell>
                  <TableCell>Paga Até</TableCell>
                  <TableCell>Produtos</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {socios.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      align="center"
                      sx={{ py: 6, color: 'text.secondary' }}
                    >
                      {search ? 'Nenhum resultado para a pesquisa' : 'Nenhum sócio encontrado'}
                    </TableCell>
                  </TableRow>
                ) : (
                  socios.map((s) => (
                    <TableRow key={s.id} hover>
                      <TableCell>{s.name}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{s.phone ?? '—'}</TableCell>
                      <TableCell>
                        {s.status ? (
                          <Chip
                            label={STATUS_LABEL[s.status]}
                            color={STATUS_COLOR[s.status]}
                            size="small"
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {s.status === 'active' && s.paid_until ? (
                          <Chip
                            label={s.paid_until >= today ? 'Em dia' : 'Vencido'}
                            color={s.paid_until >= today ? 'success' : 'error'}
                            size="small"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>{s.paid_until ?? '—'}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {s.board_store ? <Chip label="Guardaria" size="small" variant="outlined" /> : null}
                          {s.utilization ? <Chip label="Utilização" size="small" variant="outlined" /> : null}
                          {s.surf_lessons ? <Chip label="Aulas de Surf" size="small" variant="outlined" /> : null}
                          {!s.board_store && !s.utilization && !s.surf_lessons ? <span style={{ color: 'var(--mui-palette-text-disabled)' }}>—</span> : null}
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => setDialog({ mode: 'edit', socio: s })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            labelRowsPerPage="Por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          />
        </Paper>
      )}

      {/* ── Create / Edit Dialog ──────────────────────────────── */}
      <Dialog
        open={dialog !== null}
        onClose={() => !saving && setDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        >
          {dialog?.mode === 'edit' ? 'Editar Sócio' : 'Novo Sócio'}
          <IconButton size="small" onClick={() => setDialog(null)} disabled={saving}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {dialog?.mode === 'edit' ? (
            <SocioForm
              key={dialog.socio.id}
              partnerId={dialog.socio.id}
              initialValues={socioToFormValues(dialog.socio)}
              onSubmit={handleEdit}
              onCancel={() => setDialog(null)}
              submitLabel={saving ? 'A guardar…' : 'Guardar'}
              disabled={saving}
            />
          ) : (
            <SocioForm
              onSubmit={handleCreate}
              onCancel={() => setDialog(null)}
              submitLabel={saving ? 'A guardar…' : 'Criar Sócio'}
              disabled={saving}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
