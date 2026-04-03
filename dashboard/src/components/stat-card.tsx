"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = valueRef.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(6px)";
    const raf = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.4s ease-out, transform 0.4s ease-out";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <div className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm p-5 transition-all hover:border-white/[0.12] hover:bg-white/[0.05]">
      {/* Subtle gradient glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          {icon && (
            <span className="text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors">
              {icon}
            </span>
          )}
        </div>
        <p
          ref={valueRef}
          className="text-2xl font-bold mt-1.5 tabular-nums"
        >
          {value}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}
