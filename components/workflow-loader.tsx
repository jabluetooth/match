"use client";

import { useState, useEffect } from "react";

interface WorkflowLoaderProps {
  show: boolean;
  label: string;
  messages?: string[];
}

export function WorkflowLoader({ show, label, messages = [] }: WorkflowLoaderProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!show || messages.length === 0) return;
    setIndex(0);
    setVisible(true);
  }, [show, messages.length]);

  useEffect(() => {
    if (!show || messages.length <= 1) return;

    const cycle = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % messages.length);
        setVisible(true);
      }, 400);
    }, 2800);

    return () => clearInterval(cycle);
  }, [show, messages]);

  if (!show) return null;

  const currentMessage = messages[index] ?? "";

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'color-mix(in oklab, var(--bg) 80%, transparent)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 32,
    }}>
      <div className="orb-wrap" style={{ width: 180, height: 180 }}>
        <div className="orb" style={{ width: 110, height: 110 }} />
        <div className="orb-ring" />
        <div className="orb-ring r2" />
      </div>

      <div style={{ textAlign: 'center', minHeight: 72 }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 400,
          letterSpacing: '-0.02em',
          color: 'var(--ink)',
          margin: '0 0 12px',
          lineHeight: 1.1,
        }}>
          {label}
        </p>

        {messages.length > 0 && (
          <p style={{
            fontSize: 14,
            color: 'var(--ink-3)',
            margin: 0,
            maxWidth: '36ch',
            lineHeight: 1.5,
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}>
            {currentMessage}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: 'var(--primary)',
            opacity: 0.3,
            animation: `loader-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>

      <style>{`
        @keyframes loader-dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(1); }
          40% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
