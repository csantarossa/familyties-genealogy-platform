"use client";
import toast from "react-hot-toast";
import { Toaster } from "react-hot-toast";
import { useUser } from "../contexts/UserContext";

export function useSafeToast() {
    const { notificationsEnabled } = useUser();

    return {
        success: (msg, options) => {
            if (notificationsEnabled) toast.success(msg, options);
        },
        error: (msg, options) => {
            if (notificationsEnabled) toast.error(msg, options);
        },
        loading: (msg, options) => {
            if (notificationsEnabled) return toast.loading(msg, options);
        },
        dismiss: () => {
            if (notificationsEnabled) toast.dismiss();
        },
        raw: (msg, options) => {
            if (notificationsEnabled) toast(msg, options);
        },
    };
}

export default function SafeToaster() {
    const { notificationsEnabled } = useUser();
    if (!notificationsEnabled) return null;
    return <Toaster position="bottom-right" />;
}