import { Link, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Headphones } from "lucide-react";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container flex flex-col items-center justify-center py-24 text-center">
        <Headphones className="mb-6 h-20 w-20 text-muted-foreground/20" />
        <h1 className="mb-2 font-heading text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 font-heading text-xl text-foreground">This story doesn't exist</p>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{location.pathname}</code> couldn't be found. It may have been moved or removed.
        </p>
        <div className="flex gap-3">
          <Link
            to="/"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Go Home
          </Link>
          <Link
            to="/explore"
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Explore Episodes
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
