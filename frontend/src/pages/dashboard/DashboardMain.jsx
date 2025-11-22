import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useUser } from "../../context/UserContext";
import DashboardSidebar from "./sidebar/DashboardSidebar";

export default function DashboardMain() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return (
    <div className="min-h-[70vh] bg-gray-50">
      
      {/* ✅ BOUTON MENU MOBILE */}
      <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="relative">
        
        {/* ✅ SIDEBAR MOBILE (Overlay) */}
        <aside className={`
          lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Bouton fermer */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold">Menu</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <DashboardSidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* ✅ OVERLAY pour fermer la sidebar mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ✅ LAYOUT RESPONSIVE */}
        <div className="lg:flex">
          
          {/* Sidebar Desktop */}
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="h-full">
              <DashboardSidebar />
            </div>
          </aside>

          {/* Content Principal */}
          <main className="flex-1 lg:ml-0">
            <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg sm:rounded-xl shadow p-4 sm:p-6">
                <Outlet context={{ user }}/>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}