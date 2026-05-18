"use client";

import { create } from "zustand";

export type ToastVariant = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id" | "duration"> & { duration?: number }) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = crypto.randomUUID();
    const item: ToastItem = {
      id,
      title: t.title,
      description: t.description,
      variant: t.variant,
      duration: t.duration ?? 4500,
    };
    set((s) => ({ toasts: [...s.toasts, item] }));
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

export function useToasts() {
  return useToastStore((s) => s.toasts);
}

export function useToast() {
  const push = useToastStore((s) => s.push);
  const dismiss = useToastStore((s) => s.dismiss);

  return {
    success: (title: string, description?: string, duration?: number) =>
      push({ title, description, variant: "success", duration }),
    error: (title: string, description?: string, duration?: number) =>
      push({ title, description, variant: "error", duration }),
    info: (title: string, description?: string, duration?: number) =>
      push({ title, description, variant: "info", duration }),
    dismiss,
  };
}

export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().push({ title, description, variant: "success", duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().push({ title, description, variant: "error", duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().push({ title, description, variant: "info", duration }),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
