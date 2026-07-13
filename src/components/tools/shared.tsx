import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ToolShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 font-mono uppercase tracking-wider"
        >
          ← All tools
        </Link>
        <h1 className="font-display font-bold text-4xl md:text-5xl mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground mb-10 max-w-2xl">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function Field({
  label,
  id,
  type = "number",
  value,
  onChange,
  suffix,
  step,
  min,
  placeholder,
}: {
  label: string;
  id: string;
  type?: string;
  value: string | number;
  onChange: (v: string) => void;
  suffix?: string;
  step?: string;
  min?: string;
  placeholder?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-1.5 block">
        {label}
      </span>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          step={step}
          min={min}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          inputMode={type === "number" ? "decimal" : undefined}
          onFocus={(event) => event.currentTarget.select()}
          onWheel={(event) => type === "number" && event.currentTarget.blur()}
          className={cn("w-full bg-surface-elevated border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-accent", suffix && "pr-20")}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </label>
  );
}

export function ResultBox({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-surface-elevated/50 p-5", className)}>
      <p className="editorial-caption mb-3">{title}</p>
      {children}
    </div>
  );
}

export function ResultRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-medium tabular-nums", highlight && "text-accent text-base")}>
        {value}
      </span>
    </div>
  );
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: Array<{ id: T; label: string }>;
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 mb-8 border-b border-border pb-4 [scrollbar-width:none]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={cn(
            "shrink-0 text-[11px] font-mono uppercase tracking-[0.12em] px-3 py-1.5 rounded-full border transition-colors",
            active === tab.id
              ? "bg-accent/10 border-accent text-foreground"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function parseNum(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}
