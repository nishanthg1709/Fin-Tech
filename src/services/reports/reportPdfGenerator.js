import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatIndianNumber } from '../../utils/formatters.js';

/**
 * Generates a comprehensive, professional PDF Spending Summary Report.
 * Uses exact brand colors: Forest Green (#18765A), Dark Green (#203733), Off-White (#F5F6F2), Pale Mint (#E7F3EC).
 */
export function generateSpendingReportPdf({
  user,
  connectedBank,
  summaryData
}) {
  const {
    totalSpending = 0,
    totalIncome = 0,
    netCashFlow = 0,
    transactionCount = 0,
    categories = [],
    topCategory,
    highestTransaction,
    monthlySubscriptionCommitted = 0,
    subscriptionsCount = 0,
    subscriptions = [],
    monthlyTrend = [],
    alertsSummary = {},
    topTransactions = [],
    insights = []
  } = summaryData;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 14;

  // Primary Brand Colors
  const COLOR_FOREST = [24, 118, 90];      // #18765A
  const COLOR_DARK = [32, 55, 51];         // #203733
  const COLOR_MUTED = [116, 130, 123];     // #74827B
  const COLOR_BORDER = [228, 233, 227];    // #E4E9E3
  const COLOR_MINT = [231, 243, 236];      // #E7F3EC
  const COLOR_CARD = [250, 250, 247];      // #FAFAF7
  const COLOR_WHITE = [255, 255, 255];
  const COLOR_ROSE = [225, 29, 72];

  let currentY = 14;

  // 1. TOP HEADER BANNER
  doc.setFillColor(...COLOR_FOREST);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(...COLOR_WHITE);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Smart Expense & Subscriptions – Spending Summary', marginX, 13);

  // Subtitle & Metadata
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const bankName = connectedBank?.name || 'HDFC Bank';
  const userName = user?.name || 'Account Holder';
  doc.text(`Generated on ${dateStr} • Prepared for ${userName} • Institution: ${bankName}`, marginX, 20);

  currentY = 36;

  // Helper function to check page overflow
  const ensureSpace = (neededHeight) => {
    if (currentY + neededHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 18;
    }
  };

  // 2. FINANCIAL HEALTH KPI CARDS (4 COLUMNS)
  const cardWidth = 43;
  const cardHeight = 22;
  const cardGap = 3.3;

  const kpis = [
    { label: 'TOTAL INCOME', value: `INR ${formatIndianNumber(totalIncome)}`, color: COLOR_FOREST },
    { label: 'TOTAL SPENDING', value: `INR ${formatIndianNumber(totalSpending)}`, color: COLOR_DARK },
    { label: 'NET CASH FLOW', value: `${netCashFlow >= 0 ? '+' : '-'}INR ${formatIndianNumber(Math.abs(netCashFlow))}`, color: netCashFlow >= 0 ? COLOR_FOREST : COLOR_ROSE },
    { label: 'SUBSCRIPTIONS / MO', value: `INR ${formatIndianNumber(monthlySubscriptionCommitted)}`, color: COLOR_DARK }
  ];

  kpis.forEach((kpi, index) => {
    const x = marginX + index * (cardWidth + cardGap);
    doc.setDrawColor(...COLOR_BORDER);
    doc.setFillColor(...COLOR_CARD);
    doc.roundedRect(x, currentY, cardWidth, cardHeight, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_MUTED);
    doc.text(kpi.label, x + 3.5, currentY + 6.5);

    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + 3.5, currentY + 15.5);
  });

  currentY += cardHeight + 8;

  // 3. FINANCIAL INSIGHTS SUMMARY (Pale Mint Highlight Box)
  if (insights.length > 0) {
    ensureSpace(32);
    const boxHeight = 8 + insights.length * 5.2;
    doc.setDrawColor(...COLOR_FOREST);
    doc.setFillColor(...COLOR_MINT);
    doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, boxHeight, 2.5, 2.5, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_FOREST);
    doc.text('EXECUTIVE FINANCIAL INSIGHTS', marginX + 4, currentY + 6.5);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_DARK);

    insights.forEach((insight, idx) => {
      const lineY = currentY + 12 + idx * 5.2;
      doc.text(`•  ${insight}`, marginX + 4, lineY);
    });

    currentY += boxHeight + 8;
  }

  // 4. CATEGORY-WISE SPENDING BREAKDOWN TABLE
  ensureSpace(40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_DARK);
  doc.text('Category-Wise Spending Breakdown', marginX, currentY);
  currentY += 4;

  const categoryRows = categories.map(cat => [
    cat.name,
    String(cat.count),
    `INR ${formatIndianNumber(cat.total)}`,
    `${cat.percentage.toFixed(1)}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Category', 'Transactions', 'Amount (INR)', '% of Spending']],
    body: categoryRows.length > 0 ? categoryRows : [['No data', '0', 'INR 0', '0.0%']],
    headStyles: {
      fillColor: COLOR_FOREST,
      textColor: COLOR_WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    styles: {
      fontSize: 7.8,
      cellPadding: 2.4,
      textColor: COLOR_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: COLOR_CARD
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { halign: 'center', cellWidth: 30 },
      2: { halign: 'right', fontStyle: 'bold', cellWidth: 42 },
      3: { halign: 'right', cellWidth: 40 }
    },
    margin: { left: marginX, right: marginX }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 5. MONTHLY SPENDING TREND
  if (monthlyTrend.length > 0) {
    ensureSpace(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text('Monthly Spending & Income Summary', marginX, currentY);
    currentY += 4;

    const monthlyRows = monthlyTrend.map(m => [
      m.label,
      `INR ${formatIndianNumber(m.income)}`,
      `INR ${formatIndianNumber(m.spending)}`,
      `${m.net >= 0 ? '+' : '-'}INR ${formatIndianNumber(Math.abs(m.net))}`,
      String(m.count)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Billing Period', 'Income (INR)', 'Spending (INR)', 'Net Cash Flow', 'Transactions']],
      body: monthlyRows,
      headStyles: {
        fillColor: COLOR_FOREST,
        textColor: COLOR_WHITE,
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.8,
        cellPadding: 2.4,
        textColor: COLOR_DARK,
        lineColor: COLOR_BORDER,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: COLOR_CARD
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 42 },
        1: { halign: 'right', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 40 },
        4: { halign: 'center', cellWidth: 30 }
      },
      margin: { left: marginX, right: marginX }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 6. ACTIVE RECURRING SUBSCRIPTIONS TABLE
  if (subscriptions.length > 0) {
    ensureSpace(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text('Recurring Subscriptions Overview', marginX, currentY);
    currentY += 4;

    const subRows = subscriptions.map(sub => [
      sub.cleanMerchant || sub.merchant || 'Subscription',
      sub.interval || '1 Month',
      `INR ${formatIndianNumber(sub.amount)}`,
      `INR ${formatIndianNumber(sub.normalizedMonthly || sub.amount)}/mo`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Subscription Service', 'Cadence', 'Billed Amount (INR)', 'Monthly Commitment']],
      body: subRows,
      headStyles: {
        fillColor: COLOR_FOREST,
        textColor: COLOR_WHITE,
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.8,
        cellPadding: 2.4,
        textColor: COLOR_DARK,
        lineColor: COLOR_BORDER,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: COLOR_CARD
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 62 },
        1: { halign: 'center', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 45 }
      },
      margin: { left: marginX, right: marginX }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 7. UNUSUAL TRANSACTIONS / ALERTS SUMMARY
  ensureSpace(28);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLOR_DARK);
  doc.text('Unusual Transactions & Alerts Status', marginX, currentY);
  currentY += 4;

  const alertsTableRows = [
    ['Total Unusual Alerts Detected', String(alertsSummary.totalAlerts || 0)],
    ['Duplicate Transactions Identified', String(alertsSummary.duplicateAlerts || 0)],
    ['Unusual Outlier / High-Value Debits', String(alertsSummary.unusualSpikeAlerts || 0)],
    ['Alerts Already Reviewed', String(alertsSummary.reviewedAlerts || 0)],
    ['Alerts Pending User Review', String(alertsSummary.pendingAlerts || 0)]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Alert Category / Parameter', 'Count']],
    body: alertsTableRows,
    headStyles: {
      fillColor: COLOR_FOREST,
      textColor: COLOR_WHITE,
      fontSize: 8,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 7.8,
      cellPadding: 2.2,
      textColor: COLOR_DARK,
      lineColor: COLOR_BORDER,
      lineWidth: 0.1
    },
    alternateRowStyles: {
      fillColor: COLOR_CARD
    },
    columnStyles: {
      0: { cellWidth: 140 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 42 }
    },
    margin: { left: marginX, right: marginX }
  });

  currentY = doc.lastAutoTable.finalY + 8;

  // 8. TOP 5 LARGEST EXPENSES
  if (topTransactions.length > 0) {
    ensureSpace(40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLOR_DARK);
    doc.text('Top 5 Largest Transactions', marginX, currentY);
    currentY += 4;

    const topTxRows = topTransactions.map(tx => [
      tx.date || 'N/A',
      tx.cleanMerchant || 'Debit Transaction',
      tx.category || 'Other',
      `INR ${formatIndianNumber(tx.amount)}`
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Date', 'Clean Merchant', 'Category', 'Amount (INR)']],
      body: topTxRows,
      headStyles: {
        fillColor: COLOR_FOREST,
        textColor: COLOR_WHITE,
        fontSize: 8,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 7.8,
        cellPadding: 2.2,
        textColor: COLOR_DARK,
        lineColor: COLOR_BORDER,
        lineWidth: 0.1
      },
      alternateRowStyles: {
        fillColor: COLOR_CARD
      },
      columnStyles: {
        0: { cellWidth: 32 },
        1: { fontStyle: 'bold', cellWidth: 65 },
        2: { cellWidth: 45 },
        3: { halign: 'right', fontStyle: 'bold', cellWidth: 40 }
      },
      margin: { left: marginX, right: marginX }
    });

    currentY = doc.lastAutoTable.finalY + 8;
  }

  // 9. FOOTER ON ALL PAGES
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...COLOR_BORDER);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLOR_MUTED);
    doc.text('Smart Expense & Subscriptions Manager • Confidential Spending Summary Report', marginX, pageHeight - 7);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - marginX, pageHeight - 7, { align: 'right' });
  }

  // Save the PDF in browser environments
  const filenameDate = new Date().toISOString().split('T')[0];
  const filename = `Smart_Expense_Spending_Report_${filenameDate}.pdf`;
  if (typeof window !== 'undefined' && typeof doc.save === 'function') {
    try {
      doc.save(filename);
    } catch (e) {
      console.warn('doc.save deferred:', e);
    }
  }

  return doc;
}
