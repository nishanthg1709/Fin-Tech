import React from 'react';
import { Search, X, RotateCcw } from 'lucide-react';

export function FilterBar({
  searchQuery = '',
  onSearchChange,
  filterType = 'ALL',
  onFilterTypeChange,
  selectedCategory = 'ALL',
  onCategoryChange,
  categories = [],
  selectedMerchant = 'ALL',
  onMerchantChange,
  merchants = [],
  amountRange = 'ALL',
  onAmountRangeChange,
  onReset
}) {
  const hasActiveFilters = searchQuery || filterType !== 'ALL' || selectedCategory !== 'ALL' || selectedMerchant !== 'ALL' || amountRange !== 'ALL';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {/* Row 1: Search & Type Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 2, minWidth: '240px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input-text" 
            style={{ paddingLeft: '36px', height: '38px', fontSize: '0.86rem' }}
            placeholder="Search narration, merchant, or category..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        {/* Income / Expense Tabs */}
        <div style={{ display: 'flex', background: '#FAFAF7', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'ALL', label: 'All' },
            { id: 'DEBIT', label: 'Debits (Expenses)' },
            { id: 'CREDIT', label: 'Credits (Income)' }
          ].map(type => (
            <button
              key={type.id}
              type="button"
              onClick={() => onFilterTypeChange(type.id)}
              style={{
                background: filterType === type.id ? 'var(--badge-bg)' : 'transparent',
                color: filterType === type.id ? 'var(--primary)' : 'var(--text-muted)',
                border: filterType === type.id ? '1px solid #D6E7DC' : '1px solid transparent',
                padding: '6px 14px',
                borderRadius: '7px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Category, Merchant, Amount Range */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="input-text"
          style={{ width: 'auto', minWidth: '150px', height: '34px', fontSize: '0.8rem', padding: '4px 10px' }}
        >
          <option value="ALL">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Merchant Dropdown */}
        <select
          value={selectedMerchant}
          onChange={e => onMerchantChange(e.target.value)}
          className="input-text"
          style={{ width: 'auto', minWidth: '150px', height: '34px', fontSize: '0.8rem', padding: '4px 10px' }}
        >
          <option value="ALL">All Merchants</option>
          {merchants.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        {/* Amount Range Dropdown */}
        <select
          value={amountRange}
          onChange={e => onAmountRangeChange(e.target.value)}
          className="input-text"
          style={{ width: 'auto', minWidth: '150px', height: '34px', fontSize: '0.8rem', padding: '4px 10px' }}
        >
          <option value="ALL">All Amounts</option>
          <option value="UNDER_500">Under ₹500</option>
          <option value="500_2000">₹500 – ₹2,000</option>
          <option value="2000_10000">₹2,000 – ₹10,000</option>
          <option value="ABOVE_10000">Above ₹10,000</option>
        </select>

        {/* Reset Filters button */}
        {hasActiveFilters && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.76rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
