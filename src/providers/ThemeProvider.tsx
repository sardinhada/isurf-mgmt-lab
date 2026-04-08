import React, { createContext, useContext, useMemo, useState } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { CssBaseline } from '@mui/material';
import { grey } from '@mui/material/colors';
 
interface ThemeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
}
 
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
 
export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used inside ThemeProvider');
  return context;
};
 
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>('light');
 
  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
 
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === 'light' ? 'hsl(0, 0%, 99%)' : grey[900],
            paper: mode === 'light' ? 'hsl(220, 35%, 97%)' : 'hsl(220, 30%, 7%)',
          },
        },
        typography: {
          fontSize: 12,
        }
      }),
    [mode]
  );
 
  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};