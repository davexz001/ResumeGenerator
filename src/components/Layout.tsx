import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LayoutDashboard, LogOut, Menu, Settings, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'My Resumes', href: '/', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar placeholder */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div className="fixed inset-0 bg-slate-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="flex-shrink-0 flex items-center px-4">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-900">AI Resume</span>
            </div>
            <div className="mt-5 flex-1 h-0 overflow-y-auto">
              <nav className="px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className={`mr-4 flex-shrink-0 h-6 w-6 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
              <button
                onClick={logout}
                className="flex-shrink-0 group block w-full flex items-center"
              >
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      {user?.email}
                    </p>
                    <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 flex items-center mt-1">
                      <LogOut className="h-4 w-4 mr-1 text-slate-400" />
                      Sign Out
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow border-r border-slate-200 pt-5 pb-4 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <FileText className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-slate-900">AI Resume</span>
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon className={`mr-3 flex-shrink-0 h-5 w-5 ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-500'}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="px-4 py-4 border-t border-slate-200 cursor-pointer" onClick={logout}>
                <div className="flex items-center w-full group">
                  <span className="inline-block h-8 w-8 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
                     <span className="text-slate-500 font-medium">
                       {user?.email?.[0].toUpperCase() || 'U'}
                     </span>
                  </span>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-[150px]">
                      {user?.email}
                    </p>
                    <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 flex items-center mt-1">
                      <LogOut className="h-3 w-3 mr-1 text-slate-400" />
                      Sign Out
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow lg:hidden">
          <button
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <span className="font-bold text-slate-900">AI Resume</span>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
