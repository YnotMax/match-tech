import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Zap, User as UserIcon, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function RootLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const links = [
    { name: "ONBOARDING", path: "/onboarding" },
    { name: "DESCOBRIR", path: "/discover" },
  ];

  const getHighResPhotoUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes('googleusercontent.com')) {
      if (url.includes('=s96-c')) return url.replace('=s96-c', '=s400-c');
      if (!url.includes('=')) return `${url}=s400-c`;
    }
    return url;
  };

  return (
    <div className="min-h-screen bg-neo-bg text-neo-black selection:bg-neo-lime selection:text-neo-black font-sans relative">
      <nav id="main-nav" className="border-b-[4px] border-neo-black bg-white sticky top-0 z-[40]">
        <div className="max-w-7xl mx-auto p-4 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="bg-neo-black p-2"><Zap className="text-neo-lime w-6 h-6" /></div>
               <NavLink to="/" className="font-heading font-black text-2xl uppercase tracking-tighter hover:text-neo-pink transition-colors">MATCH_TECH</NavLink>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-wrap items-center justify-center gap-2 md:gap-4">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`
                      px-4 py-2 font-heading font-bold uppercase transition-transform hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000] border-[3px] border-transparent
                      ${isActive 
                          ? 'bg-neo-lime text-neo-black border-[3px] !border-neo-black shadow-[4px_4px_0_0_#000] translate-y-0' 
                          : 'bg-neo-bg text-neo-black'}
                    `}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
              
              {user && (
                <div className="ml-2 flex items-center justify-center w-10 h-10 rounded-full neo-border border-2 bg-white overflow-hidden shadow-[2px_2px_0_0_#000]">
                  {user.photoURL ? (
                    <img src={getHighResPhotoUrl(user.photoURL) || ""} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-6 h-6 text-neo-black" />
                  )}
                </div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center gap-3">
              {user && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full neo-border border-2 bg-white overflow-hidden shadow-[2px_2px_0_0_#000]">
                  {user.photoURL ? (
                    <img src={getHighResPhotoUrl(user.photoURL) || ""} alt={user.displayName || "User"} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <UserIcon className="w-5 h-5 text-neo-black" />
                  )}
                </div>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 border-[3px] border-neo-black bg-neo-lime text-neo-black shadow-[4px_4px_0_0_#000] active:translate-y-1 active:translate-x-1 active:shadow-none transition-all"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Expansion */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-6 pb-2 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 relative z-50">
              {links.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`
                      px-4 py-3 font-heading font-bold text-lg uppercase text-center border-[3px] transition-transform active:translate-y-1 active:translate-x-1
                      ${isActive 
                          ? 'bg-neo-lime text-neo-black border-neo-black shadow-[4px_4px_0_0_#000] active:shadow-none' 
                          : 'bg-neo-bg text-neo-black border-transparent shadow-none hover:bg-white'}
                    `}
                  >
                    {link.name}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      {/* Grid Pattern background for the entire app */}
      <div 
        className="fixed inset-0 z-[-1] opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z' fill='none'/%3E%3Cpath d='M40 40H0V0h1v39h39v1z' fill='%23000' fill-opacity='0.1'/%3E%3C/svg%3E")`
        }}
      />

      <main className="w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
}
