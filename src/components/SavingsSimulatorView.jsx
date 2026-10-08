import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingDown
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function SavingsSimulatorView({ subscriptions }) {
  const [markedForCancel, setMarkedForCancel] = useState(new Set());
  const [selectedSubForEmail, setSelectedSubForEmail] = useState(subscriptions[0] || null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const toggleCancel = (id) => {
    const next = new Set(markedForCancel);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setMarkedForCancel(next);
  };

  const cancelledSubs = subscriptions.filter(s => markedForCancel.has(s.id));
  const simulatedMonthlySavings = cancelledSubs.reduce((sum, s) => {
    if (s.interval === '1 Month') return sum + s.currentPrice;
    if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
    if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
    if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
    return sum + s.currentPrice;
  }, 0);

  const simulatedAnnualSavings = cancelledSubs.reduce((sum, s) => sum + s.annualCost, 0);

  const getEmailContent = () => {
    if (!selectedSubForEmail) return '';

    return `Subject: Cancellation Request - ${selectedSubForEmail.merchantName} Account

Dear Support Team,

I am writing to formally request the cancellation of my recurring subscription for ${selectedSubForEmail.merchantName}.

Subscription Details:
- Service: ${selectedSubForEmail.merchantName}
- Cadence: ${selectedSubForEmail.interval}
- Current Recurring Charge: ${formatINR(selectedSubForEmail.currentPrice)}

Please ensure that:
1. All recurring auto-debit authorizations linked to my payment method are revoked immediately.
2. No further recurring charges occur after the current paid period.
3. Confirmation of this cancellation is sent to this email address.

Thank you,
Account Holder`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailContent());
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div className="icon-box-mint">
                <TrendingDown size={19} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                Savings Simulator & <span style={{ color: 'var(--primary)' }}>Insights</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Test removing subscriptions to see your estimated monthly and yearly savings
            </p>
          </div>

          <span className="badge badge-emerald">
            {markedForCancel.size} Subscriptions Selected
          </span>
        </div>
      </div>

      {/* KPI Tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Estimated Monthly Savings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            +{formatINR(simulatedMonthlySavings)}/mo
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Immediate monthly cash flow increase
          </div>
        </div>

        <div className="glass-card" style={{ padding: '22px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
            Estimated Annual Savings
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary)' }}>
            +{formatINR(simulatedAnnualSavings)}/yr
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cumulative yearly cost reduction
          </div>
        </div>

      </div>

      {/* TWO COLUMN WORKBENCH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* LEFT: SELECTION LIST */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '16px' }}>
            Select Subscriptions to Cut
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {subscriptions.map(sub => {
              const isSelected = markedForCancel.has(sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => toggleCancel(sub.id)}
                  style={{
                    background: isSelected ? '#FFF5F5' : '#FAFAF7',
                    border: `1px solid ${isSelected ? '#FECDD3' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} 
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: isSelected ? 'line-through' : 'none' }}>
                        {sub.merchantName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {sub.category} • {sub.interval}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.94rem', color: isSelected ? '#BE123C' : 'var(--text-main)' }}>
                      {formatINR(sub.currentPrice)}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {isSelected ? `+Saves ${formatINR(sub.annualCost)}/yr` : `${formatINR(sub.annualCost)}/yr`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CANCELLATION EMAIL ASSISTANT */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0 }}>
              Cancellation Email Template
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Standard template to notify merchants and cancel recurring billing
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Select Service:
            </label>
            <select 
              className="input-text"
              value={selectedSubForEmail?.id || ''}
              onChange={e => {
                const sub = subscriptions.find(s => s.id === e.target.value);
                setSelectedSubForEmail(sub || null);
              }}
              style={{ fontSize: '0.82rem', padding: '8px 12px' }}
            >
              {subscriptions.map(s => (
                <option key={s.id} value={s.id}>{s.merchantName}</option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              rows={8}
              value={getEmailContent()}
              style={{
                width: '100%',
                background: '#FAFAF7',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.78rem',
                padding: '12px',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <button 
              onClick={handleCopyEmail}
              className="btn btn-primary btn-sm"
            >
              {copiedEmail ? <Check size={14} color="#FFFFFF" /> : <Copy size={14} />}
              <span>{copiedEmail ? 'Email Copied!' : 'Copy Email Template'}</span>
            </button>

            {selectedSubForEmail?.cancellationUrl && (
              <a 
                href={selectedSubForEmail.cancellationUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-secondary btn-sm"
              >
                <span>Direct Cancellation Portal</span>
                <ExternalLink size={13} />
              </a>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
