import React, { useState, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  TrendingDown,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { EmptyState } from './common/index.js';

export function SavingsSimulatorView({ 
  subscriptions = [],
  transactions = [],
  onNavigate 
}) {
  const [markedForCancel, setMarkedForCancel] = useState(new Set());
  const [selectedSubForEmail, setSelectedSubForEmail] = useState(subscriptions[0] || null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Synchronize selectedSubForEmail when subscriptions change
  React.useEffect(() => {
    if (subscriptions.length > 0 && !selectedSubForEmail) {
      setSelectedSubForEmail(subscriptions[0]);
    }
  }, [subscriptions, selectedSubForEmail]);

  const toggleCancel = (id) => {
    const next = new Set(markedForCancel);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setMarkedForCancel(next);
  };

  // Base monthly and annual recurring commitment before cuts
  const totalMonthlyCommitment = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + (s.normalizedMonthly || s.currentPrice || 0), 0);
  }, [subscriptions]);

  const totalAnnualCommitment = useMemo(() => {
    return subscriptions.reduce((sum, s) => sum + (s.annualCost || (s.currentPrice * 12)), 0);
  }, [subscriptions]);

  const cancelledSubs = subscriptions.filter(s => markedForCancel.has(s.id));
  
  const simulatedMonthlySavings = cancelledSubs.reduce((sum, s) => {
    if (s.interval === '1 Month') return sum + s.currentPrice;
    if (s.interval === '3 Months') return sum + Math.round(s.currentPrice / 3);
    if (s.interval === '6 Months') return sum + Math.round(s.currentPrice / 6);
    if (s.interval === '1 Year') return sum + Math.round(s.currentPrice / 12);
    return sum + (s.normalizedMonthly || s.currentPrice);
  }, 0);

  const simulatedAnnualSavings = cancelledSubs.reduce((sum, s) => sum + (s.annualCost || (s.currentPrice * 12)), 0);
  const projectedRemainingMonthly = Math.max(0, totalMonthlyCommitment - simulatedMonthlySavings);

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
Primary Account Holder`;
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(getEmailContent());
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <EmptyState
        icon={TrendingDown}
        title="No active subscriptions to simulate"
        description="Upload a bank statement CSV to detect your recurring commitments and simulate monthly savings."
        actionText="Upload Statement CSV"
        onAction={() => onNavigate ? onNavigate('/upload-transactions') : (window.location.pathname = '/upload-transactions')}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div className="icon-box-mint">
                <TrendingDown size={19} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Subscription <span style={{ color: 'var(--primary)' }}>Savings Simulator</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Simulate pruning discretionary recurring commitments to model potential cash-flow recovery.
            </p>
          </div>

          <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
            {markedForCancel.size} of {subscriptions.length} Selected
          </span>
        </div>
      </div>

      {/* KPI Tiles: 4 Metric Projection Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        
        {/* Tile 1: Current Recurring Burn */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Current Monthly Burn
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatINR(totalMonthlyCommitment)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Across {subscriptions.length} recurring mandates
          </div>
        </div>

        {/* Tile 2: Estimated Monthly Savings */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Estimated Monthly Savings
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            +{formatINR(simulatedMonthlySavings)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Immediate liquidity recovery
          </div>
        </div>

        {/* Tile 3: Estimated Annual Savings */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Estimated Annual Savings
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
            +{formatINR(simulatedAnnualSavings)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/yr</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Annualized spending reduction
          </div>
        </div>

        {/* Tile 4: Projected Remaining Commitment */}
        <div className="glass-card" style={{ padding: '20px', background: '#FFFFFF' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '4px' }}>
            Projected Net Outflow
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatINR(projectedRemainingMonthly)}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/mo</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            After simulated cancellations
          </div>
        </div>

      </div>

      {/* Transparent Disclaimer Banner */}
      <div style={{
        background: '#FAFAF7',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <AlertCircle size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Simulation Notice:</strong> All projected calculations are estimates based on your observed billing intervals. Projections do not guarantee future statement outcomes until recurring mandates are revoked with your bank or service provider.
        </span>
      </div>

      {/* TWO COLUMN WORKBENCH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* LEFT: SELECTION LIST */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            Select Subscriptions to Prune
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
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      checked={isSelected} 
                      onChange={() => {}} 
                      style={{ cursor: 'pointer', accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', textDecoration: isSelected ? 'line-through' : 'none' }}>
                        {sub.merchantName}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {sub.category} • {sub.interval}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.94rem', color: isSelected ? '#BE123C' : 'var(--text-main)' }}>
                      {formatINR(sub.currentPrice)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: isSelected ? 'var(--primary)' : 'var(--text-muted)', fontWeight: isSelected ? 600 : 400 }}>
                      {isSelected ? `+Saves ${formatINR(sub.annualCost || (sub.currentPrice * 12))}/yr` : `${formatINR(sub.annualCost || (sub.currentPrice * 12))}/yr`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: CANCELLATION EMAIL ASSISTANT */}
        <div className="glass-panel" style={{ padding: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Cancellation Notice Generator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Standard revocation notice to email merchants and formally cancel recurring auto-debit mandates.
            </p>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
              Select Service:
            </label>
            <select 
              className="input-text"
              value={selectedSubForEmail?.id || ''}
              onChange={e => {
                const sub = subscriptions.find(s => s.id === e.target.value);
                setSelectedSubForEmail(sub || null);
              }}
              style={{ fontSize: '0.84rem', padding: '8px 12px' }}
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
                borderRadius: '10px',
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
              <span>{copiedEmail ? 'Email Copied!' : 'Copy Notice Text'}</span>
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
