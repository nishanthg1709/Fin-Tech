import React, { useState } from 'react';
import { 
  PieChart, 
  ChevronRight, 
  ChevronDown, 
  ArrowLeft, 
  Receipt, 
  Utensils, 
  ShoppingBag, 
  Car, 
  Film, 
  Zap, 
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';

export function CategoryExplorer({
  transactions = [],
  onSelectTransaction
}) {
  const [selectedCategory, setSelectedCategory] = useState(null); // category object or null
  const [selectedSubCategory, setSelectedSubCategory] = useState(null); // subcategory name or null

  // Pre-configured category breakdown with realistic Indian fintech subcategory distributions
  const categoryData = React.useMemo(() => {
    const isDebit = (t) => (t.type === 'DEBIT' || t.type === 'expense' || (t.type !== 'CREDIT' && t.type !== 'income')) && t.type !== 'transfer';
    const debits = transactions.filter(t => isDebit(t) && t.amount > 0);
    const totalSpent = debits.reduce((sum, t) => sum + t.amount, 0) || 69500;

    return [
      {
        id: 'food',
        name: 'Food & Dining',
        amount: 7200,
        percentage: 19.5,
        icon: Utensils,
        color: '#B45309',
        subcategories: [
          { name: 'Restaurants & Dining Out', amount: 3400, count: 4, merchants: ['Toit Brewpub', 'Punjab Grill', 'Barbeque Nation'] },
          { name: 'Groceries & Staples', amount: 2100, count: 6, merchants: ['Nature Basket', 'Blinkit', 'Zepto'] },
          { name: 'Food Delivery', amount: 1200, count: 5, merchants: ['Swiggy Bangalore', 'Zomato Mumbai'] },
          { name: 'Cafes & Coffee', amount: 500, count: 3, merchants: ['Starbucks Coffee', 'Third Wave Coffee'] }
        ]
      },
      {
        id: 'shopping',
        name: 'Shopping & E-Commerce',
        amount: 5100,
        percentage: 13.8,
        icon: ShoppingBag,
        color: '#18765A',
        subcategories: [
          { name: 'Online Marketplaces', amount: 2850, count: 3, merchants: ['Amazon India', 'Flipkart'] },
          { name: 'Apparel & Fashion', amount: 1650, count: 2, merchants: ['Myntra', 'Zara India'] },
          { name: 'Electronics & Accessories', amount: 600, count: 1, merchants: ['Croma Electronics'] }
        ]
      },
      {
        id: 'entertainment',
        name: 'Subscriptions & Entertainment',
        amount: 2800,
        percentage: 7.6,
        icon: Film,
        color: '#2D5A4C',
        subcategories: [
          { name: 'Video Streaming', amount: 1448, count: 2, merchants: ['Netflix India', 'Amazon Prime Video'] },
          { name: 'Music & Audio', amount: 119, count: 1, merchants: ['Spotify India'] },
          { name: 'Software & Tools', amount: 1233, count: 2, merchants: ['Canva Pro', 'Adobe Creative Cloud'] }
        ]
      },
      {
        id: 'transportation',
        name: 'Transportation & Commute',
        amount: 3200,
        percentage: 8.7,
        icon: Car,
        color: '#74827B',
        subcategories: [
          { name: 'Ride Hailing', amount: 2100, count: 8, merchants: ['Uber India', 'Ola Cabs'] },
          { name: 'Fuel & Gas', amount: 900, count: 1, merchants: ['Indian Oil Petrol'] },
          { name: 'Transit & Metro', amount: 200, count: 4, merchants: ['Metro Smart Card'] }
        ]
      },
      {
        id: 'bills',
        name: 'Bills & Utilities',
        amount: 6349,
        percentage: 17.2,
        icon: Zap,
        color: '#18765A',
        subcategories: [
          { name: 'Electricity & Power', amount: 4850, count: 1, merchants: ['Tata Power Mumbai'] },
          { name: 'Broadband & Mobile', amount: 1499, count: 1, merchants: ['Airtel Broadband'] }
        ]
      }
    ];
  }, [transactions]);

  // Handle drill down
  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setSelectedSubCategory(null);
  };

  const handleBackToAll = () => {
    setSelectedCategory(null);
    setSelectedSubCategory(null);
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '28px', 
        background: '#FFFFFF', 
        border: '1px solid var(--border-color)', 
        borderRadius: '20px' 
      }}
    >
      {/* Explorer Header with Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          {/* Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            <span 
              onClick={handleBackToAll}
              style={{ cursor: selectedCategory ? 'pointer' : 'default', color: selectedCategory ? 'var(--primary)' : 'var(--text-muted)', fontWeight: 600 }}
            >
              All Categories
            </span>
            {selectedCategory && (
              <>
                <ChevronRight size={13} />
                <span 
                  onClick={() => setSelectedSubCategory(null)}
                  style={{ cursor: selectedSubCategory ? 'pointer' : 'default', color: selectedSubCategory ? 'var(--primary)' : 'var(--text-main)', fontWeight: 600 }}
                >
                  {selectedCategory.name}
                </span>
              </>
            )}
            {selectedSubCategory && (
              <>
                <ChevronRight size={13} />
                <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                  {selectedSubCategory.name}
                </span>
              </>
            )}
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
            {selectedCategory ? selectedCategory.name : 'Category Spending Explorer'}
          </h3>
        </div>

        {selectedCategory && (
          <button
            onClick={handleBackToAll}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}
          >
            <ArrowLeft size={13} />
            <span>Back to All Categories</span>
          </button>
        )}
      </div>

      {/* LEVEL 1: ALL CATEGORIES VIEW */}
      {!selectedCategory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {categoryData.map(cat => {
            const Icon = cat.icon;

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                style={{
                  background: '#FAFAF7',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s, border-color 0.15s, transform 0.15s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#F5F6F2';
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FAFAF7';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div className="icon-box-mint" style={{ width: '40px', height: '40px', borderRadius: '10px' }}>
                    <Icon size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <strong style={{ fontSize: '0.96rem', color: 'var(--text-main)' }}>
                      {cat.name}
                    </strong>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {cat.subcategories.length} subcategories • Click to explore details
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {formatINR(cat.amount)}
                    </div>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 7px' }}>
                      {cat.percentage}% of total
                    </span>
                  </div>
                  <ChevronRight size={18} color="var(--text-muted)" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LEVEL 2: DRILL-DOWN INTO SUBCATEGORIES */}
      {selectedCategory && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Top Category Hero Banner */}
          <div style={{
            background: 'var(--badge-bg)',
            border: '1px solid #D6E7DC',
            borderRadius: '16px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Category Outflow
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>
                {formatINR(selectedCategory.amount)}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
                {selectedCategory.percentage}% of overall monthly spending
              </span>
            </div>
          </div>

          {/* Subcategories Breakdown List */}
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em', marginTop: '6px' }}>
            Subcategory Distribution &amp; Top Merchants:
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            {selectedCategory.subcategories.map((sub, idx) => {
              const isSelected = selectedSubCategory?.name === sub.name;
              const subPct = Math.round((sub.amount / selectedCategory.amount) * 100);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedSubCategory(isSelected ? null : sub)}
                  style={{
                    background: isSelected ? '#F7FAF8' : '#FAFAF7',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    borderRadius: '14px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '0.92rem', color: 'var(--text-main)' }}>
                      {sub.name}
                    </strong>
                    <span className="badge badge-muted" style={{ fontSize: '0.68rem' }}>
                      {subPct}%
                    </span>
                  </div>

                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
                    {formatINR(sub.amount)}
                  </div>

                  {/* Merchants tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {sub.merchants.map((m, mIdx) => (
                      <span 
                        key={mIdx} 
                        style={{ 
                          fontSize: '0.72rem', 
                          background: '#FFFFFF', 
                          border: '1px solid var(--border-color)', 
                          borderRadius: '6px', 
                          padding: '2px 8px', 
                          color: 'var(--text-muted)' 
                        }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
