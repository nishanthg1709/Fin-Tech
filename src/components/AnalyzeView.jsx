import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const ANALYSIS_STEPS = [
  'Fetching transactions...',
  'Cleaning transaction data...',
  'Normalizing merchant names...',
  'Finding recurring payments...',
  'Checking price changes...',
  'Finding unusual transactions...',
  'Building cash-flow forecast...',
  'Generating insights...'
];

export function AnalyzeView({ onComplete, onNavigate }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    if (currentStepIndex < ANALYSIS_STEPS.length) {
      const timer = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, 400);
      return () => clearTimeout(timer);
    } else {
      setIsFinished(true);
    }
  }, [currentStepIndex]);

  const handleGoToDashboard = () => {
    onComplete();
    onNavigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'var(--bg-page)'
    }}>
      <div className="glass-card" style={{ maxWidth: '640px', width: '100%', padding: '40px' }}>
        
        {/* Progress Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary)' }}>✓ 1 Account</span>
            <span style={{ color: 'var(--primary)' }}>✓ 2 Connect</span>
            <span style={{ color: 'var(--primary)' }}>3 Analyze</span>
            <span style={{ color: isFinished ? 'var(--primary)' : 'var(--text-muted)' }}>4 Dashboard</span>
          </div>

          <div style={{ width: '100%', height: '5px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, 75 + (currentStepIndex / ANALYSIS_STEPS.length) * 25)}%`,
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '6px' }}>
            {isFinished ? (
              <>Your spending is <span style={{ color: 'var(--primary)' }}>ready to review</span>.</>
            ) : (
              <>Analyzing your <span style={{ color: 'var(--primary)' }}>transactions...</span></>
            )}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
            {isFinished 
              ? 'We identified your recurring payments, price changes, and cash-flow forecast.'
              : 'Our cadence detection engine is processing your statement history.'}
          </p>
        </div>

        {/* Steps List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          background: '#FAFAF7',
          padding: '20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '28px',
          border: '1px solid var(--border-color)'
        }}>
          {ANALYSIS_STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex && !isFinished;

            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  fontSize: '0.86rem',
                  color: isDone ? 'var(--text-main)' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  fontWeight: isCurrent ? 600 : isDone ? 500 : 400
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={16} color="var(--primary)" />
                ) : isCurrent ? (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    border: '2px solid var(--primary)',
                    borderTopColor: 'transparent',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                ) : (
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#D8DFD7' }} />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Action Button */}
        {isFinished ? (
          <button 
            onClick={handleGoToDashboard}
            className="btn btn-primary btn-lg"
            style={{ width: '100%' }}
          >
            <span>Explore Dashboard</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Processing transaction history...
          </div>
        )}

      </div>
    </div>
  );
}
