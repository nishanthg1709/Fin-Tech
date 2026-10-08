import React, { useState, useMemo } from 'react';
import { 
  Receipt, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  ArrowDownLeft, 
  ArrowUpRight,
  Calendar,
  Building2
} from 'lucide-react';
import { formatINR } from '../utils/formatters.js';
import { FilterBar, TransactionDrawer, EmptyState } from './common/index.js';

export function TransactionsView({ transactions = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, DEBIT, CREDIT
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedMerchant, setSelectedMerchant] = useState('ALL');
  const [amountRange, setAmountRange] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  const pageSize = 15;

  // Extract unique categories and merchants
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

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      const raw = (tx.rawNarration || tx.raw || tx.description || '').toLowerCase();
      const clean = (tx.cleanMerchant || tx.merchant || '').toLowerCase();
      const cat = (tx.category || '').toLowerCase();
      const q = searchQuery.toLowerCase();

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

      return matchesSearch && matchesType && matchesCategory && matchesMerchant && matchesAmount;
    });
  }, [transactions, searchQuery, filterType, selectedCategory, selectedMerchant, amountRange]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, selectedCategory, selectedMerchant, amountRange]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setFilterType('ALL');
    setSelectedCategory('ALL');
    setSelectedMerchant('ALL');
    setAmountRange('ALL');
  };

  if (!transactions || transactions.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No statement transactions found"
        description="Upload a bank statement CSV to view, search, and analyze your financial transactions."
        actionText="Upload Statement CSV"
        onAction={() => window.location.pathname = '/upload-transactions'}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* Header Panel */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '26px 28px', 
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

          <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
            {filtered.length} of {transactions.length} Transactions
          </span>
        </div>

        {/* FilterBar Reusable Component (Section 12 & 19) */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          selectedMerchant={selectedMerchant}
          onMerchantChange={setSelectedMerchant}
          merchants={merchants}
          amountRange={amountRange}
          onAmountRangeChange={setAmountRange}
          onReset={handleResetFilters}
        />
      </div>

      {/* Dense Transaction Table (Section 12) */}
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
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>DATE</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>MERCHANT</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>CATEGORY</th>
                <th style={{ padding: '13px 20px', fontWeight: 600 }}>TYPE</th>
                <th style={{ padding: '13px 20px', fontWeight: 600, textAlign: 'right' }}>AMOUNT</th>
                <th style={{ padding: '13px 20px', fontWeight: 600, textAlign: 'right' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map(tx => {
                const isCredit = tx.type === 'CREDIT' || tx.type === 'income';
                const merchant = tx.cleanMerchant || tx.merchant || 'Unknown Merchant';

                return (
                  <tr 
                    key={tx.id || Math.random()}
                    onClick={() => setSelectedTransaction(tx)}
                    style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title="Click to open slide-over transaction drawer"
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
                          {tx.paymentMode && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              via {tx.paymentMode}
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

                    <td style={{ padding: '13px 20px' }}>
                      <span className={`badge ${isCredit ? 'badge-emerald' : 'badge-muted'}`} style={{ fontSize: '0.68rem' }}>
                        {isCredit ? 'Credit' : 'Debit'}
                      </span>
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
                      <span className="badge badge-emerald" style={{ fontSize: '0.66rem', padding: '1px 7px' }}>
                        Settled
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No transactions found matching your criteria. Try adjusting search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {/* Transaction Slide-Over Detail Drawer (Section 12) */}
      <TransactionDrawer
        transaction={selectedTransaction}
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransaction(null)}
      />

    </div>
  );
}
