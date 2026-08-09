import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

// Safe localStorage access for iOS Safari
function getStoredTheme() {
    try {
        return localStorage.getItem('theme') || 'dark';
    } catch {
        return 'dark';
    }
}

function setStoredTheme(theme) {
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // Ignore storage errors on iOS
    }
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(getStoredTheme);

    // Sync the <html> class and the stored preference whenever the theme changes.
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        setStoredTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-800 dark:text-white"
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
