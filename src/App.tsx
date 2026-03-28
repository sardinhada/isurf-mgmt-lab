import { BrowserRouter, Routes, Route } from "react-router";
import { MainLayout } from "./components/layout/MainLayout";

import { Dashboard } from "./pages/Dashboard";

import { sidebarItems, type SidebarItem } from './config/sidebar';

function App() {

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
