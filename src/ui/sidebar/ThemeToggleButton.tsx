import { IconButton, Tooltip, type Theme } from '@mui/material';
import { ToggleOn, ToggleOff } from '@mui/icons-material';
import { useThemeMode } from "../../providers/ThemeProvider";

type ThemeToggleButtonProps = {
  theme: Theme
}

export const ThemeToggleButton = ({ theme }: ThemeToggleButtonProps) => {
  const { mode } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton
        disableRipple
        sx={{
          color: theme.palette.text.primary,
          bgcolor: 'transparent',
          '&:hover': {
            bgColor: 'transparent',
          },
          borderRadius: 0,
          padding: 0,
        }}
      >
        {mode === 'light' ? <ToggleOn /> : <ToggleOff />}
      </IconButton>
    </Tooltip>
  );
}