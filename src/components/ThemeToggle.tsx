import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * Theme toggle. App is dark by default; toggle switches to light mode.
 * State stored under localStorage key "awaz-theme" with values "dark" | "light".
 */
export function ThemeToggle() {
  const [light, setLight] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("awaz-theme");
    if (stored) return stored === "light";
    return false; // Dark by default — ignore system preference per spec
  });

  useEffect(() => {
    const root = document.documentElement;
    if (light) {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    localStorage.setItem("awaz-theme", light ? "light" : "dark");
  }, [light]);

  return (
    <button
      onClick={() => setLight(!light)}
      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-elevated hover:text-foreground"
      aria-label={light ? "Switch to dark mode" : "Switch to light mode"}
      title={light ? "Switch to dark mode" : "Switch to light mode"}
    >
      {light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
