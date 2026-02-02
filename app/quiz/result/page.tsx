"use client";

import { useQuizStore } from "@/lib/store";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, RotateCcw, Home } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

export default function QuizResultPage() {
    const router = useRouter();
    const { answers, questions, startQuiz, isPlaying } = useQuizStore();
    const { language } = useLanguageStore();
    const t = translations[language].result;

    // Redirect if no answers (and not playing)
    useEffect(() => {
        if (!isPlaying && answers.length === 0) {
            router.push("/home");
        }
    }, [answers, questions, isPlaying, router]);

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const score = Math.round((correctCount / questions.length) * 100) || 0;

    const handleRestart = () => {
        startQuiz();
        router.push("/quiz/play");
    };

    if (answers.length === 0 && !isPlaying) return null;

    return (
        <main className="flex-center flex-col p-responsive" style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <div className="glass-card animate-slide-up p-card-responsive" style={{ maxWidth: '42rem', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>{t.title}</h1>

                <div style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--n1-primary)', marginBottom: '2rem' }}>
                    {score}%
                </div>

                <div style={{ display: 'grid', gap: '1rem', textAlign: 'left', marginBottom: '3rem' }}>
                    {answers.map((ans, idx) => (
                        <div
                            key={idx}
                            className="p-item-responsive"
                            style={{
                                display: 'flex', alignItems: 'center',
                                background: ans.isCorrect ? '#dcfce7' : '#fee2e2',
                                border: `1px solid ${ans.isCorrect ? '#86efac' : '#fca5a5'}`,
                                borderRadius: 'var(--radius-lg)'
                            }}
                        >
                            {/* Kanji Display - No Box, just Text */}
                            <div className="text-kanji-responsive" style={{
                                fontWeight: 900,
                                fontFamily: 'var(--font-mono)', lineHeight: 1.2,
                                minWidth: '4.5rem', textAlign: 'center',
                                borderRight: `2px solid ${ans.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                paddingRight: '1rem', marginRight: '1rem',
                                color: 'var(--text-primary)'
                            }}>
                                {ans.question.kanji}
                            </div>

                            <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{ans.question.reading}</span>
                                    {ans.isCorrect ?
                                        <CheckCircle size={20} color="#22c55e" /> :
                                        <XCircle size={20} color="#ef4444" />
                                    }
                                </div>
                                <div style={{ color: ans.isCorrect ? '#15803d' : '#b91c1c', fontSize: '1rem', fontWeight: 500 }}>
                                    {ans.question.meaning_zh}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid-responsive">
                    <button
                        onClick={() => router.push('/home')}
                        className="btn btn-outline"
                        style={{ justifyContent: 'center' }}
                    >
                        <Home size={20} />
                        {t.back_home}
                    </button>
                    <button
                        onClick={handleRestart}
                        className="btn btn-primary"
                        style={{ justifyContent: 'center' }}
                    >
                        <RotateCcw size={20} />
                        {t.try_again}
                    </button>
                </div>
            </div>
        </main>
    );
}
