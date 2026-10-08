import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2
} from 'lucide-react';
import { INSTITUTIONS } from './data/presetPersonas.js';
import { runFinancialIntelligencePipeline } from './services/engine/processor.js';
import { LandingView } from './components/LandingView.jsx';
import { LoginView } from './components/LoginView.jsx';
import { SignupView } from './components/SignupView.jsx';
import { OnboardingView } from './components/OnboardingView.jsx';
import { ConnectBankView } from './components/ConnectBankView.jsx';
import { AnalyzeView } from './components/AnalyzeView.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { TopHeader } from './components/TopHeader.jsx';
import { DashboardOverview } from './components/DashboardOverview.jsx';
import { UploadTransactionsView } from './components/UploadTransactionsView.jsx';
import { SubscriptionsView } from './components/SubscriptionsView.jsx';
import { PriceChangesView } from './components/PriceChangesView.jsx';
import { AnomaliesView } from './components/AnomaliesView.jsx';
import { SpendingSummaryView } from './components/SpendingSummaryView.jsx';
import { CashFlowView } from './components/CashFlowView.jsx';
import { TransactionsView } from './components/TransactionsView.jsx';
import { InsightsView } from './components/InsightsView.jsx';
import { SettingsView } from './components/SettingsView.jsx';
import { SavingsSimulatorView } from './components/SavingsSimulatorView.jsx';
import { authService, profileService, csvPersistenceService } from './services/supabase.js';

