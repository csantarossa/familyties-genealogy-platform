'use client';

import { useEffect } from 'react';

export function useTheme(theme) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const root = window.document.documentElement;

        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);
}