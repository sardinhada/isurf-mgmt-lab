import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material"

import { Link } from "react-router";

import { useTheme } from "@mui/material/styles";
import { useThemeMode } from "../../providers/ThemeProvider";
import { ThemeToggleButton } from "../../ui/sidebar/ThemeToggleButton";

import { sidebarItems, type SidebarItem } from "../../config/sidebar";

const drawerWidth = 215;

export const Sidebar = () => {
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary
        }
      }}
    >
      {/* title */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: theme.palette.divider,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <img
          src='/adms.png'
          className="w-full"
          style={{ filter: theme.palette.mode === 'dark' ? 'invert(1)' : 'none' }}
        />
        <Typography sx={{ fontStyle: 'italic' }}>
          Gestao dos Socios
        </Typography>
      </Box>
      
      {/* dark mode button */}
      <ListItem
        disablePadding
        sx={{
          borderBottom: 1,
          borderColor: theme.palette.divider
        }}
      >
        <ListItemButton disableRipple onClick={() => { toggleMode(); }}>
          <ListItemIcon sx={{ color: theme.palette.text.primary }}>
            <ThemeToggleButton theme={theme} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography variant="inherit">
                Modo {`${mode === 'light' ? 'Escuro' : 'Claro'}`}
              </Typography>
            }
          />
        </ListItemButton>
      </ListItem>

      {/* navigation */}
      <List
        sx={{ pt:0 }}
      >
        {sidebarItems.map(({ text, icon, path }: SidebarItem) =>
          <ListItem key={text} disablePadding>
            <Link to={path} style={{ width: '100%'}}>
              <ListItemButton disableRipple>
                <ListItemIcon sx={{ color: theme.palette.text.primary }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </Link>
          </ListItem>
        )}
      </List>
    </Drawer>
  )
}