import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { Box, Card, CardContent, Divider, Link, Typography } from '@mui/material';

export const Ajuda = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Ajuda
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Se precisares de ajuda com alguma coisa fala comigo!
      </Typography>

      <Card variant="outlined" sx={{ maxWidth: 460, borderRadius: 3 }}>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Suporte Técnico
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Qualquer coisa que nao percebas ou qualquer coisa que queiras aqui acrescentar, etc. Nerdy questions welcome
          </Typography>

          <Divider sx={{ mb: 2.5 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Email
                </Typography>
                <Link underline="hover" variant="body2">
                  asxrra@gmail.com
                </Link>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PhoneIcon fontSize="small" color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Telefone
                </Typography>
                <Link underline="hover" variant="body2">
                  +351 915 809 787
                </Link>
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2.5 }} />

          <Typography variant="caption" color="text.secondary">
            Liga-me a hora de almoco ou em horario pos-laboral! Senao, aos fins de semana tambem da. Beijinhos!
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};