export default function App() {
  // Current route based on window.location.pathname
  const [currentPath, setCurrentPath] = useState(() => {
    const path = window.location.pathname || '/';
    return path;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // User state stored in localStorage
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Connected Bank state
  const [connectedBank, setConnectedBank] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_bank');
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed && parsed.id !== 'demo_bank') {
        return parsed;
      }
      return INSTITUTIONS[0]; // HDFC Bank default
    } catch {
      return INSTITUTIONS[0];
    }
  });

  // Ensure clean forest-green and off-white theme is active
  useEffect(() => {
    document.body.classList.remove('light-mode');
    document.documentElement.removeAttribute('data-theme');
    try {
      localStorage.removeItem('smart_expense_theme');
    } catch {}
  }, []);

  // Active CSV dataset metadata
  const [activeSourceInfo, setActiveSourceInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_active_source');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Active raw transactions dataset:
  const [rawTransactions, setRawTransactions] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_active_transactions');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [];
  });

  const [currentBalance, setCurrentBalance] = useState(78450.0);
  const [globalToast, setGlobalToast] = useState(null);

  // Track reviewed/resolved anomaly alert IDs in state and localStorage
  const [reviewedAnomalyIds, setReviewedAnomalyIds] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_reviewed_anomalies');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Track recurrence overrides (e.g. user manually marking as recurring or not recurring)
  const [recurrenceOverrides, setRecurrenceOverrides] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_recurrence_overrides');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const handleRecurrenceOverrideChange = (merchantName, status) => {
    setRecurrenceOverrides(prev => {
      const updated = { ...prev, [merchantName]: status };
      try {
        localStorage.setItem('smart_expense_recurrence_overrides', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recurrence override:', e);
      }
      return updated;
    });
  };

  const handleMarkAnomalyReviewed = (anomalyId) => {
    setReviewedAnomalyIds(prev => {
      if (prev.includes(anomalyId)) return prev;
      const updated = [...prev, anomalyId];
      try {
        localStorage.setItem('smart_expense_reviewed_anomalies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleUnmarkAnomalyReviewed = (anomalyId) => {
    setReviewedAnomalyIds(prev => {
      const updated = prev.filter(id => id !== anomalyId);
      try {
        localStorage.setItem('smart_expense_reviewed_anomalies', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Analyze transactions handler
  const handleAnalyzeTransactions = async (transactions, metadata) => {
    let activeTxs = transactions;
    if (user?.id) {
      try {
        const remoteTxs = await csvPersistenceService.fetchUserTransactions(user.id);
        if (Array.isArray(remoteTxs) && remoteTxs.length > 0) {
          activeTxs = remoteTxs;
        }
      } catch (err) {
        console.warn('Could not refresh transactions from Supabase:', err);
      }
    }

    setRawTransactions(activeTxs);
    setActiveSourceInfo(metadata);
    try {
      localStorage.setItem('smart_expense_active_transactions', JSON.stringify(activeTxs));
      localStorage.setItem('smart_expense_active_source', JSON.stringify(metadata));
      localStorage.removeItem('smart_expense_reviewed_anomalies');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
    setReviewedAnomalyIds([]);

    // Success notification toast: "{N} transactions analyzed successfully."
    setGlobalToast(`${activeTxs.length} transactions analyzed successfully.`);
    setTimeout(() => {
      setGlobalToast(null);
    }, 4500);

    navigate('/overview');
  };

  // Sync route on popstate (browser back / forward)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Custom client navigation
  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
    setMobileSidebarOpen(false);
  };

  // Run financial intelligence pipeline
  const pipelineData = useMemo(() => {
    return runFinancialIntelligencePipeline(rawTransactions, currentBalance, recurrenceOverrides);
  }, [rawTransactions, currentBalance, recurrenceOverrides]);

  // Compute active anomalies that have not been marked as reviewed
  const activeAnomalies = useMemo(() => {
    return (pipelineData?.anomalies || []).filter(a => !reviewedAnomalyIds.includes(a.id));
  }, [pipelineData?.anomalies, reviewedAnomalyIds]);

  // Session Persistence & Synchronization with Supabase Auth
  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      try {
        const session = await profileService.getCurrentSession();
        if (session?.user && isMounted) {
          const profile = await profileService.getProfile(session.user.id);
          const activeUser = {
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            bankConnected: true
          };
          setUser(activeUser);
          try {
            localStorage.setItem('smart_expense_user', JSON.stringify(activeUser));
          } catch {}

          // Refresh remote transactions from Supabase
          const remoteTxs = await csvPersistenceService.fetchUserTransactions(session.user.id);
          if (Array.isArray(remoteTxs) && remoteTxs.length > 0 && isMounted) {
            setRawTransactions(remoteTxs);
            try {
              localStorage.setItem('smart_expense_active_transactions', JSON.stringify(remoteTxs));
            } catch {}
          }
        }
      } catch (err) {
        console.warn('Session initialization note:', err);
      }
    };

    syncSession();

    const authListener = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await profileService.getProfile(session.user.id);
        const activeUser = {
          id: session.user.id,
          name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email,
          bankConnected: true
        };
        setUser(activeUser);
        try {
          localStorage.setItem('smart_expense_user', JSON.stringify(activeUser));
        } catch {}

        const remoteTxs = await csvPersistenceService.fetchUserTransactions(session.user.id);
        if (Array.isArray(remoteTxs) && remoteTxs.length > 0 && isMounted) {
          setRawTransactions(remoteTxs);
          try {
            localStorage.setItem('smart_expense_active_transactions', JSON.stringify(remoteTxs));
          } catch {}
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setRawTransactions([]);
        try {
          localStorage.removeItem('smart_expense_user');
          localStorage.removeItem('smart_expense_active_transactions');
        } catch {}
      }
    });

    return () => {
      isMounted = false;
      if (authListener?.data?.subscription?.unsubscribe) {
        authListener.data.subscription.unsubscribe();
      }
    };
  }, []);

  // Protected Routes Check (Requiring active authenticated session)
  useEffect(() => {
    const publicRoutes = ['/', '/login', '/signup'];
    if (!user && !publicRoutes.includes(currentPath)) {
      navigate('/login');
    }
  }, [user, currentPath]);

  // Real Supabase Auth Handlers
  const handleLogin = async (credentials) => {
    const result = await authService.signIn({
      email: credentials.email,
      password: credentials.password
    });

    if (!result.success) {
      return { error: result.error };
    }

    const authUser = result.user;
    const profile = result.profile;
    const loggedUser = {
      id: authUser?.id,
      name: profile?.full_name || authUser?.user_metadata?.full_name || credentials.email.split('@')[0],
      email: authUser?.email || credentials.email,
      bankConnected: true
    };

    setUser(loggedUser);
    try {
      localStorage.setItem('smart_expense_user', JSON.stringify(loggedUser));
    } catch {}
    navigate('/overview');
    return { success: true };
  };

  const handleSignup = async (userData) => {
    const result = await authService.signUp({
      email: userData.email,
      password: userData.password,
      fullName: userData.name
    });

    if (!result.success) {
      return { error: result.error };
    }

    const authUser = result.user;
    const newUser = {
      id: authUser?.id || null,
      name: userData.name,
      email: userData.email,
      bankConnected: false
    };

    setUser(newUser);
    try {
      localStorage.setItem('smart_expense_user', JSON.stringify(newUser));
    } catch {}
    navigate('/onboarding');
    return { success: true };
  };

  const handleLogout = async () => {
    await authService.signOut();
    localStorage.removeItem('smart_expense_user');
    localStorage.removeItem('smart_expense_reviewed_anomalies');
    localStorage.removeItem('smart_expense_active_transactions');
    localStorage.removeItem('smart_expense_active_source');
    setReviewedAnomalyIds([]);
    setActiveSourceInfo(null);
    setRawTransactions([]);
    setUser(null);
    navigate('/');
  };

  const handleBankSelected = (inst, txs) => {
    setConnectedBank(inst);
    localStorage.setItem('smart_expense_bank', JSON.stringify(inst));
    if (Array.isArray(txs) && txs.length > 0) {
      setRawTransactions(txs);
      const meta = {
        name: `${inst.name} Statement`,
        count: txs.length,
        size: 'Auto-sync',
        timestamp: new Date().toISOString()
      };
      setActiveSourceInfo(meta);
      try {
        localStorage.setItem('smart_expense_active_transactions', JSON.stringify(txs));
        localStorage.setItem('smart_expense_active_source', JSON.stringify(meta));
      } catch {}
    }
  };

  const handleAnalysisComplete = () => {
    if (user) {
      const updatedUser = { ...user, bankConnected: true };
      setUser(updatedUser);
      localStorage.setItem('smart_expense_user', JSON.stringify(updatedUser));
    }
  };

  const handleDisconnectBank = () => {
    if (user) {
      const updatedUser = { ...user, bankConnected: false };
      setUser(updatedUser);
      localStorage.setItem('smart_expense_user', JSON.stringify(updatedUser));
    }
    setConnectedBank(null);
    setRawTransactions([]);
    setActiveSourceInfo(null);
    localStorage.removeItem('smart_expense_bank');
    localStorage.removeItem('smart_expense_active_transactions');
    localStorage.removeItem('smart_expense_active_source');
    localStorage.removeItem('smart_expense_reviewed_anomalies');
    setReviewedAnomalyIds([]);
    navigate('/connect-bank');
  };

  // ==========================================
  // UNPROTECTED / AUTH SCREENS
  // ==========================================
  if (currentPath === '/') {
    return <LandingView onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginView onLogin={handleLogin} onNavigate={navigate} />;
  }

  if (currentPath === '/signup') {
    return <SignupView onSignup={handleSignup} onNavigate={navigate} />;
  }

  // ==========================================
  // ONBOARDING / CONNECT / ANALYZE SCREENS
  // ==========================================
  if (currentPath === '/onboarding') {
    return <OnboardingView user={user} onNavigate={navigate} />;
  }

  if (currentPath === '/connect-bank') {
    return <ConnectBankView user={user} onBankSelected={handleBankSelected} onNavigate={navigate} />;
  }

  if (currentPath === '/analyze') {
    return <AnalyzeView onComplete={handleAnalysisComplete} onNavigate={navigate} />;
  }

  // ==========================================
  // MULTI-PAGE APPLICATION SHELL WITH PERSISTENT SIDEBAR
  // ==========================================
  return (
    <div className="app-shell">
      
      {/* Persistent Left Sidebar */}
      <Sidebar 
        currentPath={currentPath}
        onNavigate={navigate}
        user={user}
        connectedBank={connectedBank}
        summary={pipelineData.summary}
        priceChangesCount={pipelineData.priceChanges?.length || 0}
        activeAnomaliesCount={activeAnomalies.length}
        rawCount={pipelineData.rawCount || pipelineData.normalizedTransactions?.length || 0}
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Column */}
      <div className="app-main-content">
        
        {/* Top Header Bar */}
        <TopHeader 
          currentPath={currentPath}
          onNavigate={navigate}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          safeToSpend={pipelineData.summary.safeToSpend}
          activeSourceInfo={activeSourceInfo}
          rawCount={pipelineData.rawCount || pipelineData.normalizedTransactions?.length || 0}
          user={user}
        />

        {/* Page Body: Dedicated Route Component */}
        <main className="app-main-body">
          
          {/* 1. /overview (and alias /dashboard) */}
          {(currentPath === '/overview' || currentPath === '/dashboard') && (
            <DashboardOverview 
              user={user}
              pipelineData={{
                ...pipelineData,
                anomalies: activeAnomalies
              }} 
              activeSourceInfo={activeSourceInfo}
              onNavigate={navigate}
            />
          )}

          {/* 2. /upload-transactions (and alias /upload) */}
          {(currentPath === '/upload-transactions' || currentPath === '/upload') && (
            <UploadTransactionsView 
              user={user}
              activeSourceInfo={activeSourceInfo}
              onAnalyzeTransactions={handleAnalyzeTransactions}
              onNavigate={navigate}
            />
          )}

          {/* 3. /subscriptions and alias /recurring-payments */}
          {(currentPath === '/subscriptions' || currentPath === '/recurring-payments') && (
            <SubscriptionsView 
              subscriptions={pipelineData.subscriptions}
              recurringPayments={pipelineData.recurringPayments || pipelineData.subscriptions}
              unconfirmedRepeated={pipelineData.unconfirmedRepeated || []}
              singlePaymentMerchants={pipelineData.singlePaymentMerchants || []}
              priceChanges={pipelineData.priceChanges}
              upcomingBills={pipelineData.upcomingBills}
              summary={pipelineData.summary}
              rawTransactions={rawTransactions}
              onNavigate={navigate}
              onRecurrenceOverrideChange={handleRecurrenceOverrideChange}
            />
          )}

          {/* 4. /price-changes */}
          {currentPath === '/price-changes' && (
            <PriceChangesView 
              priceChanges={pipelineData.priceChanges}
              onNavigate={navigate}
            />
          )}

          {/* 5. /unusual-transactions (and alias /anomalies) */}
          {(currentPath === '/unusual-transactions' || currentPath === '/anomalies') && (
            <AnomaliesView 
              allAnomalies={pipelineData.anomalies}
              anomalies={activeAnomalies}
              reviewedAnomalyIds={reviewedAnomalyIds}
              onMarkReviewed={handleMarkAnomalyReviewed}
              onUnmarkReviewed={handleUnmarkAnomalyReviewed}
            />
          )}

          {/* 6. /spending (and alias /spending-summary) */}
          {(currentPath === '/spending' || currentPath === '/spending-summary') && (
            <SpendingSummaryView 
              user={user}
              connectedBank={connectedBank}
              transactions={pipelineData.normalizedTransactions}
              subscriptions={pipelineData.subscriptions}
              allAnomalies={pipelineData.anomalies}
              reviewedAnomalyIds={reviewedAnomalyIds}
              onNavigate={navigate}
            />
          )}

          {/* 7. /cash-flow */}
          {currentPath === '/cash-flow' && (
            <CashFlowView 
              subscriptions={pipelineData.subscriptions}
              currentBalance={pipelineData.summary.currentBalance}
              transactions={pipelineData.normalizedTransactions}
              summary={pipelineData.summary}
              onNavigate={navigate}
            />
          )}

          {/* 8. /transactions */}
          {currentPath === '/transactions' && (
            <TransactionsView 
              transactions={pipelineData.normalizedTransactions}
            />
          )}

          {/* 9. /insights */}
          {currentPath === '/insights' && (
            <InsightsView 
              subscriptions={pipelineData.subscriptions}
              currentBalance={pipelineData.summary.currentBalance}
              transactions={pipelineData.normalizedTransactions}
              anomalies={activeAnomalies}
              priceChanges={pipelineData.priceChanges}
              onNavigate={navigate}
            />
          )}

          {/* 10. /savings and alias /savings-simulator */}
          {(currentPath === '/savings' || currentPath === '/savings-simulator') && (
            <SavingsSimulatorView 
              subscriptions={pipelineData.subscriptions}
              transactions={pipelineData.normalizedTransactions}
              onNavigate={navigate}
            />
          )}

          {/* 11. /settings */}
          {currentPath === '/settings' && (
            <SettingsView 
              user={user}
              connectedBank={connectedBank}
              onDisconnectBank={handleDisconnectBank}
              onLogout={handleLogout}
            />
          )}

        </main>

        {/* Global Toast Notification */}
        {globalToast && (
          <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '28px',
            zIndex: 9999,
            background: '#203733',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
            border: '1px solid #2F4D46'
          }}>
            <CheckCircle2 size={18} color="#A7F3D0" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{globalToast}</span>
          </div>
        )}

        {/* Simple Footer */}
        <footer style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          padding: '16px 28px',
          background: '#FFFFFF',
          textAlign: 'center',
          fontSize: '0.78rem',
          color: 'var(--text-muted)'
        }}>
          <strong style={{ color: 'var(--text-main)', fontWeight: 600 }}>Smart Expense &amp; Subscriptions Manager</strong> • Personal Financial Intelligence
        </footer>

      </div>

    </div>
  );
}
