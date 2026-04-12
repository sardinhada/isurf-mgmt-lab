import { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
// import ExploreIcon from '@mui/icons-material/Explore';
// import ThermostatIcon from '@mui/icons-material/Thermostat';
// import TimerIcon from '@mui/icons-material/Timer';
// import WavesIcon from '@mui/icons-material/Waves';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Alert, Box, Card, CardContent, Chip, Divider, Typography } from '@mui/material';

// interface SeaForecast {
//   forecast_date: string;
//   wave_height: number;
//   wave_dir: string;
//   wave_period: number;
//   sst: number;
// }

// const DIR_PT: Record<string, string> = {
//   N: 'Norte', NE: 'Nordeste', E: 'Este', SE: 'Sudeste',
//   S: 'Sul', SW: 'Sudoeste', W: 'Oeste', NW: 'Noroeste',
// };

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const formatDate = () => {
  const d = new Date();
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom Dia';
  if (h < 19) return 'Boa Tarde';
  return 'Boa Noite';
};

// interface StatTileProps {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
// }

// const StatTile = ({ icon, label, value }: StatTileProps) => (
//   <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, flex: 1 }}>
//     <Box sx={{ color: 'rgba(255,255,255,0.75)', display: 'flex' }}>{icon}</Box>
//     <Typography variant="h6" fontWeight={700} sx={{ color: 'white', lineHeight: 1 }}>
//       {value}
//     </Typography>
//     <Typography
//       variant="caption"
//       sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}
//     >
//       {label}
//     </Typography>
//   </Box>
// );

// const SkeletonTile = () => (
//   <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
//     <Skeleton variant="circular" width={24} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
//     <Skeleton variant="text" width={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
//     <Skeleton variant="text" width={32} sx={{ bgcolor: 'rgba(255,255,255,0.15)' }} />
//   </Box>
// );

type ApiStatus = 'operational' | 'down' | 'checking';

const statusColor = (s: ApiStatus) =>
  s === 'operational' ? 'success' : s === 'checking' ? 'default' : 'error';

const statusLabel = (s: ApiStatus) =>
  s === 'operational' ? 'Operacional' : s === 'checking' ? 'A verificar…' : 'Indisponível';

const ApiStatusCard = () => {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [apiBase, setApiBase] = useState('localhost:3000');

  useEffect(() => {
    invoke<string>('get_api_base').then(setApiBase).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;

    const check = () => {
      invoke<boolean>('health_check')
        .then((ok) => { if (!cancelled) setStatus(ok ? 'operational' : 'down'); })
        .catch(() => { if (!cancelled) setStatus('down'); });
    };

    check();
    const id = setInterval(check, 30_000);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  const degraded = status !== 'operational';

  return (
    <Card elevation={0} sx={{ maxWidth: 520, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <WarningAmberIcon fontSize="small" color={degraded ? 'warning' : 'success'} />
          <Typography variant="overline" sx={{ letterSpacing: 2, lineHeight: 1 }}>
            Estado das APIs
          </Typography>
        </Box>

        {degraded && status !== 'checking' && (
          <Alert severity="warning" variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
            O servidor está indisponível. Algumas funcionalidades podem não funcionar correctamente.
          </Alert>
        )}

        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" fontWeight={600}>Servidor ({apiBase})</Typography>
          <Chip
            label={statusLabel(status)}
            color={statusColor(status)}
            size="small"
            variant="outlined"
            sx={{ flexShrink: 0 }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  // const [forecast, setForecast] = useState<SeaForecast | null>(null);
  // const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   invoke<SeaForecast>('get_sea_forecast')
  //     .then(setForecast)
  //     .catch((e) => setError(String(e)));
  // }, []);

  // const loading = !forecast && !error;

  return (
    <Box sx={{ p: 4 }}>
      {/* ── Greeting ──────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          {getGreeting()}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {formatDate()}
        </Typography>
      </Box>

      {/* ── API status card ───────────────────────────────────── */}
      <ApiStatusCard />

      {/* ── Ocean forecast card ───────────────────────────────── */}
      {/* <Card
        elevation={0}
        sx={{
          maxWidth: 520,
          borderRadius: 4,
          background: 'linear-gradient(140deg, #023e8a 0%, #0096c7 55%, #48cae4 100%)',
          boxShadow: '0 12px 40px rgba(2, 62, 138, 0.35)',
        }}
      >
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <WavesIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 20 }} />
            <Typography
              variant="overline"
              sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 2, lineHeight: 1 }}
            >
              Condições do Mar · IPMA
            </Typography>
          </Box>

          {loading && (
            <Box sx={{ mb: 3 }}>
              <Skeleton variant="text" width="85%" sx={{ bgcolor: 'rgba(255,255,255,0.2)', fontSize: '1.25rem' }} />
              <Skeleton variant="text" width="60%" sx={{ bgcolor: 'rgba(255,255,255,0.15)', fontSize: '1.25rem' }} />
            </Box>
          )}

          {error && (
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 3 }}>
              Não foi possível obter dados do IPMA.
            </Typography>
          )}

          {forecast && (
            <Typography
              variant="h6"
              sx={{ color: 'white', fontWeight: 400, lineHeight: 1.7, mb: 3 }}
            >
              O IPMA diz que as ondas têm{' '}
              <Box component="span" fontWeight={700}>
                {forecast.wave_height.toFixed(1)} metros
              </Box>
              , com período de{' '}
              <Box component="span" fontWeight={700}>
                {Math.round(forecast.wave_period)}s
              </Box>
              {' '}e vindas de{' '}
              <Box component="span" fontWeight={700}>
                {DIR_PT[forecast.wave_dir] ?? forecast.wave_dir}
              </Box>
              .
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 1,
              pt: 2.5,
              borderTop: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {loading ? (
              <>
                <SkeletonTile />
                <SkeletonTile />
                <SkeletonTile />
                <SkeletonTile />
              </>
            ) : forecast ? (
              <>
                <StatTile
                  icon={<WavesIcon fontSize="small" />}
                  label="Ondas"
                  value={`${forecast.wave_height.toFixed(1)}m`}
                />
                <StatTile
                  icon={<ExploreIcon fontSize="small" />}
                  label="Direção"
                  value={forecast.wave_dir}
                />
                <StatTile
                  icon={<TimerIcon fontSize="small" />}
                  label="Período"
                  value={`${Math.round(forecast.wave_period)}s`}
                />
                <StatTile
                  icon={<ThermostatIcon fontSize="small" />}
                  label="Mar"
                  value={`${forecast.sst.toFixed(1)}°C`}
                />
              </>
            ) : null}
          </Box>
        </CardContent>
      </Card> */}
    </Box>
  );
};
