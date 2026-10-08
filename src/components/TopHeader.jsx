import React from 'react';
import { 
  Menu, 
  Wallet, 
  UploadCloud, 
  Database, 
  ChevronRight,
  ShieldCheck,
  User,
  ArrowRight
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export function TopHeader({
  currentPath,
  onNavigate,
  onToggleSidebar,
  safeToSpend = 0,
  activeSourceInfo,
  rawCount = 0,
  user
}) {
  // Breadcrumb / title map
  const routeMeta = {
    '/overview': { title: 'Financial Overview', category: 'Command Center' },
    '/dashboard': { title: 'Financial Overview', category: 'Command Center' },
    '/upload-transactions': { title: 'Upload Transactions', category: 'Command Center' },
    '/upload': { title: 'Upload Transactions', category: 'Command Center' },
    '/transactions': { title: 'All Transactions', category: 'Command Center' },
    '/subscriptions': { title: 'Recurring Payments', category: 'Recurring & Bills' },
    '/recurring-payments': { title: 'Recurring Payments', category: 'Recurring & Bills' },
    '/price-changes': { title: 'Price Changes Detected', category: 'Recurring & Bills' },
    '/unusual-transactions': { title: 'Unusual Transactions', category: 'Cash & Intelligence' },
    '/anomalies': { title: 'Unusual Transactions', category: 'Cash & Intelligence' },
    '/spending': { title: 'Spending Summary & Reports', category: 'Cash & Intelligence' },
    '/spending-summary': { title: 'Spending Summary & Reports', category: 'Cash & Intelligence' },
    '/cash-flow': { title: 'Cash Flow Forecast', category: 'Cash & Intelligence' },
    '/insights': { title: 'Personalized Financial Insights', category: 'Cash & Intelligence' },
    '/settings': { title: 'Settings & Bank Connection', category: 'Account' }
  };

  const currentMeta = routeMeta[currentPath] || { title: 'Dashboard', category: 'Home' };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 90,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap'
    }}>
      {/* Left: Mobile hamburger + Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          onClick={onToggleSidebar}
          className="mobile-hamburger-btn"
          title="Open menu"
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px',
            cursor: 'pointer',
            color: 'var(--text-main)'
          }}
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>{currentMeta.category}</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentMeta.title}</span>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Quick KPI pills and Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* Active Data Source Pill */}
        {activeSourceInfo && (
          <div 
            onClick={() => onNavigate('/upload-transactions')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              fontSize: '0.76rem',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
            title="Click to manage CSV dataset"
          >
            <Database size={13} color="var(--primary)" />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeSourceInfo.fileName || 'Uploaded CSV'}
            </span>
            <span className="badge badge-emerald" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
              {rawCount} txns
            </span>
          </div>
        )}

        {/* Safe-to-Spend Pill (Clicking navigates to /cash-flow) */}
        <div 
          onClick={() => onNavigate('/cash-flow')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--badge-bg)',
            border: '1px solid #D6E7DC',
            fontSize: '0.8rem',
            cursor: 'pointer',
            transition: 'transform 0.15s, box-shadow 0.15s'
          }}
          title="Safe-to-Spend: Click to view Cash Flow Forecast"
        >
          <Wallet size={14} color="var(--primary)" />
          <span style={{ color: 'var(--text-muted)' }}>Safe to Spend:</span>
          <strong style={{ color: 'var(--primary)', fontWeight: 800 }}>
            {formatINR(safeToSpend, { decimals: true })}
          </strong>
        </div>

        {/* Upload Transactions Quick Button */}
        <button
          onClick={() => onNavigate('/upload-transactions')}
          className="btn btn-secondary btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
        >
          <UploadCloud size={14} color="var(--primary)" />
          <span>Upload CSV</span>
        </button>

      </div>
    </header>
  );
}
