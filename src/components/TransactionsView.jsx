import React, { useState, useMemo, useEffect } from 'react';
import { 
  Receipt, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight,
  Calendar,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  ArrowUpDown,
  RotateCcw,
  Tag
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { TransactionDrawer, EmptyState } from './common/index.js';

export function TransactionsView({ transactions = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEBIT, CREDIT
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');
  const [amountRange, setAmountRange] = useState('ALL');
  const [selectedAccount, setSelectedAccount] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, THIS_MONTH, LAST_MONTH, LAST_3_MONTHS
  const [reviewFilter, setReviewFilter] = useState('ALL'); // ALL, UNREVIEWED, REVIEWED
  const [sortBy, setSortBy] = useState('DATE_DESC'); // DATE_DESC, DATE_ASC, AMOUNT_DESC, AMOUNT_ASC
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Reviewed transactions set persisted in localStorage
  const [reviewedTxIds, setReviewedTxIds] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_reviewed_txs');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleReviewTx = (tx) => {
    const id = tx.id || tx.transactionId || `${tx.date}-${tx.amount}-${tx.cleanMerchant}`;
    setReviewedTxIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      try {
        localStorage.setItem('smart_expense_reviewed_txs', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  };

  const pageSize = 15;

  // Extract unique categories, merchants, and accounts
  const categories = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [transactions]);

  const merchants = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      const m = t.cleanMerchant || t.merchant;
      if (m) set.add(m);
    });
    return Array.from(set).sort();
  }, [transactions]);

  const accounts = useMemo(() => {
    const set = new Set();
    transactions.forEach(t => {
      const acc = t.account || t.bank || t.paymentMode;
      if (acc) set.add(acc);
    });
    return Array.from(set).sort();
  }, [transactions]);

  // Date boundary calculation helper
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const raw = (tx.rawNarration || tx.raw || tx.description || '').toLowerCase();
      const clean = (tx.cleanMerchant || tx.merchant || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      const q = searchQuery.toLowerCase().trim();

      const isDebit = tx.type === 'DEBIT' || tx.type === 'expense';
      const isCredit = tx.type === 'CREDIT' || tx.type === 'income';

      const matchesSearch = !q || raw.includes(q) || clean.includes(q) || cat.includes(q);
      const matchesType = filterType === 'ALL' || 
        (filterType === 'DEBIT' && isDebit) || 
        (filterType === 'CREDIT' && isCredit) || 
        tx.type === filterType;
      
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory;
      const matchesMerchant = selectedMerchant === 'ALL' || (tx.cleanMerchant || tx.merchant) === selectedMerchant;

      let matchesAmount = true;
      const amt = Number(tx.amount) || 0;
      if (amountRange === 'UNDER_500') matchesAmount = amt < 500;
      else if (amountRange === '500_2000') matchesAmount = amt >= 500 && amt <= 2000;
      else if (amountRange === '2000_10000') matchesAmount = amt > 2000 && amt <= 10000;
      else if (amountRange === 'ABOVE_10000') matchesAmount = amt > 10000;
      
      const acc = tx.account || tx.bank || tx.paymentMode || '';
      const matchesAccount = selectedAccount === 'ALL' || acc === selectedAccount;

      // Date filtering
      let matchesDate = true;
      if (dateFilter !== 'ALL' && tx.date) {
        const txDate = new Date(tx.date);
        if (!isNaN(txDate.getTime())) {
          const txYear = txDate.getFullYear();
          const txMonth = txDate.getMonth();
          if (dateFilter === 'THIS_MONTH') {
            matchesDate = (txYear === currentYear && txMonth === currentMonth);
          } else if (dateFilter === 'LAST_MONTH') {
            const targetMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const targetYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            matchesDate = (txYear === targetYear && txMonth === targetMonth);
          } else if (dateFilter === 'LAST_3_MONTHS') {
            const diffMonths = (currentYear - txYear) * 12 + (currentMonth - txMonth);
            matchesDate = diffMonths >= 0 && diffMonths < 3;
          }
        }
      }

      // Review status filtering
      const txId = tx.id || tx.transactionId || `${tx.date}-${tx.amount}-${tx.cleanMerchant}`;
      const isReviewed = reviewedTxIds.has(txId);
      let matchesReview = true;
      if (reviewFilter === 'REVIEWED') matchesReview = isReviewed;
      else if (reviewFilter === 'UNREVIEWED') matchesReview = !isReviewed;

      return matchesSearch && matchesType && matchesCategory && matchesMerchant && matchesAmount && matchesAccount && matchesDate && matchesReview;
    });
  }, [transactions, searchQuery, filterType, selectedCategory, selectedMerchant, amountRange, selectedAccount, dateFilter, reviewFilter, reviewedTxIds, currentYear, currentMonth]);

  // Sorted transactions
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortBy === 'DATE_DESC') return new Date(b.date || 0) - new Date(a.date || 0);
      if (sortBy === 'DATE_ASC') return new Date(a.date || 0) - new Date(b.date || 0);
      if (sortBy === 'AMOUNT_DESC') return (Number(b.amount) || 0) - (Number(a.amount) || 0);
      if (sortBy === 'AMOUNT_ASC') return (Number(a.amount) || 0) - (Number(b.amount) || 0);
      return 0;
    });
  }, [filtered, sortBy]);

  // Calculate high-level totals across the active filtered dataset
  const stats = useMemo(() => {
    let income = 0;
    let spending = 0;
    filtered.forEach(tx => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'CREDIT' || tx.type === 'income') {
        income += amt;
      } else {
        spending += amt;
      }
    });
    return {
      count: filtered.length,
      income,
      spending,
      net: income - spending
    };
  }, [filtered]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, selectedCategory, selectedMerchant, amountRange, selectedAccount, dateFilter, reviewFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setSelectedCategory('ALL');
    setSelectedMerchant('ALL');
    setAmountRange('ALL');
    setSelectedAccount('ALL');
    setDateFilter('ALL');
    setReviewFilter('ALL');
    setSortBy('DATE_DESC');
  };

  const hasActiveFilters = searchQuery || filterType !== 'ALL' || selectedCategory !== 'ALL' || selectedMerchant !== 'ALL' || amountRange !== 'ALL' || selectedAccount !== 'ALL' || dateFilter !== 'ALL' || reviewFilter !== 'ALL' || sortBy !== 'DATE_DESC';

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No statement transactions found"
        description="Upload a bank statement CSV to view, search, filter, and audit your financial ledger."
        actionText="Upload Statement CSV"
        onAction={() => window.location.pathname = '/upload-transactions'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. TOP HEADER & FINANCIAL SUMMARY BAR */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '24px 28px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '20px' 
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div className="icon-box-mint">
                <Receipt size={18} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
                All <span style={{ color: 'var(--primary)' }}>Transactions</span>
              </h2>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', margin: 0 }}>
              Dense statement inspection ledger with normalized merchant mappings and slide-over audit drawers.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {hasActiveFilters && (
              <button 
                onClick={handleResetFilters}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
              >
                <RotateCcw size={12} />
                <span>Clear Filters</span>
              </button>
            )}
            <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
              {filtered.length} of {transactions.length} Transactions
            </span>
          </div>
        </div>

        {/* Financial Movement 4-Stat Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          background: '#FAFAF7',
          padding: '16px',
          borderRadius: '14px',
          border: '1px solid var(--border-color)'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Filtered Count
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              {stats.count} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>records</span>
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Income
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '2px' }}>
              +{formatINR(stats.income)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Total Spending
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
              -{formatINR(stats.spending)}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Net Movement
            </span>
            <div style={{ 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              color: stats.net >= 0 ? 'var(--primary)' : 'var(--accent-rose)', 
              marginTop: '2px' 
            }}>
              {stats.net >= 0 ? '+' : ''}{formatINR(stats.net)}
            </div>
          </div>
        </div>
      </div>

      {/* 2. DENSE MULTI-FILTER CONTROL BAR */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '18px 24px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}
      >
        {/* Row 1: Search & Type Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '420px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search merchant, narration, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', fontSize: '0.84rem', height: '38px' }}
            />
          </div>

          {/* Type Filter Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[
              { id: 'ALL', label: 'All Types' },
              { id: 'DEBIT', label: 'Debit (Out)' },
              { id: 'CREDIT', label: 'Credit (In)' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setFilterType(t.id)}
                className={`btn btn-sm ${filterType === t.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.76rem', padding: '6px 12px' }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category, Bank/Account, Date, Review, Sort Selects */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '10px',
          fontSize: '0.8rem' 
        }}>
          {/* Category Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Merchant Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Merchant
            </label>
            <select
              value={selectedMerchant}
              onChange={e => setSelectedMerchant(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Merchants</option>
              {merchants.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Amount Range Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Amount Range
            </label>
            <select
              value={amountRange}
              onChange={e => setAmountRange(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Amounts</option>
              <option value="UNDER_500">Under ₹500</option>
              <option value="500_2000">₹500 – ₹2,000</option>
              <option value="2000_10000">₹2,000 – ₹10,000</option>
              <option value="ABOVE_10000">Above ₹10,000</option>
            </select>
          </div>

          {/* Account / Bank Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Account / Bank
            </label>
            <select
              value={selectedAccount}
              onChange={e => setSelectedAccount(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Accounts</option>
              {accounts.map(acc => (
                <option key={acc} value={acc}>{acc}</option>
              ))}
            </select>
          </div>

          {/* Date Period Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Date Range
            </label>
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Statements</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="LAST_MONTH">Last Month</option>
              <option value="LAST_3_MONTHS">Last 3 Months</option>
            </select>
          </div>

          {/* Review Status Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Review Status
            </label>
            <select
              value={reviewFilter}
              onChange={e => setReviewFilter(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="ALL">All Status</option>
              <option value="UNREVIEWED">Unreviewed</option>
              <option value="REVIEWED">Reviewed</option>
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div>
            <label style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="input-text"
              style={{ height: '34px', padding: '4px 8px', fontSize: '0.78rem' }}
            >
              <option value="DATE_DESC">Date: Newest First</option>
              <option value="DATE_ASC">Date: Oldest First</option>
              <option value="AMOUNT_DESC">Amount: Highest First</option>
              <option value="AMOUNT_ASC">Amount: Lowest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. DENSE TRANSACTION LEDGER (DESKTOP TABLE + MOBILE CARDS) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '0px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '18px', 
          overflow: 'hidden' 
        }}
      >
        {/* DESKTOP VIEW: TABLE */}
        <div className="hidden md:block" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>MERCHANT</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>ACCOUNT / MODE</th>
                <th style={{ padding: '13px 20px', fontWeight: 600, textAlign: 'right' }}>AMOUNT</th>
                <th style={{ padding: '13px 20px', fontWeight: 600, textAlign: 'right' }}>AUDIT STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(tx => {
                const isCredit = tx.type === 'CREDIT' || tx.type === 'income';
                const merchant = tx.cleanMerchant || tx.merchant || 'Unknown Merchant';
                const txId = tx.id || tx.transactionId || `${tx.date}-${tx.amount}-${merchant}`;
                const isReviewed = reviewedTxIds.has(txId);
                const accountLabel = tx.account || tx.bank || tx.paymentMode || 'Primary Bank';

                return (
                  <tr 
                    key={txId}
                    onClick={() => setSelectedTransaction(tx)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Click to view details in slide-over drawer"
                  >
                    <td style={{ padding: '13px 20px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {tx.date}
                    </td>

                    <td style={{ padding: '13px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="icon-box-mint" style={{ width: '28px', height: '28px', borderRadius: '7px', fontSize: '0.76rem', fontWeight: 700 }}>
                          {merchant.charAt(0)}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-main)', fontSize: '0.86rem', display: 'block' }}>
                            {merchant}
                          </strong>
                          {tx.rawNarration && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: '240px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {tx.rawNarration}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '13px 20px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                        {tx.category || 'General'}
                      </span>
                    </td>

                    <td style={{ padding: '13px 20px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {accountLabel}
                    </td>

                    <td style={{ padding: '13px 20px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        fontWeight: 700, 
                        fontSize: '0.92rem',
                        color: isCredit ? 'var(--primary)' : 'var(--text-main)' 
                      }}>
                        {isCredit ? '+ ' : '− '}{formatINR(tx.amount)}
                      </span>
                    </td>

                    <td style={{ padding: '13px 20px', textAlign: 'right' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleReviewTx(tx);
                        }}
                        className={`badge ${isReviewed ? 'badge-emerald' : 'badge-muted'}`}
                        style={{ 
                          fontSize: '0.68rem', 
                          padding: '3px 8px', 
                          cursor: 'pointer',
                          border: 'none',
                          background: isReviewed ? 'var(--badge-bg)' : '#EBEFE9'
                        }}
                        title={isReviewed ? 'Click to mark unreviewed' : 'Click to mark reviewed'}
                      >
                        {isReviewed ? '✓ Reviewed' : 'Review'}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No transactions match your search and filter criteria. Try clearing filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* MOBILE VIEW: COMPACT RESPONSIVE CARDS */}
        <div className="block md:hidden" style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {currentItems.map(tx => {
            const isCredit = tx.type === 'CREDIT' || tx.type === 'income';
            const merchant = tx.cleanMerchant || tx.merchant || 'Unknown Merchant';
            const txId = tx.id || tx.transactionId || `${tx.date}-${tx.amount}-${merchant}`;
            const isReviewed = reviewedTxIds.has(txId);
            const accountLabel = tx.account || tx.bank || tx.paymentMode || 'Primary';

            return (
              <div
                key={txId}
                onClick={() => setSelectedTransaction(tx)}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div className="icon-box-mint" style={{ width: '32px', height: '32px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                      {merchant.charAt(0)}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)', display: 'block' }}>
                        {merchant}
                      </strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {tx.date} • {accountLabel}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontWeight: 800, 
                      fontSize: '0.98rem',
                      color: isCredit ? 'var(--primary)' : 'var(--text-main)' 
                    }}>
                      {isCredit ? '+' : '−'}{formatINR(tx.amount)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                    {tx.category || 'General'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReviewTx(tx);
                    }}
                    className={`badge ${isReviewed ? 'badge-emerald' : 'badge-muted'}`}
                    style={{ fontSize: '0.68rem', padding: '3px 8px', cursor: 'pointer', border: 'none' }}
                  >
                    {isReviewed ? '✓ Reviewed' : 'Review'}
                  </button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              No transactions match your filters.
            </div>
          )}
        </div>

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div style={{
            padding: '14px 22px',
            background: '#FAFAF7',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.82rem'
          }}>
            <div style={{ color: 'var(--text-muted)' }}>
              Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> transactions
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 12px', opacity: currentPage === 1 ? 0.45 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              <span style={{ padding: '0 8px', color: 'var(--text-main)', fontWeight: 600 }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
                style={{ padding: '5px 12px', opacity: currentPage === totalPages ? 0.45 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Slide-Over Detail Drawer with immediate review integration */}
      <TransactionDrawer
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
        isReviewed={selectedTransaction ? reviewedTxIds.has(selectedTransaction.id || selectedTransaction.transactionId || `${selectedTransaction.date}-${selectedTransaction.amount}-${selectedTransaction.cleanMerchant}`) : false}
        onToggleReviewed={(tx) => toggleReviewTx(tx)}
      />

    </div>
  );
}
