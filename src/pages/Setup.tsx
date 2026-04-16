import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi';

interface Props {
  onComplete: () => void;
}

export const Setup = ({ onComplete }: Props) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('3000');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hostError = host.trim() === '';
  const portError = !/^\d{1,5}$/.test(port.trim()) || Number(port) < 1 || Number(port) > 65535;

  const handleSave = async () => {
    if (hostError || portError) return;
    setSaving(true);
    setError(null);
    try {
      await invoke('save_config', { host: host.trim(), port: port.trim() });
      onComplete();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          width: 420,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WifiIcon color="primary" />
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Configuração inicial
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Introduza o endereço do servidor da aplicação.
            </Typography>
          </Box>
        </Box>

        {/* Fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Endereço do servidor (API_HOST)"
            placeholder="ex: 192.168.1.66 ou meuservidor.local"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            error={saving && hostError}
            helperText={saving && hostError ? 'Campo obrigatório' : 'IP ou hostname do servidor backend'}
            size="small"
            fullWidth
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <TextField
            label="Porta (API_PORT)"
            placeholder="3000"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            error={saving && portError}
            helperText={saving && portError ? 'Porta inválida (1–65535)' : 'Porta TCP do servidor backend'}
            size="small"
            fullWidth
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </Box>

        {error && (
          <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Action */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          endIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
          fullWidth
        >
          {saving ? 'A guardar…' : 'Guardar e continuar'}
        </Button>
      </Box>
    </Box>
  );
};
