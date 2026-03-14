import { Link, useRouter, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "narrative", label: "Story" },
  { id: "ventures", label: "Ventures" },
  { id: "portfolio", label: "Portfolio" },
  { id: "numbers", label: "Numbers" },
  { id: "design", label: "Design" },
  { id: "contact", label: "Inquiries" },
] as const;

const SECTION_IDS = NAV_ITEMS.map((item) => item.id);

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeId = useScrollSpy(SECTION_IDS);
  const router = useRouter();
  const navigate = useNavigate();

  const scrollTo = useCallback(
    async (id: string) => {
      setMobileOpen(false);
      if (router.state.location.pathname !== "/") {
        await navigate({ to: "/" });
        requestAnimationFrame(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        });
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }
    },
    [router, navigate]
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo — serif, editorial */}
          <Link to="/" className="font-display font-semibold text-xl tracking-tight">
            hrejuh
          </Link>

          {/* Desktop Nav — uppercase editorial labels */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={cn(
                  "text-[11px] font-mono uppercase tracking-[0.15em] transition-colors relative py-1",
                  activeId === item.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
                {activeId === item.id && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-0 left-0 right-0 h-px bg-accent"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
            <ThemeToggle className="ml-2" />
          </div>

          {/* Mobile toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-muted-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>

            <div className="flex flex-col items-center gap-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => scrollTo(item.id)}
                  className={cn(
                    "font-display text-3xl font-medium transition-colors",
                    activeId === item.id
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
