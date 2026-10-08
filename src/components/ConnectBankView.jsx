import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  FileText
} from 'lucide-react';
import { INSTITUTIONS } from '../data/presetPersonas';
import { sandboxConnector } from '../services/connector/MockSandboxConnector';

export function ConnectBankView({ user, onBankSelected, onNavigate }) {
  // Step state: 'CONNECT_DETAILS' | 'TERMS_AND_CONDITIONS'
  const [currentStep, setCurrentStep] = useState('CONNECT_DETAILS');
  const [selectedInst, setSelectedInst] = useState(INSTITUTIONS[0]); // Default HDFC Bank
  
  // Bank details form
  const [accountNumber, setAccountNumber] = useState('501004924920');
  const [accountHolder, setAccountHolder] = useState(user?.name || 'Rahul Sharma');
  const [accountType, setAccountType] = useState('Savings Account');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBankSelect = (inst) => {
    setSelectedInst(inst);
    if (inst.id === 'hdfc') setIfscCode('HDFC0001234');
    else if (inst.id === 'icici') setIfscCode('ICIC0002468');
    else if (inst.id === 'sbi') setIfscCode('SBIN0009876');
    else if (inst.id === 'axis') setIfscCode('UTIB0005511');
    else setIfscCode('HDFC0001234');
  };

  const handleProceedToTerms = (e) => {
    e.preventDefault();
    if (!accountNumber || accountNumber.length < 8) {
      setError('Please enter a valid account number (at least 8 digits).');
      return;
    }
    setError('');
    setCurrentStep('TERMS_AND_CONDITIONS');
  };

  const handleAcceptTermsAndAnalyze = async () => {
    if (!termsAccepted) {
      setError('Please accept the Terms and Conditions to proceed.');
      return;
    }

    setLoading(true);
    try {
      const masked = `•••• ${accountNumber.slice(-4) || '4920'}`;
      const updatedInst = {
        ...selectedInst,
        maskedAccount: `${accountType} ${masked}`,
        accountNumber: accountNumber,
        accountHolder: accountHolder
      };

      await sandboxConnector.requestConsent({
        institutionId: selectedInst.id,
        scopes: ['TRANSACTIONS', 'BALANCES', 'ACCOUNT_DETAILS']
      });

      const txs = await sandboxConnector.getTransactions();

      onBankSelected(updatedInst, txs);
      setLoading(false);
      onNavigate('/analyze');
    } catch {
      setLoading(false);
      onNavigate('/analyze');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px',
      background: 'var(--bg-page)'
    }}>
      <div className="glass-card" style={{ maxWidth: '660px', width: '100%', padding: '36px' }}>
        
        {/* Progress Header: 4 Steps */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.78rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--primary)' }}>✓ 1 Account</span>
            <span style={{ color: 'var(--primary)' }}>2 Connect</span>
            <span style={{ color: 'var(--text-muted)' }}>3 Analyze</span>
            <span style={{ color: 'var(--text-muted)' }}>4 Dashboard</span>
          </div>

          <div style={{ width: '100%', height: '5px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: '50%',
              height: '100%',
              background: 'var(--primary)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* STEP 1: CONNECT & BANK DETAILS */}
        {currentStep === 'CONNECT_DETAILS' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                Connect your <span style={{ color: 'var(--primary)' }}>bank</span>
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Connect a supported account so we can analyze your transaction history.
              </p>
            </div>

            {/* Zero-Credential Assurance */}
            <div style={{
              background: 'var(--badge-bg)',
              border: '1px solid #D6E7DC',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '22px'
            }}>
              <ShieldCheck size={22} color="var(--primary)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                <strong style={{ color: 'var(--text-main)' }}>No passwords or PINs stored:</strong> We will never ask for your bank password, UPI PIN, ATM PIN, CVV, or OTP.
              </div>
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FECDD3',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#991B1B',
                fontSize: '0.82rem',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            {/* Select Bank list */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                Select Financial Institution
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                {INSTITUTIONS.map(inst => {
                  const isSelected = selectedInst.id === inst.id;
                  return (
                    <div
                      key={inst.id}
                      onClick={() => handleBankSelect(inst)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--badge-bg)' : '#FFFFFF',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: isSelected ? 'var(--primary)' : '#E4E9E3',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: isSelected ? '#FFFFFF' : 'var(--text-main)',
                          fontSize: '0.75rem'
                        }}>
                          {inst.name.charAt(0)}
                        </div>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                          {inst.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Form: Account Number & Bank Details */}
            <form onSubmit={handleProceedToTerms} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  Account Number
                </label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="e.g. 501004928172"
                  value={accountNumber}
                  onChange={e => setAccountNumber(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                    Account Holder Name
                  </label>
                  <input 
                    type="text" 
                    className="input-text" 
                    placeholder="Account Holder Name"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                    Account Type
                  </label>
                  <select 
                    className="input-text"
                    value={accountType}
                    onChange={e => setAccountType(e.target.value)}
                  >
                    <option value="Savings Account">Savings Account</option>
                    <option value="Current Account">Current Account</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-main)', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
                  IFSC Code
                </label>
                <input 
                  type="text" 
                  className="input-text" 
                  placeholder="IFSC Code"
                  value={ifscCode}
                  onChange={e => setIfscCode(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <button type="button" onClick={() => onNavigate('/onboarding')} className="btn btn-secondary">
                  <ArrowLeft size={14} />
                  <span>Back</span>
                </button>
                <button type="submit" className="btn btn-primary">
                  <span>Continue to Terms & Conditions</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  onClick={() => onNavigate('/upload')} 
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileText size={13} color="var(--primary)" />
                  <span>Or upload bank statement CSV directly</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 2: TERMS AND CONDITIONS (IN BETWEEN CONNECT AND ANALYSE) */}
        {currentStep === 'TERMS_AND_CONDITIONS' && (
          <div>
            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <FileText size={22} color="var(--primary)" />
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', margin: 0 }}>
                  Terms and <span style={{ color: 'var(--primary)' }}>Conditions</span>
                </h2>
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                Review and accept data analysis terms before analyzing your transactions.
              </p>
            </div>

            {/* Account Confirmation Banner */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.94rem', color: 'var(--text-main)' }}>
                  {selectedInst.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {accountType} •••• {accountNumber.slice(-4) || '4920'} • IFSC: {ifscCode}
                </div>
              </div>
              <span className="badge badge-emerald">INR (₹)</span>
            </div>

            {/* Terms Content Box */}
            <div style={{
              background: '#FAFAF7',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              maxHeight: '220px',
              overflowY: 'auto',
              marginBottom: '18px',
              lineHeight: 1.6
            }}>
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                1. Read-Only Transaction Scope
              </strong>
              <p style={{ margin: '0 0 12px 0' }}>
                Connection to {selectedInst.name} is granted strictly in read-only mode for historical transaction narrations and balances. The application cannot initiate debits, transfer funds, or cancel subscriptions on your behalf.
              </p>

              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                2. Recurrence & Expense Intelligence
              </strong>
              <p style={{ margin: '0 0 12px 0' }}>
                Transaction data will be analyzed by automated cadence detection algorithms to detect repeating cycles (1 Month, 3 Months, 6 Months, 1 Year), track subscription price increases, and project upcoming payments.
              </p>

              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                3. Unusual Transaction Review
              </strong>
              <p style={{ margin: '0 0 12px 0' }}>
                Charges outside your normal transaction ranges or suspected duplicate payments will be surfaced as recommendations for your personal audit.
              </p>

              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '6px' }}>
                4. Ownership & Instant Revocation
              </strong>
              <p style={{ margin: 0 }}>
                You retain complete control of your account connection and may revoke consent or disconnect the bank at any time from Settings.
              </p>
            </div>

            {/* Checkbox */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={termsAccepted} 
                  onChange={e => setTermsAccepted(e.target.checked)}
                  style={{ marginTop: '3px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <span>I have read and agree to the Terms and Conditions for account data analysis.</span>
              </label>
            </div>

            {error && (
              <div style={{
                background: '#FEE2E2',
                border: '1px solid #FECDD3',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#991B1B',
                fontSize: '0.82rem',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setCurrentStep('CONNECT_DETAILS')} className="btn btn-secondary">
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <button 
                onClick={handleAcceptTermsAndAnalyze} 
                className="btn btn-primary"
                disabled={loading || !termsAccepted}
              >
                <span>{loading ? 'Authorizing...' : 'Accept Terms & Analyze Account'}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
