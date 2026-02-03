"use client";

import { useQuizStore } from "@/lib/store";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { Play, AlertCircle, ArrowLeft, X } from "lucide-react";
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
    const [showCustomModal, setShowCustomModal] = useState(false);

    const { language } = useLanguageStore();
    const t = translations[language].setup;

    const total = n1 + n2 + n3;

    // Helper to determine active preset
    const getPreset = () => {
        if (n1 === 20 && n2 === 0 && n3 === 0) return 'n1';
        if (n1 === 0 && n2 === 20 && n3 === 0) return 'n2';
        if (n1 === 0 && n2 === 0 && n3 === 20) return 'n3';
        return 'custom';
    };

    const activePreset = getPreset();

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
                style={{ padding: '2rem', maxWidth: '30rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{t.title}</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{t.subtitle}</p>
                </div>

                {/* Selection Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

                    {/* N1 Selection */}
                    <button
                        onClick={() => { setN1(20); setN2(0); setN3(0); }}
                        className={cn("glass-card", activePreset === 'n1' && "ring-2 ring-primary")}
                        style={{
                            padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer',
                            background: activePreset === 'n1' ? 'var(--bg-white)' : 'rgba(255,255,255,0.8)',
                            border: activePreset === 'n1' ? '2px solid var(--n1-primary)' : '2px solid var(--border-color)',
                            boxShadow: activePreset === 'n1' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                            transform: activePreset === 'n1' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            willChange: 'transform, border-color'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--n1-primary)' }}>N1</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>20{t.total_label.replace("總題數", "題").replace("Total Questions", " Qs")}</span>
                    </button>

                    {/* N2 Selection */}
                    <button
                        onClick={() => { setN1(0); setN2(20); setN3(0); }}
                        className={cn("glass-card", activePreset === 'n2' && "ring-2 ring-primary")}
                        style={{
                            padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer',
                            background: activePreset === 'n2' ? 'var(--bg-white)' : 'rgba(255,255,255,0.8)',
                            border: activePreset === 'n2' ? '2px solid var(--n2-primary)' : '2px solid var(--border-color)',
                            boxShadow: activePreset === 'n2' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                            transform: activePreset === 'n2' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            willChange: 'transform, border-color'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--n2-primary)' }}>N2</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>20{t.total_label.replace("總題數", "題").replace("Total Questions", " Qs")}</span>
                    </button>

                    {/* N3 Selection */}
                    <button
                        onClick={() => { setN1(0); setN2(0); setN3(20); }}
                        className={cn("glass-card", activePreset === 'n3' && "ring-2 ring-primary")}
                        style={{
                            padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer',
                            background: activePreset === 'n3' ? 'var(--bg-white)' : 'rgba(255,255,255,0.8)',
                            border: activePreset === 'n3' ? '2px solid var(--n3-primary)' : '2px solid var(--border-color)',
                            boxShadow: activePreset === 'n3' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                            transform: activePreset === 'n3' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            willChange: 'transform, border-color'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--n3-primary)' }}>N3</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>20{t.total_label.replace("總題數", "題").replace("Total Questions", " Qs")}</span>
                    </button>

                    {/* Custom Selection */}
                    <button
                        onClick={() => setShowCustomModal(true)}
                        className={cn("glass-card", activePreset === 'custom' && "ring-2 ring-primary")}
                        style={{
                            padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                            cursor: 'pointer',
                            background: activePreset === 'custom' ? 'var(--bg-white)' : 'rgba(255,255,255,0.8)',
                            border: activePreset === 'custom' ? '2px solid var(--text-primary)' : '2px solid var(--border-color)',
                            boxShadow: activePreset === 'custom' ? 'var(--shadow-lg)' : 'var(--shadow-md)',
                            transform: activePreset === 'custom' ? 'scale(1.02)' : 'scale(1)',
                            transition: 'all 0.2s ease',
                            willChange: 'transform, border-color'
                        }}
                    >
                        <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.custom_btn}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {activePreset === 'custom' ? `${total}/20` : '...'}
                        </span>
                    </button>
                </div>

                {/* Start Button */}
                <button
                    onClick={handleStart}
                    className={cn("btn btn-primary")}
                    style={{
                        width: '100%', justifyContent: 'center', fontSize: '1.1rem', padding: '1rem',
                        marginTop: '1rem',
                        opacity: total !== 20 ? 0.5 : 1,
                        cursor: total !== 20 ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Play fill="currentColor" size={20} />
                    {t.start_btn}
                </button>
            </motion.div>

            {/* Custom Setup Modal */}
            <AnimatePresence>
                {showCustomModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 50,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            padding: '1rem'
                        }}
                        onClick={() => setShowCustomModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="glass-card"
                            style={{
                                width: '100%', maxWidth: '320px', padding: '2rem',
                                boxShadow: 'var(--shadow-xl)',
                                background: 'var(--bg-white)', position: 'relative',
                                display: 'flex', flexDirection: 'column', gap: '1.5rem'
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowCustomModal(false)}
                                style={{
                                    position: 'absolute', top: '1rem', right: '1rem',
                                    padding: '0.5rem', borderRadius: '50%',
                                    background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: 'none', cursor: 'pointer'
                                }}
                            >
                                <X size={20} />
                            </button>

                            <div className="flex-center">
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                    {t.custom_desc}
                                </h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {/* N1 Slider */}
                                <div style={{ width: '100%' }}>
                                    <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                                        <label style={{ fontWeight: 600, color: 'var(--n1-primary)', fontSize: '1rem' }}>{t.n1_label}</label>
                                        <span style={{ fontWeight: 700 }}>({n1})</span>
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
                                        <span style={{ fontWeight: 700 }}>({n2})</span>
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
                                        <span style={{ fontWeight: 700 }}>({n3})</span>
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

                            <div className="flex-between" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{t.total_label}</span>
                                <span style={{
                                    fontSize: '1.25rem', fontWeight: 800,
                                    color: total === 20 ? 'var(--text-primary)' : '#ef4444'
                                }}>
                                    {total} / 20
                                </span>
                            </div>

                            <button
                                onClick={() => setShowCustomModal(false)}
                                className="btn btn-primary"
                                style={{ width: '100%', justifyContent: 'center' }}
                            >
                                {t.submit_btn}
                            </button>

                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
