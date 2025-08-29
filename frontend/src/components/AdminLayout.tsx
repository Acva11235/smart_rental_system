"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { LogOut, UserCircle2 } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Fleet Dashboard", href: "/admin" },
  { name: "Health", href: "/health" },
  { name: "Usage", href: "/usage" },
  { name: "Forecast", href: "/forecast" },
  { name: "Customers", href: "/customers" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  // Hide nav-bar on scroll down, show on scroll up
  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowNav(false); // scrolling down
      } else {
        setShowNav(true); // scrolling up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide admin navigation when not logged in as admin or on auth pages
  if (!user || user?.userType === 'customer') {
    return <>{children}</>;
  }

  return (
    <>
      <div
        className={`sticky top-0 z-[100] w-full transition-transform duration-300`}
        style={{
          background: "transparent",
          transform: showNav ? "translateY(0)" : "translateY(-100%)"
        }}
      >
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-center relative">
          {/* Compact Centered Bubble NavBar */}
          <nav className="flex justify-center w-full">
            <div className="flex items-center bg-[#6c7293] shadow px-3 py-1 rounded-full gap-1.5 border border-[#6c7293]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200
                    ${
                      pathname === item.href
                        ? "bg-white text-[#6c7293] shadow"
                        : "text-white hover:bg-[#575b75] hover:text-white"
                    }
                  `}
                  style={{ minWidth: 90, textAlign: "center" }}
                >
                  {item.name}
                </Link>
              ))}
              {/* Profile Circle with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#575b75] hover:bg-[#6c7293] transition-colors ml-2"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Profile"
                >
                  <UserCircle2 className="h-6 w-6 text-white" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user?.userType === 'admin' ? 'Admin' : 'FleetManager'}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>
      <main
        className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6 py-1"
        style={{ marginTop: '1.5rem' }}
      >
        {children}
      </main>
    </>
  );
}