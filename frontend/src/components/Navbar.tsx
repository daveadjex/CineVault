"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  LogIn,
  UserPlus,
  Menu,
  X,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface NavbarProps {
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
}

export default function Navbar({
  searchQuery = "",
  setSearchQuery,
}: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Profile", href: "/profile" },
    { name: "Drama", href: "/drama" },
    { name: "Anime", href: "/anime" },
    { name: "Movies", href: "/movies" },
    { name: "Help", href: "/help" },
  ];

  /* Check authentication */
  useEffect(() => {
    const token = localStorage.getItem("cinevault_token");
    setIsAuthenticated(Boolean(token));
  }, []);

  /* Navbar scroll animation */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAuth = (tab: "login" | "register") => {
    router.push(`/auth?tab=${tab}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("cinevault_token");
    localStorage.removeItem("cinevault_uid");
    setIsAuthenticated(false);
    setProfileOpen(false);
    router.refresh();
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-border shadow-xl py-3"
          : "bg-gradient-to-b from-background via-background/70 to-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
        {/* Logo + Desktop Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Sparkles className="w-7 h-7 text-primary transition group-hover:rotate-12" />
            </div>
            <span className="text-2xl font-black tracking-tight text-foreground">
              CineVault
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-sm font-semibold transition ${
                    active
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-2 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Search */}
          {setSearchQuery && (
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-44 md:w-60 rounded-full bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground pl-10 pr-9 py-2 outline-none focus:border-primary transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Auth Area */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent transition"
              >
                <User className="w-4 h-4 text-primary" />
                Account
                <ChevronDown
                  className={`w-4 h-4 transition ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/profile");
                    }}
                    className="w-full px-4 py-3 text-left text-sm hover:bg-accent transition"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm text-destructive hover:bg-accent transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => handleAuth("login")}
                className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-accent transition"
              >
                <LogIn className="w-4 h-4" />
                Login
              </button>
              <button
                onClick={() => handleAuth("register")}
                className="flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:opacity-90 transition"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-foreground"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-4 px-6 pb-6 bg-background/95 backdrop-blur-xl border-t border-border animate-in slide-in-from-top-4">
          {setSearchQuery && (
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies..."
                className="w-full rounded-full bg-card border border-border py-3 pl-10 text-sm outline-none"
              />
            </div>
          )}

          <nav className="flex flex-col gap-3 mt-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold ${
                  pathname === link.href
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="flex gap-3 mt-6 pt-4 border-t border-border">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full rounded-full border border-destructive py-2 text-sm text-destructive"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAuth("login");
                  }}
                  className="flex-1 rounded-full border border-border py-2 text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleAuth("register");
                  }}
                  className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm font-bold"
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}