import React from 'react';
import { 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export function FinancialHealth({
  score = 82,
  status = 'GOOD',
  factors = {
    spending: 84,
    savings: 90,
    subscriptions: 68,
    cashBuffer: 86
  },
  explanations = [
    { text: 'Your spending is 12% lower than your 3-month baseline average.', positive: true },
    { text: 'Your emergency liquidity buffer improved by ₹14,200 this cycle.', positive: true },
    { text: 'Subscription costs increased by 8% due to recent Netflix plan changes.', positive: false }
  ]
}) {
  // SVG Radial Ring calculation
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '26px 28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px' 
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
            <ShieldCheck size={16} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            Financial Health
          </h3>
        </div>
        <span className="badge badge-emerald" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
          {status} · {score}/100
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', alignItems: 'center' }}>
        
        {/* Left: Elegant Circular Radial Gauge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', width: '106px', height: '106px', flexShrink: 0 }}>
            <svg width="106" height="106" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle
                cx="53"
                cy="53"
                r={radius}
                stroke="#E4E9E3"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress ring */}
              <circle
                cx="53"
                cy="53"
                r={radius}
                stroke="var(--primary)"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>
                {score}
              </span>
              <span style={{ fontSize: '0.62rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                SCORE
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Financial Health: {status}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
              Calculated dynamically from liquidity buffer, recurring burden, and expenditure velocity.
            </p>
          </div>
        </div>

        {/* Right: Score breakdown bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Spending Stability', value: factors.spending },
            { label: 'Savings & Cushion', value: factors.savings },
            { label: 'Subscription Health', value: factors.subscriptions },
            { label: 'Cash Buffer Runway', value: factors.cashBuffer }
          ].map(bar => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{bar.label}</span>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{bar.value}%</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: '#E4E9E3', borderRadius: '3px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    width: `${bar.value}%`, 
                    height: '100%', 
                    background: bar.value > 80 ? 'var(--primary)' : bar.value > 65 ? '#2D5A4C' : '#B45309',
                    borderRadius: '3px',
                    transition: 'width 0.6s ease'
                  }} 
                />
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Contextual Intelligence: Explain WHY the score exists */}
      <div style={{ marginTop: '22px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '10px' }}>
          Why this score:
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {explanations.map((item, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '8px', 
                fontSize: '0.82rem',
                color: 'var(--text-main)'
              }}
            >
              {item.positive ? (
                <CheckCircle2 size={15} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
              ) : (
                <AlertCircle size={15} color="var(--accent-amber)" style={{ marginTop: '2px', flexShrink: 0 }} />
              )}
              <span style={{ lineHeight: 1.45 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
