import React, { useState } from "react"
import { Sidebar } from "./Sidebar"
import { Navbar } from "./Navbar"

export const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar onMenuClick={() => setSidebarOpen((v) => !v)} />
      <div className="flex min-h-[calc(100vh-4rem)]">
        {/* Desktop sidebar - sticky full height */}
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 border-r border-slate-800 bg-slate-900 z-10">
          <Sidebar />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-40 lg:hidden w-64 bg-slate-900">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout