// things that show up on sidebar menu

import type { JSX } from "react";

import HomeIcon from '@mui/icons-material/Home';
import HailIcon from '@mui/icons-material/Hail';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { Dashboard } from "../pages/Dashboard";
import { Socios } from "../pages/Socios";
import { Ajuda } from "../pages/Ajuda";

export interface SidebarItem {
  text: string;
  icon: JSX.Element;
  path: string;
  component: JSX.Element;
}

export const sidebarItems: SidebarItem[] = [
  {
    text: 'Dashboard',
    icon: <HomeIcon />,
    path: '/',
    component: <Dashboard />,
  },
  {
    text: 'Socios',
    icon: <HailIcon />,
    path: '/socios',
    component: <Socios />,
  },
  {
    text: 'Ajuda',
    icon: <HelpOutlineIcon />,
    path: '/ajuda',
    component: <Ajuda />,
  },
];
