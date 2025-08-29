"use client";
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Bell, Home, LogOut, Menu, X, BellDot, BarChart3, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Notification } from '@/lib/types';

const navItems = [
  { name: "Dashboard", href: "/customer" },
  { name: "Forecast", href: "/customer/forecast" },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hide dropdown on scroll down, show on scroll up
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

  useEffect(() => {
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

  useEffect(() => {
    if (!user || user.userType !== 'customer') {
      router.push('/');
      return;
    }
    
    fetchNotifications();
    
    // Fetch notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, router]);

  const fetchNotifications = async () => {
    if (!user || user.userType !== 'customer') return;
    
    try {
      const notificationsData = await api.getNotifications(Number(user.id));
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!user || user.userType !== 'customer') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
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
            <div className="flex items-center bg-[#4c6ef5] shadow px-3 py-1 rounded-full gap-1.5 border border-[#4c6ef5]">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200
                    ${
                      pathname === item.href
                        ? "bg-white text-[#4c6ef5] shadow"
                        : "text-white hover:bg-[#3b5bdb] hover:text-white"
                    }
                  `}
                  style={{ minWidth: 90, textAlign: "center" }}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Notifications */}
              <Link
                href="/customer/notifications"
                className={`px-3 py-1 rounded-full font-semibold text-sm transition-all duration-200 relative
                  ${
                    pathname === "/customer/notifications"
                      ? "bg-white text-[#4c6ef5] shadow"
                      : "text-white hover:bg-[#3b5bdb] hover:text-white"
                  }
                `}
                style={{ minWidth: 90, textAlign: "center" }}
              >
                {unreadCount > 0 ? <BellDot className="h-4 w-4 mx-auto" /> : <Bell className="h-4 w-4 mx-auto" />}
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* Profile Circle with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3b5bdb] hover:bg-[#4c6ef5] transition-colors ml-2"
                  onClick={() => setDropdownOpen((open) => !open)}
                  aria-label="Profile"
                >
                  <UserCircle2 className="h-6 w-6 text-white" />
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      {user?.username}
                    </div>
                    <div className="px-4 py-1 text-xs text-gray-500 border-b">
                      Customer Portal
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
