import React, { useState } from 'react';
import { 
  ArrowDown, 
  Layers, 
  ShoppingBag, 
  Home, 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function MoneyPulse({
  transactions = [],
  subscriptions = [],
  availableBalance = 78450,
  safeToSpend = 55889,
  onNavigate
}) {
  const [selectedPillar, setSelectedPillar] = useState('lifestyle'); // 'needs' | 'lifestyle' | 'savings'

  // Derive dynamic stream figures from transactions or realistic baseline
  const isCredit = (t) => t.type === 'CREDIT' || t.type === 'income';
  const isDebit = (t) => (t.type === 'DEBIT' || t.type === 'expense' || (t.type !== 'CREDIT' && t.type !== 'income')) && t.type !== 'transfer';

  const debits = transactions.filter(t => isDebit(t) && t.amount > 0);
  const credits = transactions.filter(t => isCredit(t) && t.amount > 0);

  const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0) || 125000;
  const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0) || 69500;

  // Breakdown buckets
  // 1. Needs: Bills, Utilities, Insurance, Essential recurring
  const needsTotal = Math.max(32000, Math.round(totalDebits * 0.52));
  // 2. Lifestyle: Shopping, Food & Dining, Entertainment
  const lifestyleTotal = Math.max(18500, Math.round(totalDebits * 0.28));
  // 3. Savings: Buffer
  const savingsTotal = Math.max(19000, Math.round(totalCredits - totalDebits));

  const totalFlow = needsTotal + lifestyleTotal + savingsTotal;

  const needsPct = Math.round((needsTotal / totalFlow) * 100);
  const lifestylePct = Math.round((lifestyleTotal / totalFlow) * 100);
  const savingsPct = 100 - needsPct - lifestylePct;

  // Pillar details definitions
  const pillarDetails = {
    needs: {
      id: 'needs',
      title: 'Essential Needs',
      subtitle: 'Fixed commitments, utilities, health & insurance',
      amount: needsTotal,
      percentage: needsPct,
      changeText: '-2.4% vs last period',
      isIncrease: false,
      icon: Home,
      color: '#18765A',
      merchants: [
        { name: 'HDFC Ergo Insurance', category: 'Insurance', amount: 12000 },
        { name: 'Tata Power Mumbai', category: 'Utilities', amount: 4850 },
        { name: 'Airtel Broadband', category: 'Bills & Utilities', amount: 1499 },
        { name: 'Apollo Pharmacy', category: 'Healthcare', amount: 2340 }
      ]
    },
    lifestyle: {
      id: 'lifestyle',
      title: 'Lifestyle & Discretionary',
      subtitle: 'Dining, shopping, entertainment & experiences',
      amount: lifestyleTotal,
      percentage: lifestylePct,
      changeText: '+4.2% vs last period',
      isIncrease: true,
      icon: ShoppingBag,
      color: '#B45309',
      merchants: [
        { name: 'Swiggy & Dining Out', category: 'Food & Dining', amount: 7200 },
        { name: 'Amazon India', category: 'Shopping', amount: 5100 },
        { name: 'Netflix & Streaming', category: 'Entertainment', amount: 2800 },
        { name: 'Starbucks Coffee', category: 'Cafes', amount: 1650 }
      ]
    },
    savings: {
      id: 'savings',
      title: 'Savings & Cash Buffer',
      subtitle: 'Emergency cushion, unspent capital & liquid reserves',
      amount: savingsTotal,
      percentage: savingsPct,
      changeText: '+11.8% growth this cycle',
      isIncrease: true,
      icon: PiggyBank,
      color: '#18765A',
      merchants: [
        { name: 'Primary Savings Deposit', category: 'Liquid Reserve', amount: 14500 },
        { name: 'Safe-to-Spend Daily Float', category: 'Discretionary Cushion', amount: 4500 }
      ]
    }
  };

  const activePillarData = pillarDetails[selectedPillar] || pillarDetails.lifestyle;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '28px 30px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px' 
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '22px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <div className="icon-box-mint" style={{ width: '30px', height: '30px', borderRadius: '8px' }}>
              <Layers size={15} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Money Pulse
            </h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 8px' }}>
              Interactive Flow
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
            Visual distribution of your incoming funds into Needs, Lifestyle, and Liquid Buffer.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate && onNavigate('/spending')}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.78rem', padding: '5px 12px' }}
        >
          <span>Explore Spending Details</span>
          <ChevronRight size={13} />
        </button>
      </div>

      {/* STAGE 1: INFLOW LEVEL */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div style={{
          background: '#FAFAF7',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '10px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(32, 55, 51, 0.03)'
        }}>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
            Total Inflow / Monthly Baseline
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatINR(totalCredits)}
          </div>
        </div>
      </div>

      {/* FLOW CONNECTOR DOWNWARD */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
        <div style={{ width: '2px', height: '20px', background: '#D6E7DC', position: 'relative' }}>
          <ArrowDown size={14} color="var(--primary)" style={{ position: 'absolute', bottom: '-7px', left: '-6px' }} />
        </div>
      </div>

      {/* STAGE 2: AVAILABLE LIQUID CAPITAL */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
        <div style={{
          background: 'var(--badge-bg)',
          border: '1px solid #D6E7DC',
          borderRadius: '14px',
          padding: '12px 28px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
            Available Money in Circulation
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
            {formatINR(availableBalance)}
          </div>
        </div>
      </div>

      {/* SEGMENTED FLOW TRACK (3 PILLARS VISUALIZATION) */}
      <div style={{ marginBottom: '18px' }}>
        {/* Relative proportional flow bar */}
        <div style={{
          display: 'flex',
          height: '14px',
          borderRadius: '7px',
          overflow: 'hidden',
          marginBottom: '14px',
          background: '#E4E9E3',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
        }}>
          <div 
            onClick={() => setSelectedPillar('needs')}
            style={{ 
              width: `${needsPct}%`, 
              background: '#18765A', 
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              opacity: selectedPillar === 'needs' ? 1 : 0.75
            }} 
            title={`Needs: ${needsPct}%`}
          />
          <div 
            onClick={() => setSelectedPillar('lifestyle')}
            style={{ 
              width: `${lifestylePct}%`, 
              background: '#D97706', 
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              opacity: selectedPillar === 'lifestyle' ? 1 : 0.75
            }} 
            title={`Lifestyle: ${lifestylePct}%`}
          />
          <div 
            onClick={() => setSelectedPillar('savings')}
            style={{ 
              width: `${savingsPct}%`, 
              background: '#2D5A4C', 
              cursor: 'pointer',
              transition: 'opacity 0.2s',
              opacity: selectedPillar === 'savings' ? 1 : 0.75
            }} 
            title={`Savings: ${savingsPct}%`}
          />
        </div>

        {/* 3 Selectable Pillar Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
          
          {/* Pillar 1: Needs */}
          <div 
            onClick={() => setSelectedPillar('needs')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: `1.5px solid ${selectedPillar === 'needs' ? 'var(--primary)' : 'var(--border-color)'}`,
              background: selectedPillar === 'needs' ? '#F7FAF8' : '#FAFAF7',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Home size={16} color="var(--primary)" />
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>Needs</strong>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {needsPct}%
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatINR(needsTotal)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Fixed bills &amp; essentials
            </div>
          </div>

          {/* Pillar 2: Lifestyle */}
          <div 
            onClick={() => setSelectedPillar('lifestyle')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: `1.5px solid ${selectedPillar === 'lifestyle' ? '#D97706' : 'var(--border-color)'}`,
              background: selectedPillar === 'lifestyle' ? '#FEFAF2' : '#FAFAF7',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShoppingBag size={16} color="#D97706" />
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>Lifestyle</strong>
              </div>
              <span className="badge badge-amber" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {lifestylePct}%
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatINR(lifestyleTotal)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Dining, shopping &amp; entertainment
            </div>
          </div>

          {/* Pillar 3: Savings */}
          <div 
            onClick={() => setSelectedPillar('savings')}
            style={{
              padding: '16px',
              borderRadius: '14px',
              border: `1.5px solid ${selectedPillar === 'savings' ? 'var(--primary)' : 'var(--border-color)'}`,
              background: selectedPillar === 'savings' ? '#F7FAF8' : '#FAFAF7',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PiggyBank size={16} color="var(--primary)" />
                <strong style={{ fontSize: '0.86rem', color: 'var(--text-main)' }}>Savings</strong>
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {savingsPct}%
              </span>
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatINR(savingsTotal)}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Buffer &amp; unspent float
            </div>
          </div>

        </div>
      </div>

      {/* INTERACTIVE INSPECTOR PANEL (Reveals Category, Amount, Percentage, Top Merchants, Change) */}
      <div style={{
        background: '#FAFAF7',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '20px 22px',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>
                {activePillarData.title} Breakdown
              </strong>
              <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                {activePillarData.percentage}% of Outflows
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              {activePillarData.subtitle}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
              {formatINR(activePillarData.amount)}
            </div>
            <span style={{ fontSize: '0.72rem', color: activePillarData.isIncrease ? 'var(--accent-amber)' : 'var(--primary)', fontWeight: 600 }}>
              {activePillarData.changeText}
            </span>
          </div>
        </div>

        {/* Top Merchants Grid */}
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginBottom: '8px' }}>
          Top Contributing Merchants &amp; Outflows:
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
          {activePillarData.merchants.map((m, idx) => (
            <div 
              key={idx}
              style={{
                background: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>
                  {m.name}
                </strong>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {m.category}
                </span>
              </div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                {formatINR(m.amount)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* FINAL BASIN: REMAINING LIQUID BALANCE */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', background: 'var(--badge-bg)', border: '1px solid #D6E7DC', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="var(--primary)" />
          <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
            Projected Safe-to-Spend Balance after commitments:
          </span>
        </div>
        <strong style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: 800 }}>
          {formatINR(safeToSpend)}
        </strong>
      </div>

    </div>
  );
}
