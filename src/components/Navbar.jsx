import React, { useState } from 'react';
import { 
  Building2, 
  Wallet, 
  User, 
  ChevronDown, 
  LogOut, 
  Settings, 
  ShieldCheck,
  CreditCard,
  UploadCloud
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function Navbar({
  user,
  connectedBank,
  safeToSpend,
  onLogout,
  onNavigate
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: '#FFFFFF',
      borderBottom: '1px solid var(--border-color)',
      padding: '14px 28px'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        {/* Top-Left Brand */}
        <div 
          onClick={() => onNavigate('/dashboard')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
                Smart <span style={{ color: 'var(--primary)' }}>Expense</span>
              </span>
              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                Expense & Subscriptions
              </span>
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, fontWeight: 500 }}>
              & Subscriptions Manager
            </p>
          </div>
        </div>

        {/* Top-Right Info & User Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Connected Bank Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: '#FFFFFF',
            border: '1px solid var(--border-color)',
            fontSize: '0.8rem'
          }}>
            <div className="status-dot status-dot-green" />
            <span style={{ color: 'var(--text-muted)' }}>Connected: </span>
            <strong style={{ color: 'var(--text-main)' }}>
              {connectedBank?.name || 'HDFC Bank'}
            </strong>
            <span style={{ color: 'var(--text-muted)', marginLeft: '2px' }}>
              ({connectedBank?.maskedAccount?.slice(-11) || '•••• 8102'})
            </span>
          </div>

          {/* Safe-to-Spend Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--badge-bg)',
            border: '1px solid #D6E7DC',
            fontSize: '0.8rem'
          }}>
            <Wallet size={15} color="var(--primary)" />
            <span style={{ color: 'var(--text-muted)' }}>Safe to Spend: </span>
            <strong style={{ color: 'var(--primary)' }}>
              {formatINR(safeToSpend, { decimals: true })}
            </strong>
          </div>

          {/* User Menu Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--badge-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--primary)'
              }}>
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{user?.name || 'User'}</span>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {userMenuOpen && (
              <div 
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: '200px',
                  background: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-elevated)',
                  padding: '6px',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || ''}
                  </div>
                </div>

                <div
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('/upload');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <UploadCloud size={14} color="var(--primary)" />
                  <span>Upload CSV</span>
                </div>

                <div
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('/settings');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={14} color="var(--primary)" />
                  <span>Profile</span>
                </div>

                <div
                  onClick={() => {
                    setUserMenuOpen(false);
                    onNavigate('/settings');
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--text-main)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-page)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Settings size={14} color="var(--primary)" />
                  <span>Settings</span>
                </div>

                <div
                  onClick={() => {
                    setUserMenuOpen(false);
                    onLogout();
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.82rem',
                    color: 'var(--accent-rose)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    borderTop: '1px solid var(--border-color)',
                    marginTop: '4px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FFF1F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
