import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Wallet, 
  Clock, 
  TrendingDown, 
  ShieldCheck, 
  AlertCircle,
  Repeat,
  Info
} from 'lucide-react';
import { formatINR } from '../../utils/formatters.js';
import { forecastCashFlow } from '../../services/engine/cashFlowForecaster.js';

export function FinancialRunway({
  subscriptions = [],
  currentBalance = 78450.0
}) {
  const [selectedHorizon, setSelectedHorizon] = useState('30 Days');
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);

  // Generate cash flow forecast data
  const forecast = useMemo(() => {
    return forecastCashFlow(subscriptions, currentBalance, selectedHorizon);
  }, [subscriptions, currentBalance, selectedHorizon]);

  // Dynamic runway days calculation (e.g. 47 days)
  const runwayDays = useMemo(() => {
    // Look for when projectedBalance hits 0, or extrapolate daily burn
    const zeroPoint = forecast.timeline.find(t => t.projectedBalance <= 0);
    if (zeroPoint) return zeroPoint.dayOffset;

    // Daily recurring burn rate
    const dailyCommitted = forecast.totalCommitted / (forecast.horizonDays || 30);
    // Include typical discretionary buffer (~1,100/day)
    const dailyTotalOutflow = Math.max(1200, dailyCommitted + 1100);
    const days = Math.round(currentBalance / dailyTotalOutflow);
    return Math.min(365, Math.max(14, days || 47));
  }, [forecast, currentBalance]);

  // Interactive Runway SVG Dimensions
  const chartWidth = 760;
  const chartHeight = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 65 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const maxVal = Math.max(currentBalance, 10000) * 1.05;
  const minVal = 0;

  const getX = (dayOffset) => {
    return padding.left + (dayOffset / forecast.horizonDays) * plotWidth;
  };

  const getY = (val) => {
    const clamped = Math.max(0, Math.min(val, maxVal));
    return padding.top + plotHeight - ((clamped - minVal) / (maxVal - minVal)) * plotHeight;
  };

  // Build points for the projected balance step runway
  const balancePoints = forecast.timeline.map(p => `${getX(p.dayOffset)},${getY(p.projectedBalance)}`);
  const balancePath = `M ${balancePoints.join(' L ')}`;
  const balanceArea = `${balancePath} L ${getX(forecast.horizonDays)},${padding.top + plotHeight} L ${padding.left},${padding.top + plotHeight} Z`;

  // Active hover point
  const activePoint = hoveredPointIndex !== null && forecast.timeline[hoveredPointIndex]
    ? forecast.timeline[hoveredPointIndex]
    : forecast.timeline[forecast.timeline.length - 1];

  // Primary upcoming payment for activePoint
  const majorPayment = activePoint?.events && activePoint.events[0]
    ? `${activePoint.events[0].merchant} (${formatINR(activePoint.events[0].amount)})`
    : 'No major recurring debits scheduled';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* RUNWAY HIGHLIGHT BANNER */}
      <div 
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #D6E7DC',
          borderRadius: '20px',
          padding: '24px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          boxShadow: 'var(--shadow-subtle)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--badge-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
              flexShrink: 0
            }}
          >
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Projected Liquidity Runway
            </div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', margin: '2px 0 0 0', letterSpacing: '-0.02em' }}>
              Your current money is projected to last <span style={{ color: 'var(--primary)' }}>{runwayDays} days</span>.
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
            Healthy Runway · Buffer Intact
          </span>
        </div>
      </div>

      {/* METRIC TILES */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Current Balance
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {formatINR(currentBalance)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Opening liquid position
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Expected Recurring Deductions
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#B45309' }}>
            {formatINR(forecast.totalCommitted)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            In next {forecast.horizonDays} days
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Projected Safe-to-Spend
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {formatINR(forecast.safeToSpend)}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Net cushion after recurring costs
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
            Estimated Runway
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {runwayDays} Days
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            At current spending velocity
          </div>
        </div>

      </div>

      {/* INTERACTIVE FINANCIAL RUNWAY VISUALIZATION */}
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
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0, letterSpacing: '-0.02em' }}>
              Financial Runway Curve
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
              Hover over the timeline to inspect projected balances and scheduled deductions.
            </p>
          </div>

          {/* Period Controls: 7 Days, 30 Days, 90 Days, 1 Year */}
          <div style={{ display: 'flex', background: '#FAFAF7', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {['7 Days', '30 Days', '90 Days', '1 Year'].map(horizon => (
              <button
                key={horizon}
                onClick={() => setSelectedHorizon(horizon)}
                style={{
                  background: selectedHorizon === horizon ? 'var(--badge-bg)' : 'transparent',
                  color: selectedHorizon === horizon ? 'var(--primary)' : 'var(--text-muted)',
                  border: selectedHorizon === horizon ? '1px solid #D6E7DC' : '1px solid transparent',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                {horizon}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive SVG Chart */}
        <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
          <svg 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            style={{ width: '100%', height: 'auto', minWidth: '600px', display: 'block' }}
          >
            <defs>
              <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#18765A" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#18765A" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, maxVal * 0.33, maxVal * 0.66, maxVal].map((val, idx) => (
              <g key={idx}>
                <line
                  x1={padding.left}
                  y1={getY(val)}
                  x2={chartWidth - padding.right}
                  y2={getY(val)}
                  stroke="#E4E9E3"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={getY(val) + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#74827B"
                  fontFamily="var(--font-mono)"
                >
                  ₹{Math.round(val / 1000)}K
                </text>
              </g>
            ))}

            {/* Area Fill */}
            <path d={balanceArea} fill="url(#runwayGradient)" />

            {/* Step Runway Balance Line */}
            <path
              d={balancePath}
              fill="none"
              stroke="#18765A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Timeline Points */}
            {forecast.timeline.map((point, idx) => {
              const cx = getX(point.dayOffset);
              const cy = getY(point.projectedBalance);
              const hasEvents = point.events && point.events.length > 0;
              const isHovered = hoveredPointIndex === idx;

              return (
                <g 
                  key={idx}
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Invisible hit target */}
                  <rect
                    x={cx - 10}
                    y={padding.top}
                    width={20}
                    height={plotHeight}
                    fill="transparent"
                  />

                  {/* Marker Node */}
                  {(hasEvents || isHovered) && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 6 : hasEvents ? 4.5 : 3}
                      fill={hasEvents ? '#B45309' : '#18765A'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                  )}
                </g>
              );
            })}

            {/* Vertical hover tracker line */}
            {hoveredPointIndex !== null && forecast.timeline[hoveredPointIndex] && (
              <line
                x1={getX(forecast.timeline[hoveredPointIndex].dayOffset)}
                y1={padding.top}
                x2={getX(forecast.timeline[hoveredPointIndex].dayOffset)}
                y2={padding.top + plotHeight}
                stroke="#18765A"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
            )}

            {/* X-axis labels: Today, 7D, 15D, 30D, etc. */}
            <text x={getX(0)} y={chartHeight - 12} fontSize="11" fill="#74827B" textAnchor="start" fontWeight="600">
              Today
            </text>
            <text x={getX(Math.round(forecast.horizonDays * 0.33))} y={chartHeight - 12} fontSize="11" fill="#74827B" textAnchor="middle">
              {Math.round(forecast.horizonDays * 0.33)}D
            </text>
            <text x={getX(Math.round(forecast.horizonDays * 0.66))} y={chartHeight - 12} fontSize="11" fill="#74827B" textAnchor="middle">
              {Math.round(forecast.horizonDays * 0.66)}D
            </text>
            <text x={getX(forecast.horizonDays)} y={chartHeight - 12} fontSize="11" fill="#74827B" textAnchor="end" fontWeight="600">
              {forecast.horizonDays}D
            </text>
          </svg>
        </div>

        {/* ACTIVE INSPECTOR CALLOUT ON HOVER */}
        <div style={{
          marginTop: '16px',
          background: '#FAFAF7',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '14px 18px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Inspected Timeline Date
            </div>
            <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>
              {activePoint?.dayLabel || 'Current date'} ({activePoint?.dayOffset || 0} days out)
            </strong>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Projected Balance
            </div>
            <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>
              {formatINR(activePoint?.projectedBalance || currentBalance)}
            </strong>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Deductions Up to Date
            </div>
            <strong style={{ fontSize: '0.94rem', color: '#B45309' }}>
              {formatINR(activePoint?.cumulativeCommitted || 0)}
            </strong>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Major Upcoming Payment
            </div>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', fontWeight: 600 }}>
              {majorPayment}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
