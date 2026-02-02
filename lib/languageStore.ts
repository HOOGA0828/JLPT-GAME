import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'zh' | 'en';

interface LanguageState {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'zh', // Default to Chinese
            setLanguage: (lang) => set({ language: lang }),
            toggleLanguage: () => set((state) => ({ language: state.language === 'zh' ? 'en' : 'zh' })),
        }),
        {
            name: 'language-storage',
        }
    )
);
