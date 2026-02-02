"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { Question } from "@/lib/data";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/lib/languageStore";
import { translations } from "@/lib/translations";

interface KanjiListProps {
    initialData: Question[];
}

const ITEMS_PER_PAGE = 20;

export default function KanjiList({ initialData }: KanjiListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeLevel, setActiveLevel] = useState<"ALL" | "N1" | "N2" | "N3">("ALL");
    const { language } = useLanguageStore();
    const t = translations[language].learn;

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]);

    const filteredData = useMemo(() => {
        let data = initialData;

        // Filter by Level
        if (activeLevel !== "ALL") {
            data = data.filter((q) => q.level === activeLevel);
        }

        // Filter by Search
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            data = data.filter(
                (q) =>
                    q.kanji.includes(searchTerm) ||
                    q.reading.includes(lowerTerm) ||
                    q.meaning_zh.includes(lowerTerm)
            );
        }

        return data;
    }, [initialData, searchTerm, activeLevel]);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const currentData = filteredData.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, activeLevel]);

    // Pagination Component
    const Pagination = () => (
        <div className="flex-center" style={{ gap: '1rem', padding: '1.5rem 0' }}>
            <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '3rem', height: '3rem', borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-primary)',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    transition: 'var(--transition-base)'
                }}
            >
                <ChevronLeft size={24} color="#1f2937" />
            </button>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
            </span>
            <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '3rem', height: '3rem', borderRadius: '50%',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-white)',
                    color: 'var(--text-primary)',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    transition: 'var(--transition-base)'
                }}
            >
                <ChevronRight size={24} color="#1f2937" />
            </button>
        </div>
    );

    return (
        <div className="container" style={{ paddingBottom: '3rem' }}>
            {/* Header & Search Section */}
            <div className="flex-col flex-center animate-slide-up" style={{ padding: '0 0 2rem 0', gap: '1.5rem', textAlign: 'center' }}>

                <div className="glass" style={{
                    padding: '1.5rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '900px',
                    display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center'
                }}>
                    {/* Level Filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-full)' }}>
                        {(["ALL", "N1", "N2", "N3"] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setActiveLevel(level)}
                                style={{
                                    border: 'none', background: activeLevel === level ? 'var(--bg-white)' : 'transparent',
                                    padding: '0.5rem 1.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600,
                                    color: activeLevel === level ? 'var(--text-primary)' : 'var(--text-secondary)',
                                    boxShadow: activeLevel === level ? 'var(--shadow-sm)' : 'none',
                                    cursor: 'pointer', transition: 'var(--transition-base)'
                                }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input
                            type="text"
                            placeholder={t.search_placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-base"
                            style={{ paddingLeft: '3rem' }}
                        />
                    </div>
                </div>
            </div>

            {/* Top Pagination */}
            {totalPages > 1 && <Pagination />}

            {/* Grid Content */}
            <div style={{ minHeight: '600px' }}>
                {filteredData.length === 0 ? (
                    <div className="flex-center flex-col" style={{ padding: '5rem 0', color: 'var(--text-muted)' }}>
                        <BookOpen size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '1.25rem' }}>No results found.</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid-responsive"
                    >
                        <AnimatePresence mode="popLayout">
                            {currentData.map((item, idx) => (
                                <motion.div
                                    key={`${item.level}-${item.kanji}-${idx}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: idx * 0.03 }}
                                    className="glass-card"
                                    style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}
                                >
                                    <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                                        <span className={cn(
                                            "badge",
                                            item.level === 'N1' && "badge-n1",
                                            item.level === 'N2' && "badge-n2",
                                            item.level === 'N3' && "badge-n3",
                                        )}>
                                            {item.level}
                                        </span>
                                    </div>

                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>{item.kanji}</h2>

                                    <div style={{ textAlign: 'center' }}>
                                        <p style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--n3-primary)', marginBottom: '0.25rem' }}>{item.reading}</p>
                                        <p style={{ color: 'var(--text-secondary)' }}>{item.meaning_zh}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            {/* Bottom Pagination */}
            {totalPages > 1 && <Pagination />}
        </div>
    );
}
