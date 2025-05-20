"use client";
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useUser } from "../contexts/UserContext";

// Safe hook wrapper
export function useSafeToast() {
  const { notificationsEnabled } = useUser();

  return {
    success: (msg, options) =>
      notificationsEnabled ? toast.success(msg, options) : undefined,
    error: (msg, options) =>
      notificationsEnabled ? toast.error(msg, options) : undefined,
    loading: (msg, options) =>
      notificationsEnabled ? toast.loading(msg, options) : undefined,
    dismiss: () => (notificationsEnabled ? toast.dismiss() : undefined),
    raw: (msg, options) =>
      notificationsEnabled ? toast(msg, options) : undefined,
  };
}

// SSR-safe client-only Toaster
export default function SafeToaster() {
  const { notificationsEnabled } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !notificationsEnabled) return null;
  return <Toaster position="bottom-right" />;
}
