"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuizStore } from "@/lib/store";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Timer, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function QuizPlayPage() {
    const router = useRouter();
    const {
        questions,
        currentIndex,
        isPlaying,
        answers,
        answerQuestion,
        nextQuestion,
    } = useQuizStore();
    const { language } = useLanguageStore();
    const t = translations[language].play;

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [timer, setTimer] = useState(0);

    // Redirect if not playing or no questions
    useEffect(() => {
        if (!isPlaying || questions.length === 0) {
            router.push("/quiz/setup");
        }
    }, [isPlaying, questions, router]);

    // Timer (Stress-free mode: count up)
    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const currentQuestion = questions[currentIndex];

    // Auto-advance logic
    useEffect(() => {
        if (isAnswered) {
            const timeout = setTimeout(() => {
                handleNext();
            }, 1200); // 1.2s delay for feedback
            return () => clearTimeout(timeout);
        }
    }, [isAnswered]);

    const options = useMemo(() => {
        if (!currentQuestion) return [];
        const allOptions = [currentQuestion.reading, ...currentQuestion.distractors];
        return allOptions.sort(() => 0.5 - Math.random());
    }, [currentQuestion]);

    const handleOptionClick = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
        answerQuestion(option);
        // Auto-advance effect will trigger
    };

    const handleNext = () => {
        setSelectedOption(null);
        setIsAnswered(false);

        if (currentIndex === questions.length - 1) {
            router.push("/quiz/result"); // Navigate to result
        } else {
            nextQuestion(); // Go to next
        }
    };

    const containerRef = useRef<HTMLDivElement>(null);

    const [showQuitModal, setShowQuitModal] = useState(false);

    // Focus on mount to prevent animation throttling
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.focus();
        }
    }, []);

    if (!currentQuestion) return null;

    const isCorrect = selectedOption === currentQuestion.reading;

    return (
        <main
            ref={containerRef}
            tabIndex={-1}
            className="flex-center flex-col"
            style={{
                minHeight: '100vh', background: 'var(--bg-secondary)', padding: '1.5rem',
                position: 'relative', overflow: 'hidden', outline: 'none'
            }}
        >
            {/* Simple Background Gradient instead of heavy blur */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(circle at 50% 30%, rgba(255,255,255,0.4) 0%, transparent 70%)' }} />

            {/* Quit Modal */}
            <AnimatePresence>
                {showQuitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
                            padding: '1rem'
                        }}
                        onClick={() => setShowQuitModal(false)}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="glass-card"
                            style={{
                                width: '100%', maxWidth: '320px', padding: '2rem',
                                textAlign: 'center', boxShadow: 'var(--shadow-xl)',
                                background: 'var(--bg-white)', position: 'relative'
                            }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
                        >
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                                {t.confirm_quit}
                            </h3>
                            <div className="flex-center" style={{ gap: '1rem' }}>
                                <button
                                    onClick={() => setShowQuitModal(false)}
                                    className="btn btn-outline"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                >
                                    {t.cancel}
                                </button>
                                <button
                                    onClick={() => router.push('/home')}
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center', background: '#ef4444', border: 'none' }}
                                >
                                    {t.confirm}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar: Exit, Progress & Timer */}
            <div style={{ width: '100%', maxWidth: '42rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem', zIndex: 10 }}>
                {/* Upper Row: Exit & Timer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <button
                        onClick={() => setShowQuitModal(true)}
                        className="glass-card"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                            cursor: 'pointer', color: 'var(--text-secondary)', padding: 0
                        }}
                    >
                        <X size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                        <Timer size={18} />
                        <span>{Math.floor(timer / 60).toString().padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>

                {/* Progress Bar (Segmented & Colored) */}
                <div style={{ display: 'flex', gap: '4px', width: '100%', height: '8px' }}>
                    {questions.map((_, idx) => {
                        let bg = 'var(--border-color)'; // Default (pending)

                        if (idx < answers.length) {
                            // Answered - Brighter colors requested
                            // Green: #4ade80 (Tailwind Green 400)
                            // Red: #f87171 (Tailwind Red 400)
                            bg = answers[idx].isCorrect ? '#4ade80' : '#f87171';
                        } else if (idx === currentIndex) {
                            // Current Active
                            bg = 'var(--text-primary)';
                        }

                        return (
                            <motion.div
                                key={idx}
                                initial={false}
                                animate={{ backgroundColor: bg }}
                                style={{ flex: 1, borderRadius: '4px', height: '100%' }}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Question Card */}
            <div style={{ width: '100%', maxWidth: '30rem', marginBottom: '2rem', zIndex: 10, position: 'relative' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="glass-card"
                        style={{ padding: '2.5rem', textAlign: 'center', willChange: 'transform, opacity' }}
                    >
                        <span className={cn(
                            "badge",
                            currentQuestion.level === 'N1' && "badge-n1",
                            currentQuestion.level === 'N2' && "badge-n2",
                            currentQuestion.level === 'N3' && "badge-n3",
                        )} style={{ marginBottom: '1.5rem' }}>
                            {currentQuestion.level}
                        </span>

                        <h2 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '2rem', fontFamily: 'var(--font-mono)' }}>
                            {currentQuestion.kanji}
                        </h2>

                        {/* Options */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', width: '100%' }}>
                            {options.map((option, idx) => {
                                const isSelected = selectedOption === option;
                                const isThisCorrect = option === currentQuestion.reading;

                                let bg = 'var(--bg-secondary)';
                                let color = 'var(--text-secondary)';
                                let border = '2px solid transparent';

                                if (isAnswered) {
                                    if (isThisCorrect) {
                                        // Brighter Green for correct
                                        bg = '#dcfce7'; // green-100
                                        border = `2px solid #22c55e`; // green-500
                                        color = '#15803d'; // green-700
                                    } else if (isSelected && !isCorrect) {
                                        // Brighter Red for error
                                        bg = '#fee2e2'; // red-100
                                        border = `2px solid #ef4444`; // red-500
                                        color = '#b91c1c'; // red-700
                                    } else {
                                        // dimmed
                                        color = 'var(--text-muted)';
                                    }
                                } else if (isSelected) {
                                    bg = 'var(--text-primary)';
                                    color = 'white';
                                }

                                return (
                                    <motion.button
                                        key={idx}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleOptionClick(option)}
                                        disabled={isAnswered}
                                        style={{
                                            width: '100%', padding: '1rem', borderRadius: 'var(--radius-lg)',
                                            fontSize: '1.125rem', fontWeight: 500, border: border, background: bg, color: color,
                                            position: 'relative', cursor: isAnswered ? 'default' : 'pointer', transition: 'all 0.2s'
                                        }}
                                    >
                                        {option}
                                        {isAnswered && isThisCorrect && (
                                            <CheckCircle style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#22c55e' }} size={20} />
                                        )}
                                        {isAnswered && isSelected && !isCorrect && (
                                            <XCircle style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#ef4444' }} size={20} />
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </main>
    );
}
