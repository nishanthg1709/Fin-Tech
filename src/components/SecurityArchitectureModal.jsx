import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  FileCheck, 
  Code2, 
  Cpu, 
  X, 
  CheckCircle, 
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

export function SecurityArchitectureModal({ isOpen, onClose, activeConsentArtefact }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '780px', padding: '30px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="icon-box-mint" style={{ width: '46px', height: '46px', borderRadius: '12px' }}>
              <ShieldCheck size={26} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', margin: 0 }}>
                Security &amp; Open Banking <span className="text-forest">Architecture</span>
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                Zero-Credential Storage &amp; Account Aggregator / FAPI Standards
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. NEVER ASK CREDENTIALS PRINCIPLE */}
        <div style={{
          background: '#FEF2F2',
          border: '1px solid #FECDD3',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#991B1B', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>
            <AlertOctagon size={18} />
            <span>Strict Security Rule: What We NEVER Collect or Store</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.82rem', color: '#4B5563' }}>
            <div>❌ Bank Usernames / Passwords</div>
            <div>❌ UPI PINs / ATM PINs</div>
            <div>❌ Debit/Credit Card CVVs</div>
            <div>❌ One-Time Passwords (OTPs)</div>
            <div>❌ Fake Bank Login Portals</div>
            <div>❌ Debit / Money-Moving Permissions</div>
          </div>
        </div>

        {/* 2. THREE-TIER SECURITY SPECIFICATION */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '24px' }}>
          <div style={{
            background: '#FAFAF7',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                <KeyRound size={15} color="var(--primary)" />
              </div>
              <span>Tokenized Access</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Authentication uses scoped OAuth 2.0 / FAPI tokens issued by the banking institution. Smart Expense never touches user master keys.
            </p>
          </div>

          <div style={{
            background: '#FAFAF7',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                <Lock size={15} color="var(--primary)" />
              </div>
              <span>Read-Only Purview</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              The consent contract permits only read-only retrieval of statement transactions and balances. Funds cannot be moved.
            </p>
          </div>

          <div style={{
            background: '#FAFAF7',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '16px'
          }}>
            <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '6px' }}>
                <FileCheck size={15} color="var(--primary)" />
              </div>
              <span>Instant Revocation</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              The user retains complete sovereignty. Consent can be revoked instantly at any moment with 1 click.
            </p>
          </div>
        </div>

        {/* 3. ACTIVE CONSENT ARTEFACT INSPECTOR */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Code2 size={16} color="var(--primary)" />
              Active Consent Artefact Payload (Open Banking / AA Schema)
            </span>
            <span className="badge badge-emerald">VERIFIED VALID</span>
          </div>

          <pre style={{
            background: '#FAFAF7',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '14px 16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--text-main)',
            maxHeight: '180px',
            overflowY: 'auto'
          }}>
            {JSON.stringify(activeConsentArtefact || {
              consentArtefactId: "consent_art_8a92f0_1728362400000",
              cryptoHash: "0x89f2a71d884e92a104c8f...",
              status: "CONSENTED",
              dataConsumer: "Smart Expense & Subscriptions Manager Inc.",
              financialDataProvider: "JPMorgan Chase",
              scopes: ["TRANSACTIONS", "BALANCES", "PROFILE"],
              purpose: "Expense intelligence, subscription cadence tracking, and price-change alerts",
              dataAccessMode: "READ_ONLY",
              frequency: "RECURRING_DAILY_SYNC",
              securityProtocol: "OAuth 2.0 / FAPI Grade 2 + AES-256-GCM",
              credentialsStored: "NONE (Zero-Credential Architecture)",
              revocableAnytime: true
            }, null, 2)}
          </pre>
        </div>

        {/* 4. ADAPTER PATTERN EXPLANATION */}
        <div style={{
          background: 'var(--badge-bg)',
          border: '1px solid #D2DDD0',
          borderRadius: '12px',
          padding: '14px 18px',
          fontSize: '0.82rem',
          color: 'var(--text-main)'
        }}>
          <strong>Plug-and-Play Production Adapter:</strong>
          <p style={{ marginTop: '4px', margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            The application is built around the <code style={{ color: 'var(--primary)', fontWeight: 600 }}>BankConnectorAdapter</code> abstraction.
            The connector architecture can be integrated with live Plaid, UK Open Banking, or Account Aggregator (Setu/Finvu) by supplying API keys
            without changing a single line in the normalization or intelligence engine!
          </p>
        </div>

        <div style={{ marginTop: '22px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Close &amp; Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
