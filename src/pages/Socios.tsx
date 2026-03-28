import { useCallback, useEffect, useMemo, useState } from 'react';
import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import RemoveIcon from '@mui/icons-material/Remove';
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

const loadDb = () => Database.load('sqlite:test.db');

type DialogState = { mode: 'create' } | { mode: 'edit'; socio: Socio } | null;

const socioToFormValues = (s: Socio): SocioFormValues => ({
  name: s.name,
  email: s.email,
  phone: s.phone ?? '',
  address: s.address ?? '',
  nss: s.nss ?? '',
  joined_at: s.joined_at ?? new Date().toISOString().split('T')[0],
  status: s.status ?? 'active',
  paid_until: s.paid_until ?? '',
  board_store: !!s.board_store,
  store_paid_until: s.store_paid_until ?? '',
});

/** Returns true if every character in `query` appears in order within `text`. */
const fuzzyMatch = (query: string, text: string): boolean => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const today = new Date().toISOString().split('T')[0];

export const Socios = () => {
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState<DialogState>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [purging, setPurging] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | SocioStatus>('all');
  const [filterPayment, setFilterPayment] = useState<'all' | 'paid' | 'overdue'>('all');
  const [filterGuardaria, setFilterGuardaria] = useState<'all' | 'yes' | 'no'>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSocios = useCallback(async () => {
    setLoading(true);
    try {
      const db = await loadDb();
      const rows = await db.select<Socio[]>(`
        SELECT
          s.id, s.name, s.email, s.phone, s.address, s.nss,
          ss.joined_at, ss.status, ss.paid_until,
          ss.board_store, ss.store_paid_until
        FROM socio s
        LEFT JOIN socio_status ss ON ss.partner_id = s.id
        ORDER BY s.name ASC
      `);
      setSocios(rows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSocios();
  }, [fetchSocios]);

  const filtered = useMemo(() => {
    const q = search.trim();
    return socios.filter((s) => {
      if (q && !fuzzyMatch(q, s.name) && !fuzzyMatch(q, s.email)) return false;
      if (filterStatus !== 'all' && s.status !== filterStatus) return false;
      if (filterPayment !== 'all') {
        if (s.status !== 'active' || !s.paid_until) return false;
        const paid = s.paid_until >= today;
        if (filterPayment === 'paid' && !paid) return false;
        if (filterPayment === 'overdue' && paid) return false;
      }
      if (filterGuardaria === 'yes' && !s.board_store) return false;
      if (filterGuardaria === 'no' && !!s.board_store) return false;
      return true;
    });
  }, [socios, search, filterStatus, filterPayment, filterGuardaria]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage],
  );

  const resetPage = () => setPage(0);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await invoke('seed_dev_data');
      await fetchSocios();
    } catch (e) {
      console.error('[seed] failed:', e);
      alert(`Seed falhou:\n${e}`);
    } finally {
      setSeeding(false);
    }
  };

  const handlePurge = async () => {
    setPurging(true);
    try {
      await invoke('purge_dev_data');
      await fetchSocios();
    } catch (e) {
      console.error('[purge] failed:', e);
      alert(`Purge falhou:\n${e}`);
    } finally {
      setPurging(false);
    }
  };

  const handleCreate = async (values: SocioFormValues) => {
    setSaving(true);
    try {
      const db = await loadDb();

      await db.execute(
        `INSERT INTO socio (name, email, phone, address, nss)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          values.name,
          values.email,
          values.phone || null,
          values.address || null,
          values.nss || null,
        ],
      );

      const [{ id }] = await db.select<{ id: number }[]>(
        'SELECT last_insert_rowid() AS id',
      );

      const storePaidUntil = values.board_store
        ? values.store_paid_until
        : values.paid_until;

      await db.execute(
        `INSERT INTO socio_status
           (partner_id, joined_at, status, paid_until, board_store, store_paid_until)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          id,
          values.joined_at,
          values.status,
          values.paid_until,
          values.board_store ? 1 : 0,
          storePaidUntil,
        ],
      );

      setDialog(null);
      await fetchSocios();
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (values: SocioFormValues) => {
    if (dialog?.mode !== 'edit') return;
    const { id } = dialog.socio;
    setSaving(true);
    try {
      const db = await loadDb();

      await db.execute(
        `UPDATE socio SET name=$1, email=$2, phone=$3, address=$4, nss=$5 WHERE id=$6`,
        [
          values.name,
          values.email,
          values.phone || null,
          values.address || null,
          values.nss || null,
          id,
        ],
      );

      const storePaidUntil = values.board_store
        ? values.store_paid_until
        : values.paid_until;

      await db.execute(
        `UPDATE socio_status
         SET joined_at=$1, status=$2, paid_until=$3, board_store=$4, store_paid_until=$5
         WHERE partner_id=$6`,
        [
          values.joined_at,
          values.status,
          values.paid_until,
          values.board_store ? 1 : 0,
          storePaidUntil,
          id,
        ],
      );

      setDialog(null);
      await fetchSocios();
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
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            color="warning"
            size="small"
            onClick={handleSeed}
            disabled={seeding || purging}
          >
            {seeding ? 'A semear…' : '[dev] Seed'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handlePurge}
            disabled={purging || seeding}
          >
            {purging ? 'A purgar…' : '[dev] Purge'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialog({ mode: 'create' })}
          >
            Novo Sócio
          </Button>
        </Box>
      </Box>

      {/* ── Search ────────────────────────────────────────────── */}
      <TextField
        size="small"
        placeholder="Pesquisar por nome ou email…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ mb: 2, width: 320 }}
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

      {/* ── Filters ───────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
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
            <ToggleButton value="overdue">Vencido</ToggleButton>
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
                  <TableCell>Pago Até</TableCell>
                  <TableCell align="center">Pago?</TableCell>
                  <TableCell align="center">Guardaria</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>

              <TableBody>
                {paginated.length === 0 ? (
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
                  paginated.map((s) => (
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
                      <TableCell>{s.paid_until ?? '—'}</TableCell>
                      <TableCell align="center">
                        {s.status === 'active' && s.paid_until ? (
                          <Chip
                            label={s.paid_until >= today ? 'Em dia' : 'Vencido'}
                            color={s.paid_until >= today ? 'success' : 'error'}
                            size="small"
                          />
                        ) : null}
                      </TableCell>
                      <TableCell align="center">
                        {s.board_store ? (
                          <CheckIcon fontSize="small" color="success" />
                        ) : (
                          <RemoveIcon fontSize="small" color="disabled" />
                        )}
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
            count={filtered.length}
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
