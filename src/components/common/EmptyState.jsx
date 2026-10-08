import React from 'react';
import { UploadCloud, ArrowRight } from 'lucide-react';

export function EmptyState({
  icon: Icon = UploadCloud,
  title = "No financial data available",
  description = "Import your transactions to start seeing where your money goes.",
  actionText = "Upload Transactions",
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = ""
}) {
  return (
    <div 
      className={`glass-card ${className}`}
      style={{
        padding: '56px 28px',
        textAlign: 'center',
        background: '#FFFFFF',
        borderRadius: '18px',
        border: '1px solid var(--border-color)',
        maxWidth: '560px',
        margin: '0 auto',
        width: '100%'
      }}
    >
      <div 
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'var(--badge-bg)',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px auto',
          border: '1px solid #D6E7DC'
        }}
      >
        <Icon size={26} color="var(--primary)" />
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 auto 24px auto', maxWidth: '400px' }}>
        {description}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {onAction && actionText && (
          <button 
            type="button"
            onClick={onAction}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <span>{actionText}</span>
            <ArrowRight size={15} />
          </button>
        )}

        {onSecondaryAction && secondaryActionText && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
}
