"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

// Small, accessible toast queue for transient feedback ("Saved to
// wishlist", "Only 3 in stock"). Announced politely via aria-live; errors
// use role="alert". No dependency needed for a few lines of state.
type ToastTone = "success" | "error";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

const ToastContext = createContext<
  ((message: string, tone?: ToastTone) => void) | undefined
>(undefined);

const DURATION_MS = 3500;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((all) => all.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = ++nextId.current;
      // Keep at most 3 on screen; newest last.
      setToasts((all) => [...all.slice(-2), { id, message, tone }]);
      setTimeout(() => dismiss(id), DURATION_MS);
    },
    [dismiss]
  );

  const value = useMemo(() => show, [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-70 flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-md bg-navy-900 px-4 py-3 text-sm font-medium text-neutral-0 shadow-lg"
          >
            {toast.tone === "error" ? (
              <CircleAlert width={18} height={18} className="shrink-0 text-coral-200" />
            ) : (
              <CheckCircle2 width={18} height={18} className="shrink-0 text-success-bg" />
            )}
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(toast.id)}
              className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-200 hover:bg-navy-800 hover:text-neutral-0"
            >
              <X width={16} height={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
