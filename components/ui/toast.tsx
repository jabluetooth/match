"use client";

import { useEffect, useState, type ElementType } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { useToasts, toast as toastApi, type ToastItem } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Literal classes per variant (Tailwind can't see strings built at runtime).
const VARIANT: Record<ToastItem["variant"], { icon: ElementType; bar: string; icon_: string }> = {
  success: { icon: CheckCircle2, bar: "bg-success", icon_: "text-success" },
  error: { icon: AlertCircle, bar: "bg-danger", icon_: "text-danger" },
  info: { icon: Info, bar: "bg-info", icon_: "text-info" },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, bar, icon_ } = VARIANT[toast.variant];

  useEffect(() => {
    const r = requestAnimationFrame(() => setOpen(true));
    const timer = setTimeout(() => {
      setLeaving(true);
      setTimeout(() => toastApi.dismiss(toast.id), 220);
    }, toast.duration);
    return () => {
      cancelAnimationFrame(r);
      clearTimeout(timer);
    };
  }, [toast.id, toast.duration]);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => toastApi.dismiss(toast.id), 220);
  };

  const shown = open && !leaving;

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto relative flex w-full max-w-[400px] items-start gap-3 overflow-hidden rounded-md border border-line-strong bg-raised py-3 pl-4 pr-3 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-200 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
        shown ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0",
      )}
    >
      <span aria-hidden="true" className={cn("absolute inset-y-0 left-0 w-[3px]", bar)} />
      <Icon size={16} aria-hidden="true" className={cn("mt-0.5 shrink-0", icon_)} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-medium leading-snug text-ink">{toast.title}</p>
        {toast.description && <p className="mt-1 text-xs leading-relaxed text-ink-2">{toast.description}</p>}
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        className="-mr-1 -mt-0.5 grid size-6 shrink-0 place-items-center rounded text-ink-3 hover:bg-surface hover:text-ink"
      >
        <X size={13} aria-hidden="true" />
      </button>
    </div>
  );
}

export function Toaster() {
  const toasts = useToasts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-0 top-[calc(var(--topbar-h)+12px)] z-[9999] flex w-full flex-col items-end gap-2 px-4 sm:w-auto sm:px-6"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}
