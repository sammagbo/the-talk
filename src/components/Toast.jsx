import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { Check, X, Info, AlertTriangle, Link as LinkIcon } from 'lucide-react';

// Toast Context
const ToastContext = createContext(null);

// Toast types with their icons and colors
const TOAST_TYPES = {
    success: {
        icon: Check,
        bgColor: 'bg-green-500',
        textColor: 'text-white'
    },
    error: {
        icon: X,
        bgColor: 'bg-red-500',
        textColor: 'text-white'
    },
    info: {
        icon: Info,
        bgColor: 'bg-[#007BFF]',
        textColor: 'text-white'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-500',
        textColor: 'text-black'
    },
    link: {
        icon: LinkIcon,
        bgColor: 'bg-[#007BFF]',
        textColor: 'text-white'
    }
};

// Individual Toast Component
function Toast({ id, type = 'info', message, onClose }) {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, 3000);

        return () => clearTimeout(timer);
    }, [id, onClose]);

    return (
        <div
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
                ${config.bgColor} ${config.textColor}
                animate-slide-in-up backdrop-blur-xl
            `}
            role="alert"
        >
            <Icon size={18} />
            <span className="font-minimal text-sm">{message}</span>
            <button
                onClick={() => onClose(id)}
                className="ml-2 opacity-70 hover:opacity-100 transition-opacity"
            >
                <X size={16} />
            </button>
        </div>
    );
}

// Toast Container Component
function ToastContainer({ toasts, removeToast }) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-[200] flex flex-col gap-2">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={removeToast}
                />
            ))}
        </div>
    );
}

// Toast Provider Component
export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((type, message) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, type, message }]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const toast = {
        success: (message) => addToast('success', message),
        error: (message) => addToast('error', message),
        info: (message) => addToast('info', message),
        warning: (message) => addToast('warning', message),
        link: (message) => addToast('link', message)
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
}

// Custom hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Simple standalone toast function for components outside provider
let toastFn = null;

export function setToastFunction(fn) {
    toastFn = fn;
}

export function showToast(type, message) {
    if (toastFn) {
        toastFn[type](message);
    } else {
        console.log(`[Toast ${type}]: ${message}`);
    }
}

export default Toast;
