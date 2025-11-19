// frontend/src/pages/dashboard/DashboardMain.jsx
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./sidebar/DashboardSidebar";

export default function DashboardMain() {
  return (
    <div className="min-h-[70vh] bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <DashboardSidebar />
        </aside>

        {/* Content */}
        <section className="lg:col-span-3 bg-transparent">
          <div className="bg-white rounded-xl shadow p-6">
            <Outlet />
          </div>
        </section>
      </div>
    </div>
  );
}
