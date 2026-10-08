import React from 'react';
import { 
  PieChart, 
  ChevronRight, 
  ShoppingBag, 
  Utensils, 
  Car, 
  Zap, 
  Film, 
  HeartPulse, 
  Layers, 
  Briefcase,
  Repeat,
  ArrowLeftRight
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

const ICON_MAP = {
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Layers,
  Briefcase,
  Repeat,
  ArrowLeftRight
};

export function SpendingCategoriesCard({
  categories = [],
  totalSpending = 0,
  onNavigate
}) {
  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '26px 28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px' }}>
                <PieChart size={16} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                Top Spending Categories
              </h3>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Expenditure distribution across {categories.length} categories
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate && onNavigate('/spending')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>All Categories</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Categories List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {categories.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || Layers;
            return (
              <div 
                key={cat.name}
                onClick={() => onNavigate && onNavigate('/spending')}
                style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: '#F1F5F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: cat.color || 'var(--primary)'
                    }}>
                      <IconComponent size={13} />
                    </div>
                    <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {cat.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      ({cat.count} txns)
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatINR(cat.amount)}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 600 }}>
                      {cat.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: '6px', background: '#E4E9E3', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      width: `${Math.min(100, Math.max(2, cat.percentage))}%`, 
                      height: '100%', 
                      background: cat.color || 'var(--primary)', 
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info & Link */}
      <div style={{ 
        borderTop: '1px solid var(--border-color)', 
        paddingTop: '12px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        fontSize: '0.76rem',
        color: 'var(--text-muted)'
      }}>
        <span>Total Analyzed: <strong>{formatINR(totalSpending)}</strong></span>
        <span 
          onClick={() => onNavigate && onNavigate('/spending')}
          style={{ color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
        >
          Detailed spending view →
        </span>
      </div>

    </div>
  );
}
