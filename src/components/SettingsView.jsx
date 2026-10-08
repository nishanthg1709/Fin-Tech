import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  ShieldCheck, 
  LogOut, 
  Bell, 
  Coins, 
  Trash2, 
  CheckCircle2, 
  RefreshCw,
  Sliders,
  Database
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';

export function SettingsView({ 
  user, 
  connectedBank, 
  onDisconnectBank, 
  onLogout 
}) {
  const [notifications, setNotifications] = useState({
    priceHikes: true,
    anomalies: true,
    upcomingRenewals: true,
    weeklyReport: false
  });

  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleClearAlertsCache = () => {
    localStorage.removeItem('smart_expense_reviewed_anomalies');
    showToast('Reviewed alerts cache cleared. Active anomaly count refreshed.');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear active uploaded statement data? You can upload a new CSV anytime.')) {
      localStorage.removeItem('smart_expense_active_transactions');
      localStorage.removeItem('smart_expense_active_source');
      localStorage.removeItem('smart_expense_reviewed_anomalies');
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '880px' }}>
      
      {/* Title Header */}
      <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', margin: '0 0 4px 0' }}>
          Account &amp; Application <span style={{ color: 'var(--primary)' }}>Settings</span>
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          Manage your personal profile, connected financial institutions, alert preferences, and currency settings.
        </p>
      </div>

      {/* 1. USER PROFILE */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div className="icon-box-mint">
            <User size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Profile Information
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
          <div style={{ padding: '14px 16px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Account Name
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
              {user?.name || 'Primary User'}
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Email Address
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
              {user?.email || 'user@example.com'}
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
              Account Security
            </div>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} />
              <span>Consent Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONNECTED BANK ACCOUNT */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div className="icon-box-mint">
            <Building2 size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Connected Bank Account
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
              {connectedBank?.name || 'HDFC Bank'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {connectedBank?.maskedAccount || 'Savings Account •••• 8102'} • Consent status: Active
            </div>
          </div>

          <span className="badge badge-emerald">
            Active Connection
          </span>
        </div>

        <div style={{
          background: 'var(--badge-bg)',
          border: '1px solid #D2DDD0',
          borderRadius: '10px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: 'var(--text-main)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
          <span>Consent mode is read-only. No banking credentials, passwords, or PINs are stored.</span>
        </div>

        <button 
          onClick={onDisconnectBank}
          className="btn btn-secondary btn-sm"
          style={{ color: '#991B1B', borderColor: '#FECDD3', fontSize: '0.8rem' }}
        >
          Disconnect Bank Account
        </button>
      </div>

      {/* 3. NOTIFICATION PREFERENCES */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="icon-box-mint">
            <Bell size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Notification Preferences
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'priceHikes', label: 'Subscription Price Hike Alerts', desc: 'Notify immediately when an existing recurring service raises rates' },
            { key: 'anomalies', label: 'Unusual Transaction & Duplicate Alerts', desc: 'Flag unrecognized spikes or repeated charges on statements' },
            { key: 'upcomingRenewals', label: 'Renewal Reminders (3 Days Prior)', desc: 'Advance notice before recurring annual or quarterly auto-debits' },
            { key: 'weeklyReport', label: 'Weekly Cash Flow Digest', desc: 'Summary of spending trends and Safe-to-Spend runway' }
          ].map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#FAFAF7', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>{item.label}</strong>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.desc}</span>
              </div>
              <input 
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() => {
                  setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }));
                  showToast(`Updated preference for ${item.label}`);
                }}
                style={{ accentColor: 'var(--primary)', width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. CURRENCY & NUMBER FORMATTING */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="icon-box-mint">
            <Coins size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Currency &amp; Localization
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '0.85rem' }}>
          <div style={{ padding: '14px 16px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Active Currency
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
              Indian Rupee (₹ INR)
            </div>
          </div>

          <div style={{ padding: '14px 16px', background: '#FAFAF7', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Number System
            </div>
            <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.95rem' }}>
              Indian Lakhs &amp; Crores (e.g. ₹2,08,229)
            </div>
          </div>
        </div>
      </div>

      {/* 5. DATA MANAGEMENT & SESSION */}
      <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="icon-box-mint">
            <Database size={18} color="var(--primary)" />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
            Account Settings &amp; Data Controls
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px 14px', background: '#FAFAF7', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>Clear Reviewed Alerts Cache</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Restore all previously dismissed anomaly and duplicate notices</span>
            </div>
            <button onClick={handleClearAlertsCache} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              <RefreshCw size={13} />
              <span>Reset Alerts</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px 14px', background: '#FFF5F5', borderRadius: '10px', border: '1px solid #FECDD3' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: '#991B1B', display: 'block' }}>Reset Uploaded Statement Dataset</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Purge locally stored transactions and return to empty upload state</span>
            </div>
            <button onClick={handleResetData} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem', color: '#991B1B', borderColor: '#FECDD3' }}>
              <Trash2 size={13} />
              <span>Reset Dataset</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '12px 14px', background: '#FAFAF7', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            <div>
              <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)', display: 'block' }}>Log Out</strong>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Sign out of your session on this browser</span>
            </div>
            <button onClick={onLogout} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '28px',
          zIndex: 9999,
          background: '#203733',
          color: '#FFFFFF',
          padding: '12px 20px',
          borderRadius: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.16)'
        }}>
          <CheckCircle2 size={16} color="#A7F3D0" />
          <span>{toast}</span>
        </div>
      )}

    </div>
  );
}
