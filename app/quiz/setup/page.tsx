"use client";

import { useQuizStore } from "@/lib/store";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { Play, AlertCircle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function QuizSetupPage() {
    const router = useRouter();
    const { startQuiz, setCounts } = useQuizStore();
    const [n1, setN1] = useState(5);
    const [n2, setN2] = useState(10);
    const [n3, setN3] = useState(5);
    const [warning, setWarning] = useState(false);

    const { language } = useLanguageStore();
    const t = translations[language].setup;

    const total = n1 + n2 + n3;

    // Helper to constrain values
    const updateN1 = (val: number) => {
        const limit = 20 - n2 - n3;
        if (val > limit) {
            setN1(limit);
            setWarning(true);
            setTimeout(() => setWarning(false), 2500);
        } else {
            setN1(val);
        }
    };

    const updateN2 = (val: number) => {
        const limit = 20 - n1 - n3;
        if (val > limit) {
            setN2(limit);
            setWarning(true);
            setTimeout(() => setWarning(false), 2500);
        } else {
            setN2(val);
        }
    };

    const updateN3 = (val: number) => {
        const limit = 20 - n1 - n2;
        if (val > limit) {
            setN3(limit);
            setWarning(true);
            setTimeout(() => setWarning(false), 2500);
        } else {
            setN3(val);
        }
    };

    const handleStart = () => {
        if (total !== 20) {
            setWarning(true);
            setTimeout(() => setWarning(false), 2500);
            return;
        }
        setCounts(n1, n2, n3);
        startQuiz();
        router.push("/quiz/play");
    };

    return (
        <main className="flex-center" style={{ minHeight: '100vh', background: 'var(--bg-secondary)', padding: '1rem', position: 'relative' }}>
            {/* Back Button */}
            <Link
                href="/home"
                className="glass-card"
                style={{
                    position: 'absolute', top: '1rem', left: '1rem',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 1rem', textDecoration: 'none',
                    color: 'var(--text-primary)', fontWeight: 600,
                    zIndex: 20, fontSize: '0.875rem'
                }}
            >
                <ArrowLeft size={16} />
                <span>{t.back}</span>
            </Link>

            {/* Red Toast Notification */}
            <AnimatePresence>
                {warning && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        style={{
                            position: 'fixed', top: '2rem', left: '50%', zIndex: 100,
                            background: '#ef4444', color: 'white', // Explicit Red
                            padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-full)',
                            display: 'flex', alignItems: 'center', gap: '0.5rem',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                            fontWeight: 600, fontSize: '0.9rem'
                        }}
                    >
                        <AlertCircle size={18} />
                        <span>{t.warning_total}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ padding: '2.5rem', maxWidth: '30rem', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t.subtitle}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
                    <button onClick={() => { setN1(20); setN2(0); setN3(0); }} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem' }}>{t.n1_btn}</button>
                    <button onClick={() => { setN1(0); setN2(20); setN3(0); }} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem' }}>{t.n2_btn}</button>
                    <button onClick={() => { setN1(0); setN2(0); setN3(20); }} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem' }}>{t.n3_btn}</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem', width: '100%' }}>
                    {/* N1 Slider */}
                    <div style={{ width: '100%' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 600, color: 'var(--n1-primary)', fontSize: '1rem' }}>{t.n1_label}</label>
                            <span style={{ fontWeight: 700 }}>({n1} 題)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={n1}
                            onChange={(e) => updateN1(Number(e.target.value))}
                            className="slider"
                            style={{ accentColor: 'var(--n1-primary)', width: '100%' }}
                        />
                    </div>

                    {/* N2 Slider */}
                    <div style={{ width: '100%' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 600, color: 'var(--n2-primary)', fontSize: '1rem' }}>{t.n2_label}</label>
                            <span style={{ fontWeight: 700 }}>({n2} 題)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={n2}
                            onChange={(e) => updateN2(Number(e.target.value))}
                            className="slider"
                            style={{ accentColor: 'var(--n2-primary)', width: '100%' }}
                        />
                    </div>

                    {/* N3 Slider */}
                    <div style={{ width: '100%' }}>
                        <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                            <label style={{ fontWeight: 600, color: 'var(--n3-primary)', fontSize: '1rem' }}>{t.n3_label}</label>
                            <span style={{ fontWeight: 700 }}>({n3} 題)</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            value={n3}
                            onChange={(e) => updateN3(Number(e.target.value))}
                            className="slider"
                            style={{ accentColor: 'var(--n3-primary)', width: '100%' }}
                        />
                    </div>
                </div>

                {/* Total & Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex-between" style={{ padding: '1rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontSize: '1rem' }}>{t.total_label}</span>
                        <div className="flex-center" style={{ gap: '0.5rem' }}>
                            <span style={{
                                fontSize: '1.5rem', fontWeight: 800,
                                color: total === 20 ? 'var(--text-primary)' : 'var(--n1-primary)'
                            }}>
                                {total}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>/ 20</span>
                        </div>
                    </div>

                    <button
                        onClick={handleStart}
                        className={cn("btn btn-primary")}
                        style={{
                            width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem',
                            opacity: total !== 20 ? 0.5 : 1,
                            cursor: total !== 20 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <Play fill="currentColor" size={20} />
                        {t.start_btn}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
