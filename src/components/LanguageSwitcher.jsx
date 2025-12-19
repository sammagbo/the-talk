import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'pt', label: 'PT', flag: '🇧🇷' },
    { code: 'es', label: 'ES', flag: '🇪🇸' }
];

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
                {languages.map((lang, index) => (
                    <React.Fragment key={lang.code}>
                        {index > 0 && <span className="text-gray-300">|</span>}
                        <button
                            onClick={() => changeLanguage(lang.code)}
                            className={`text-xs font-bold uppercase transition-colors flex items-center gap-1 ${i18n.language.startsWith(lang.code)
                                    ? 'text-[#007BFF]'
                                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                                }`}
                            title={lang.label}
                        >
                            <span>{lang.flag}</span>
                            <span className="hidden sm:inline">{lang.label}</span>
                        </button>
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}
