"use client";

import { getAllQuestions } from "@/lib/data";
import KanjiList from "@/components/KanjiList";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LearnPage() {
    const allQuestions = getAllQuestions();
    const { language } = useLanguageStore();
    const t = translations[language].learn;
    const router = useRouter();

    return (
        <main className="flex-col p-responsive" style={{ minHeight: '100vh', background: 'var(--bg-secondary)', position: 'relative' }}>
            {/* Top Navigation */}
            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link
                    href="/home"
                    className="glass-card"
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.75rem 1.25rem', textDecoration: 'none',
                        color: 'var(--text-primary)', fontWeight: 600,
                        zIndex: 20
                    }}
                >
                    <ArrowLeft size={20} />
                    <span>{t.back_home}</span>
                </Link>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.title}</h1>
                <div style={{ width: '80px' }} /> {/* Spacer for centering */}
            </div>

            <KanjiList initialData={allQuestions} />


        </main>
    );
}
