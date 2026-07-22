"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToasts, toast as toastApi, type ToastItem } from "@/hooks/use-toast";

const VARIANT_STYLES: Record<
  ToastItem["variant"],
  {
    icon: React.ElementType;
    iconColor: string;
    accent: string;
    bg: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconColor: "var(--success)",
    accent: "var(--success)",
    bg: "var(--success-soft)",
  },
  error: {
    icon: AlertCircle,
    iconColor: "var(--danger)",
    accent: "var(--danger)",
    bg: "var(--danger-soft)",
  },
  info: {
    icon: Info,
    iconColor: "var(--info)",
    accent: "var(--info)",
    bg: "var(--info-soft)",
  },
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { icon: Icon, iconColor, accent, bg } = VARIANT_STYLES[toast.variant];

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

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-live={toast.variant === "error" ? "assertive" : "polite"}
      style={{
        opacity: open && !leaving ? 1 : 0,
        transform: open && !leaving ? "translateY(0) scale(1)" : "translateY(-12px) scale(0.98)",
        transition: "opacity .22s ease, transform .22s cubic-bezier(.32,.72,.4,1)",
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        minWidth: 320,
        maxWidth: 440,
        padding: "14px 16px",
        paddingLeft: 18,
        background: "rgba(20, 22, 30, 0.92)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        border: "1px solid var(--line)",
        borderRadius: 12,
        boxShadow: "var(--shadow-pop)",
        pointerEvents: "auto",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "grid",
          placeItems: "center",
          width: 28,
          height: 28,
          borderRadius: 8,
          background: bg,
          color: iconColor,
          boxShadow: `0 0 0 1px color-mix(in oklab, ${accent} 35%, transparent), 0 0 14px -3px color-mix(in oklab, ${accent} 65%, transparent)`,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <Icon size={16} strokeWidth={2.4} />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            fontWeight: 600,
            color: "var(--ink)",
            lineHeight: 1.35,
          }}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12.5,
              color: "var(--ink-2)",
              lineHeight: 1.45,
            }}
          >
            {toast.description}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss notification"
        style={{
          border: "none",
          background: "transparent",
          color: "var(--ink-3)",
          cursor: "pointer",
          padding: 4,
          marginRight: -4,
          marginTop: -2,
          display: "grid",
          placeItems: "center",
          borderRadius: 6,
          flexShrink: 0,
        }}
      >
        <X size={14} />
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
      style={{
        position: "fixed",
        top: "calc(var(--header-h, 76px) + 16px)",
        left: 0,
        right: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        pointerEvents: "none",
        padding: "0 16px",
      }}
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </div>
  );
}
