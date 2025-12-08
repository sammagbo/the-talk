import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gray-500" />
            <div className="flex gap-1">
                <button
                    onClick={() => changeLanguage('fr')}
                    className={`text-xs font-bold uppercase transition-colors ${i18n.language.startsWith('fr') ? 'text-[#007BFF]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                    FR
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => changeLanguage('en')}
                    className={`text-xs font-bold uppercase transition-colors ${i18n.language.startsWith('en') ? 'text-[#007BFF]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                    EN
                </button>
                <span className="text-gray-300">|</span>
                <button
                    onClick={() => changeLanguage('pt')}
                    className={`text-xs font-bold uppercase transition-colors ${i18n.language.startsWith('pt') ? 'text-[#007BFF]' : 'text-gray-500 hover:text-black dark:hover:text-white'}`}
                >
                    PT
                </button>
            </div>
        </div>
    );
}
