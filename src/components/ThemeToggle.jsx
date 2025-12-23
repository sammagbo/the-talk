import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Safe localStorage access for iOS Safari
function getStoredTheme() {
    try {
        return localStorage.getItem('theme') || 'dark';
    } catch (e) {
        return 'dark';
    }
}

function setStoredTheme(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch (e) {
        // Ignore storage errors on iOS
    }
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState('dark');
    const [mounted, setMounted] = useState(false);

    // Initialize theme after mount (avoid SSR issues)
    useEffect(() => {
        setTheme(getStoredTheme());
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setStoredTheme(theme);
    }, [theme, mounted]);

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
