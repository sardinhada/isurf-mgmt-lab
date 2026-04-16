import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { invoke } from "@tauri-apps/api/core";
import { MainLayout } from "./components/layout/MainLayout";
import { Setup } from "./pages/Setup";
import { sidebarItems, type SidebarItem } from './config/sidebar';

function App() {
  const [configured, setConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    invoke<boolean>('is_configured').then(setConfigured).catch(() => setConfigured(false));
  }, []);

  if (configured === null) return null; // brief check, no flash

  if (!configured) {
    return <Setup onComplete={() => setConfigured(true)} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          {/* routes for global navigation from sidebar */}
          {sidebarItems.map(({ path, component }: SidebarItem) =>
            <Route path={path} element={component} />
          )}

          {/* routes of detail */}

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App
