import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  ArrowRight, 
  AlertTriangle, 
  X, 
  KeyRound, 
  ExternalLink,
  Cpu,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { INSTITUTIONS } from '../data/presetPersonas';
import { sandboxConnector } from '../services/connector/MockSandboxConnector';

export function ConsentModal({ isOpen, onClose, onBankConnected, currentInstitution }) {
  const [selectedInst, setSelectedInst] = useState(currentInstitution || INSTITUTIONS[0]);
  const [step, setStep] = useState('SELECT_INSTITUTION'); // 'SELECT_INSTITUTION' | 'CONSENT_TERMS' | 'HANDSHAKE'
  const [scopes, setScopes] = useState({
    transactions: true,
    balances: true,
    accountInfo: true
  });
  const [handshakeLogs, setHandshakeLogs] = useState([]);
  const [generatedArtefact, setGeneratedArtefact] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleStartConsent = () => {
    setStep('CONSENT_TERMS');
  };

  const handleAuthorizeAndConnect = async () => {
    setStep('HANDSHAKE');
    setIsProcessing(true);
    setHandshakeLogs(['Initiating FAPI Grade 2 mutual-TLS handshake...']);

    try {
      // 1. Request consent artefact
      await new Promise(r => setTimeout(r, 400));
      setHandshakeLogs(prev => [...prev, `Submitting consent scopes to ${selectedInst.name}...`]);

      const artefact = await sandboxConnector.requestConsent({
        institutionId: selectedInst.id,
        scopes: Object.keys(scopes).filter(k => scopes[k]).map(k => k.toUpperCase()),
        purpose: 'Expense intelligence, subscription cadence tracking, and price-change alerts'
      });
      setGeneratedArtefact(artefact);

      // 2. Exchange token
      await new Promise(r => setTimeout(r, 500));
      setHandshakeLogs(prev => [
        ...prev, 
        `Received cryptographically signed Consent Artefact: ${artefact.consentArtefactId.substring(0, 18)}...`,
        `Exchanging authorization grant for ephemeral read-only access token...`
      ]);

      const authSession = await sandboxConnector.exchangeConsentToken(artefact.consentArtefactId);

      // 3. Final ingestion
      await new Promise(r => setTimeout(r, 600));
      setHandshakeLogs(prev => [
        ...prev, 
        `Connected to ${selectedInst.name} securely. Ingesting 12 months consented transactions...`,
        `Verification complete. Encryption: AES-256-GCM. ZERO credentials stored.`
      ]);

      await new Promise(r => setTimeout(r, 400));
      setIsProcessing(false);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      // Complete
      setTimeout(() => {
        onBankConnected(selectedInst, artefact);
        onClose();
        // Reset state for next time
        setStep('SELECT_INSTITUTION');
        setHandshakeLogs([]);
      }, 1000);

    } catch (err) {
      setHandshakeLogs(prev => [...prev, `Handshake error: ${err.message}`]);
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '680px', padding: '28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
              <Building2 size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', margin: 0 }}>
                {step === 'SELECT_INSTITUTION' && <span>Connect <span className="text-forest">Financial Institution</span></span>}
                {step === 'CONSENT_TERMS' && <span>Explicit <span className="text-forest">Open Banking Consent</span></span>}
                {step === 'HANDSHAKE' && <span>Establishing <span className="text-forest">Cryptographic Connection</span></span>}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Tokenized Open Banking / Account Aggregator Protocol
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

        {/* SECURITY GUARANTEE BANNER */}
        <div style={{
          background: 'var(--badge-bg)',
          border: '1px solid #D2DDD0',
          borderRadius: '12px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldCheck size={24} color="var(--primary)" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
            <strong>Zero-Credential Architecture:</strong> We will{' '}
            <strong style={{ color: 'var(--primary)' }}>NEVER</strong> request or store your bank
            password, PIN, ATM code, OTP, or CVV. Bank connections use consented, read-only tokenization.
          </div>
        </div>

        {/* STEP 1: SELECT INSTITUTION */}
        {step === 'SELECT_INSTITUTION' && (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Choose your banking or financial provider to initiate the Open Banking consent handshake:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {INSTITUTIONS.map(inst => {
                const isSelected = selectedInst.id === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInst(inst)}
                    style={{
                      padding: '16px',
                      borderRadius: '14px',
                      background: isSelected ? 'var(--badge-bg)' : '#FFFFFF',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: isSelected ? 'var(--primary)' : '#E7F3EC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        color: isSelected ? '#FFFFFF' : 'var(--primary)'
                      }}>
                        {inst.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                          {inst.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {inst.country}
                        </div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 size={18} color="var(--primary)" />}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleStartConsent} className="btn btn-primary">
                <span>Continue to Consent Screen</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: OPEN BANKING CONSENT TERMS */}
        {step === 'CONSENT_TERMS' && (
          <div>
            <div style={{
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                  CONSENT ARTEFACT DETAILS
                </div>
                <span className="badge badge-emerald">DRAFT ARTEFACT</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', fontSize: '0.84rem', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Financial Data Provider (FIP):</div>
                  <strong style={{ color: 'var(--text-main)' }}>{selectedInst.name}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Data Consumer:</div>
                  <strong style={{ color: 'var(--text-main)' }}>Smart Expense Manager Inc.</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Access Mode:</div>
                  <strong style={{ color: 'var(--primary)' }}>Read-Only (Zero Debit Auth)</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>Consent Duration:</div>
                  <strong style={{ color: 'var(--text-main)' }}>12 Months (Revocable anytime)</strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '10px' }}>
                  Select Consented Data Permissions:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={scopes.transactions} 
                      onChange={e => setScopes({ ...scopes, transactions: e.target.checked })}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>12 Months Historical Transactions (for subscription cadence &amp; price change detection)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={scopes.balances} 
                      onChange={e => setScopes({ ...scopes, balances: e.target.checked })}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>Current Available Balances (for Safe-to-Spend &amp; cash-flow commitments)</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={scopes.accountInfo} 
                      onChange={e => setScopes({ ...scopes, accountInfo: e.target.checked })}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    <span>Account Metadata (Masked account number and institution name)</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setStep('SELECT_INSTITUTION')} className="btn btn-secondary">
                Back
              </button>
              <button onClick={handleAuthorizeAndConnect} className="btn btn-primary">
                <Lock size={15} />
                <span>Grant Consent &amp; Authorize Connection</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HANDSHAKE & CRYPTOGRAPHIC INGESTION */}
        {step === 'HANDSHAKE' && (
          <div>
            <div style={{
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '18px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--text-main)',
              minHeight: '180px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {handshakeLogs.map((log, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{new Date().toLocaleTimeString()}]</span>
                  <span style={{ color: index === handshakeLogs.length - 1 ? 'var(--primary)' : 'var(--text-main)', fontWeight: index === handshakeLogs.length - 1 ? 600 : 400 }}>
                    {log}
                  </span>
                </div>
              ))}
              {isProcessing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginTop: '8px', fontWeight: 600 }}>
                  <Cpu size={14} className="spin-icon" />
                  <span>Processing secure Open Banking handshake...</span>
                </div>
              )}
            </div>

            {!isProcessing && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700 }}>
                <CheckCircle2 size={20} />
                <span>Connection Established Successfully! Syncing dashboard...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
