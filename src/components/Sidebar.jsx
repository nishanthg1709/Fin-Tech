import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  UploadCloud, 
  Repeat, 
  TrendingUp, 
  AlertTriangle, 
  PieChart, 
  Calendar, 
  Sparkles, 
  Settings as SettingsIcon,
  LogOut,
  Building2,
  X,
  CreditCard
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export function Sidebar({
  currentPath,
  onNavigate,
  user,
  connectedBank,
  summary,
  priceChangesCount = 0,
  activeAnomaliesCount = 0,
  rawCount = 0,
  isOpen = false,
  onClose,
  onLogout
}) {
  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        {
          id: '/overview',
          label: 'Overview',
          icon: LayoutDashboard,
          aliases: ['/dashboard']
        },
        {
          id: '/transactions',
          label: 'Transactions',
          icon: Receipt,
          badge: rawCount > 0 ? `${rawCount}` : null,
          badgeColor: 'badge-muted'
        }
      ]
    },
    {
      title: 'RECURRING & BILLS',
      items: [
        {
          id: '/subscriptions',
          label: 'Recurring Payments',
          icon: Repeat,
          aliases: ['/recurring-payments'],
          badge: (summary?.totalSubscriptionsCount > 0 ? `${summary.totalSubscriptionsCount}` : (summary?.activeSubscriptionsCount > 0 ? `${summary.activeSubscriptionsCount}` : null)),
          badgeColor: 'badge-emerald'
        },
        {
          id: '/price-changes',
          label: 'Price Changes',
          icon: TrendingUp,
          badge: priceChangesCount > 0 ? `+${priceChangesCount}` : null,
          badgeColor: 'badge-rose'
        }
      ]
    },
    {
      title: 'CASH & INTELLIGENCE',
      items: [
        {
          id: '/spending',
          label: 'Spending',
          icon: PieChart,
          aliases: ['/spending-summary']
        },
        {
          id: '/cash-flow',
          label: 'Cash Flow',
          icon: Calendar
        },
        {
          id: '/insights',
          label: 'Insights',
          icon: Sparkles
        },
        {
          id: '/unusual-transactions',
          label: 'Unusual Transactions',
          icon: AlertTriangle,
          badge: activeAnomaliesCount > 0 ? `${activeAnomaliesCount}` : null,
          badgeColor: 'badge-amber',
          aliases: ['/anomalies']
        }
      ]
    },
    {
      title: 'UTILITY & ACCOUNT',
      items: [
        {
          id: '/upload-transactions',
          label: 'Upload Transactions',
          icon: UploadCloud,
          aliases: ['/upload']
        },
        {
          id: '/settings',
          label: 'Settings',
          icon: SettingsIcon
        }
      ]
    }
  ];

  const isItemActive = (item) => {
    if (currentPath === item.id) return true;
    if (item.aliases && item.aliases.includes(currentPath)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(32, 55, 51, 0.45)',
            zIndex: 998,
            display: 'block'
          }}
        />
      )}

      {/* Persistent Sidebar */}
      <aside 
        style={{
          width: '260px',
          height: '100vh',
          background: '#FFFFFF',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 999,
          flexShrink: 0,
          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        className={`app-sidebar ${isOpen ? 'open' : ''}`}
      >
        {/* Brand Header */}
        <div style={{
          padding: '20px 22px 18px 22px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div 
            onClick={() => onNavigate('/overview')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '9px',
              background: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF'
            }}>
              <CreditCard size={18} />
            </div>
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Smart <span style={{ color: 'var(--primary)' }}>Expense</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Subscriptions Manager
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="mobile-close-btn"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'none',
              padding: '4px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Connected Bank Pill */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)', background: '#FAFAF7' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div className="status-dot status-dot-green" />
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {connectedBank?.name || 'HDFC Bank'}
              </span>
            </div>
            <span style={{ color: 'var(--text-muted)' }}>
              {connectedBank?.maskedAccount?.slice(-9) || '•••• 8102'}
            </span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {navSections.map((section, sIdx) => (
            <div key={sIdx}>
              <div style={{
                fontSize: '0.68rem',
                color: 'var(--text-muted)',
                fontWeight: 700,
                letterSpacing: '0.06em',
                padding: '0 10px',
                marginBottom: '6px'
              }}>
                {section.title}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map(item => {
                  const Icon = item.icon;
                  const active = isItemActive(item);

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onNavigate(item.id);
                        if (onClose) onClose();
                      }}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: '10px',
                        fontSize: '0.84rem',
                        fontWeight: active ? 700 : 500,
                        color: active ? 'var(--primary)' : 'var(--text-main)',
                        background: active ? 'var(--badge-bg)' : 'transparent',
                        border: active ? '1px solid #D6E7DC' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => {
                        if (!active) {
                          e.currentTarget.style.background = '#F5F6F2';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!active) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Icon 
                          size={17} 
                          color={active ? 'var(--primary)' : 'var(--text-muted)'} 
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span 
                          className={`badge ${item.badgeColor || 'badge-emerald'}`}
                          style={{ fontSize: '0.66rem', padding: '1px 6px', lineHeight: 1.2 }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile & Logout Footer */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-color)',
          background: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div 
            onClick={() => onNavigate('/settings')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', overflow: 'hidden' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--badge-bg)',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.name || 'Account User'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email || 'user@example.com'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            title="Log Out"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-rose)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>
    </>
  );
}
