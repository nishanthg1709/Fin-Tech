import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Lightbulb,
  Clock,
  ShieldCheck
} from 'lucide-react';

export function InsightCard({
  insight,
  onAction
}) {
  if (!insight) return null;

  // Priority styling map: 'positive' | 'warning' | 'opportunity' | 'important'
  const priorityConfig = {
    positive: {
      badgeClass: 'badge-emerald',
      label: 'Positive Milestone',
      borderColor: '#D6E7DC',
      bgColor: '#FFFFFF',
      icon: CheckCircle2,
      accentColor: 'var(--primary)'
    },
    warning: {
      badgeClass: 'badge-amber',
      label: 'Spending Alert',
      borderColor: '#FDE68A',
      bgColor: '#FFFFFF',
      icon: AlertTriangle,
      accentColor: '#B45309'
    },
    opportunity: {
      badgeClass: 'badge-emerald',
      label: 'Savings Opportunity',
      borderColor: '#D6E7DC',
      bgColor: '#FFFFFF',
      icon: Lightbulb,
      accentColor: 'var(--primary)'
    },
    important: {
      badgeClass: 'badge-rose',
      label: 'Action Recommended',
      borderColor: '#FECDD3',
      bgColor: '#FFFFFF',
      icon: AlertTriangle,
      accentColor: 'var(--accent-rose)'
    }
  };

  const config = priorityConfig[insight.priority] || priorityConfig.positive;
  const Icon = config.icon;

  return (
    <div 
      className="glass-card" 
      style={{ 
        padding: '24px 28px', 
        background: config.bgColor, 
        border: `1px solid ${config.borderColor}`, 
        borderRadius: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}
    >
      {/* Header with Priority Badge and Date/Tag */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${config.badgeClass}`} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
            <Icon size={12} />
            <span>{config.label}</span>
          </span>
          {insight.category && (
            <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
              {insight.category}
            </span>
          )}
        </div>

        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          {insight.timestamp || 'Real-time financial analysis'}
        </span>
      </div>

      {/* Main Headline: What Happened */}
      <div>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 4px 0', letterSpacing: '-0.015em' }}>
          {insight.whatHappened}
        </h4>
      </div>

      {/* Structured Sections: Why It Matters & Recommended Action */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem' }}>
        
        {/* Why it matters */}
        <div style={{
          background: '#FAFAF7',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '12px 14px'
        }}>
          <strong style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '3px' }}>
            Why it matters
          </strong>
          <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.45 }}>
            {insight.whyItMatters}
          </p>
        </div>

        {/* Recommended action */}
        {insight.recommendedAction && (
          <div style={{
            background: 'var(--badge-bg)',
            border: '1px solid #D6E7DC',
            borderRadius: '10px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div>
              <strong style={{ display: 'block', fontSize: '0.74rem', color: 'var(--primary)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                Recommended Action
              </strong>
              <span style={{ color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 500 }}>
                {insight.recommendedAction}
              </span>
            </div>

            {insight.actionText && (
              <button 
                type="button"
                onClick={() => onAction && onAction(insight)}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.74rem', padding: '5px 12px' }}
              >
                <span>{insight.actionText}</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
