import { Link, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, ChevronDown, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SearchOverlay } from "@/components/SearchOverlay";

const links = [
  { to: "/", label: "Home" },
  { to: "/explore", label: "Explore" },
  { to: "/about", label: "Our Story" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const { user, profile, loading, signOut } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <nav className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md transition-colors duration-300">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <span className="font-heading text-lg font-bold text-primary-foreground">آ</span>
            </div>
            <span className="font-heading text-xl font-bold">Awaz</span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === l.to ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            ))}

            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
              <span className="hidden lg:inline">Search</span>
              <kbd className="hidden rounded border border-border px-1.5 py-0.5 text-[10px] lg:inline">⌘K</kbd>
            </button>

            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-muted"
                    >
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                          {profile?.display_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                      )}
                      <span className="hidden font-medium sm:block">{profile?.display_name || "User"}</span>
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    <AnimatePresence>
                      {dropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 4, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-card py-1 shadow-warm"
                        >
                          {profile?.role === "creator" && (
                            <Link
                              to="/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                            >
                              <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                          )}
                          <Link
                            to="/profile"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                          >
                            <User className="h-4 w-4" /> Profile
                          </Link>
                          <button
                            onClick={() => { signOut(); setDropdownOpen(false); }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                          >
                            <LogOut className="h-4 w-4" /> Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link to="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-primary">Sign In</Link>
                    <Link
                      to="/auth/signup"
                      className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                    >
                      Join Free
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <ThemeToggle />
            <button onClick={() => setOpen(!open)} className="p-2">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-border md:hidden"
            >
              <div className="container flex flex-col gap-4 py-4">
                {links.map((l) => (
                  <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">
                    {l.label}
                  </Link>
                ))}
                {user ? (
                  <>
                    {profile?.role === "creator" && (
                      <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">Dashboard</Link>
                    )}
                    <Link to="/profile" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">Profile</Link>
                    <button onClick={() => { signOut(); setOpen(false); }} className="w-fit text-sm font-medium text-destructive">Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/auth/login" onClick={() => setOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-primary">Sign In</Link>
                    <Link to="/auth/signup" onClick={() => setOpen(false)} className="w-fit rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">Join Free</Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
