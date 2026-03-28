import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export const MainLayout = () => {
  return (
    <div className="flex flex-row h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-full overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}