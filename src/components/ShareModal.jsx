import React, { useState } from 'react';
import { X, Link as LinkIcon, Twitter, Facebook, Linkedin, Mail, Check, Copy } from 'lucide-react';
import { gsap } from 'gsap';

/**
 * ShareModal - Elegant share dialog with social links and copy URL
 */
export default function ShareModal({ isOpen, onClose, title, url }) {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const socialLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-[#1DA1F2] hover:text-white',
        },
        {
            name: 'Facebook',
            icon: Facebook,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-[#4267B2] hover:text-white',
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
            color: 'hover:bg-[#0A66C2] hover:text-white',
        },
        {
            name: 'Email',
            icon: Mail,
            url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareUrl)}`,
            color: 'hover:bg-[#007BFF] hover:text-white',
        },
    ];

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-white dark:bg-[#111] rounded-2xl p-6 w-full max-w-md mx-4 border border-gray-200 dark:border-[#333] shadow-2xl"
                ref={(el) => {
                    if (el) {
                        gsap.fromTo(
                            el,
                            { opacity: 0, scale: 0.95, y: 20 },
                            { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' }
                        );
                    }
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-creativo font-bold text-black dark:text-white">
                        Partager
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#222] transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Title Preview */}
                <div className="bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-4 mb-6 border border-gray-200 dark:border-[#333]">
                    <p className="text-sm text-gray-600 dark:text-[#6C757D] line-clamp-2">
                        {shareTitle}
                    </p>
                </div>

                {/* Social Links */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-[#0a0a0a] border border-gray-200 dark:border-[#333] transition-all duration-300 ${social.color}`}
                        >
                            <social.icon size={24} />
                            <span className="text-xs font-minimal">{social.name}</span>
                        </a>
                    ))}
                </div>

                {/* Copy URL */}
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#0a0a0a] rounded-xl p-3 border border-gray-200 dark:border-[#333]">
                    <LinkIcon size={18} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        className="flex-1 bg-transparent text-sm text-gray-600 dark:text-[#6C757D] outline-none truncate"
                    />
                    <button
                        onClick={copyToClipboard}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${copied
                                ? 'bg-green-500 text-white'
                                : 'bg-[#007BFF] text-white hover:bg-[#0069d9]'
                            }`}
                    >
                        {copied ? (
                            <span className="flex items-center gap-1">
                                <Check size={14} />
                                Copié!
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Copy size={14} />
                                Copier
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
