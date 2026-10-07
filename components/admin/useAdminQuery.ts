"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/http";

interface QueryState<T> {
  data: T | null;
  error: string | null;
  /** Which `${key}#${version}` the current data/error belongs to. */
  settledFor: string | null;
}

// Minimal fetch-on-mount state for admin screens. Refetches when `key`
// changes (e.g. a filter) or when reload() is called after a write. No
// caching library needed at this size. A 401/403 (session expired) sends
// the admin back to the login page.
export function useAdminQuery<T>(load: () => Promise<T>, key = "") {
  const router = useRouter();
  const [version, setVersion] = useState(0);
  const [state, setState] = useState<QueryState<T>>({ data: null, error: null, settledFor: null });
  const requestId = `${key}#${version}`;

  useEffect(() => {
    let cancelled = false;
    load().then(
      (data) => {
        if (!cancelled) setState({ data, error: null, settledFor: requestId });
      },
      (err: unknown) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          router.replace(`/admin/login?next=${encodeURIComponent(window.location.pathname)}`);
          return;
        }
        if (!cancelled)
          setState((prev) => ({
            data: prev.data,
            error: err instanceof ApiError ? err.message : "Couldn't load this data.",
            settledFor: requestId,
          }));
      }
    );
    return () => {
      cancelled = true;
    };
    // `load` is re-created every render; `requestId` captures when to refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  const setData = useCallback(
    (data: T) => setState((prev) => ({ ...prev, data, error: null })),
    []
  );

  return {
    data: state.data,
    error: state.error,
    loading: state.settledFor !== requestId,
    reload,
    setData,
  };
}
