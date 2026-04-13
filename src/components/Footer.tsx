import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-16">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="font-heading text-lg font-bold text-primary-foreground">آ</span>
              </div>
              <span className="font-heading text-xl font-bold">Awaz</span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A slow, intentional space for real voices, mental health, and meaningful conversations. 
              We are in the business of keeping stories alive.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold">Navigate</h4>
            <div className="flex flex-col gap-2.5">
              {[
                { to: "/", label: "Home" },
                { to: "/explore", label: "Explore" },
                { to: "/about", label: "Our Story" },
              ].map((l) => (
                <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="mb-4 font-heading text-sm font-semibold">Community</h4>
            <div className="flex flex-col gap-2.5">
              <span className="text-sm text-muted-foreground">Spotify</span>
              <span className="text-sm text-muted-foreground">Instagram</span>
              <span className="text-sm text-muted-foreground">YouTube</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">© 2025 Awaz. Stories that deserve to be heard.</p>
          <div className="flex gap-4">
            <button className="text-xs font-medium text-primary">اردو</button>
            <span className="text-xs text-muted-foreground">|</span>
            <button className="text-xs font-medium text-muted-foreground hover:text-primary">English</button>
          </div>
        </div>
      </div>
    </footer>
  );
}
