"use client";

import Link from 'next/link';
import { Book, ArrowRight, Brain, Languages } from 'lucide-react';
import { useLanguageStore } from '@/lib/languageStore';
import { translations } from '@/lib/translations';
import { motion } from 'framer-motion';

export default function Home() {
  const { language, toggleLanguage } = useLanguageStore();
  const t = translations[language].home;

  return (
    <main className="flex-center flex-col" style={{ minHeight: '100vh', padding: '6rem 1.5rem', position: 'relative', overflow: 'hidden', background: 'var(--bg-secondary)' }}>
      {/* Language Switcher */}
      <button
        onClick={toggleLanguage}
        className="glass-card"
        style={{
          position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 50,
          padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          cursor: 'pointer', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)'
        }}
      >
        <Languages size={18} color="var(--text-secondary)" />
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
          {language === 'zh' ? 'EN' : '中文'}
        </span>
      </button>

      <div style={{ zIndex: 10, width: '100%', maxWidth: '32rem', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ marginBottom: '3rem' }}>
          <div className="flex-center" style={{ marginBottom: '1.5rem' }}>
            <div style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, var(--bg-white), var(--bg-secondary))',
              borderRadius: '2rem',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              display: 'inline-flex',
              position: 'relative'
            }}>
              {/* Decorative background for icon */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '2rem',
                background: 'linear-gradient(135deg, var(--n3-light), transparent)',
                opacity: 0.3
              }} />
              <Book size={64} className="text-gradient-n3" style={{ color: 'var(--n3-primary)', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
            </div>
          </div>
          <h1 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 800 }}>
            {t.title_prefix} <span style={{ color: 'var(--n3-primary)' }}>{t.title_suffix}</span>
          </h1>
          <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
            {t.subtitle}
          </p>
        </div>

        <div className="flex-col" style={{ gap: '1rem', width: '100%' }}>
          {/* Quiz Mode */}
          <Link
            href="/quiz/setup"
            className="glass-card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem', textDecoration: 'none', transition: 'all 0.3s ease' }}
          >
            <div className="flex-center" style={{ gap: '1.25rem' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                background: 'linear-gradient(135deg, var(--text-primary), #2c3e50)', color: 'var(--text-white)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                <Brain size={28} />
              </span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.quiz_title}</h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>{t.quiz_desc}</p>
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--bg-secondary)' }}>
              <ArrowRight size={20} color="var(--text-muted)" />
            </div>
          </Link>

          {/* Learning Center */}
          <Link
            href="/learn"
            className="glass-card"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.75rem', textDecoration: 'none', transition: 'all 0.3s ease' }}
          >
            <div className="flex-center" style={{ gap: '1.25rem' }}>
              <span style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '3.5rem', height: '3.5rem', borderRadius: '1rem',
                background: 'linear-gradient(135deg, var(--bg-secondary), var(--bg-white))', color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <Book size={28} />
              </span>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.learn_title}</h3>
                <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)' }}>{t.learn_desc}</p>
              </div>
            </div>
            <div style={{ padding: '0.5rem', borderRadius: '50%', background: 'var(--bg-secondary)' }}>
              <ArrowRight size={20} color="var(--text-muted)" />
            </div>
          </Link>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none', overflow: 'hidden', opacity: 0.3 }}>
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%', width: '60vh', height: '60vh',
          background: 'var(--n3-light)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-10%', width: '60vh', height: '60vh',
          background: 'var(--n1-light)', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2
        }} />
      </div>
    </main>
  );
}
