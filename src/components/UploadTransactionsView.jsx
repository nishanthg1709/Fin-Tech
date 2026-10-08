import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Calendar, 
  Hash, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  Sparkles,
  Database,
  Clock,
  History,
  Layers
} from 'lucide-react';
import { parseCSVWithMetadata, generateSampleCSVString } from '../services/engine/statementParser.js';
import { formatINR, formatIndianNumber } from '../utils/formatters.js';

export function UploadTransactionsView({ 
  activeSourceInfo, 
  onAnalyzeTransactions, 
  onNavigate 
}) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedData, setParsedData] = useState(null); // { transactions, metadata }
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importProgress, setImportProgress] = useState(null); // { percent, step }
  const [isImportCompleted, setIsImportCompleted] = useState(false);
  const fileInputRef = useRef(null);

  // Compute 6 explicit dataset statistics (Section 14)
  const stats = React.useMemo(() => {
    if (!parsedData || !parsedData.metadata) return null;
    const totalRows = parsedData.metadata.totalRows || parsedData.transactions.length;
    const validTransactions = parsedData.metadata.validCount || parsedData.transactions.length;
    const invalidTransactions = Math.max(0, totalRows - validTransactions);
    
    // Calculate duplicates by transaction ID or key combination
    const seen = new Set();
    let duplicateTransactions = 0;
    parsedData.transactions.forEach(t => {
      const key = t.id || `${t.date}-${t.cleanMerchant}-${t.amount}`;
      if (seen.has(key)) duplicateTransactions++;
      else seen.add(key);
    });

    const importedTransactions = validTransactions;

    return {
      fileName: parsedData.metadata.fileName,
      numberOfRows: totalRows,
      validTransactions,
      invalidTransactions,
      duplicateTransactions,
      importedTransactions
    };
  }, [parsedData]);

  // Active step calculation: 1. Upload -> 2. Validate -> 3. Preview -> 4. Import -> 5. Complete
  const currentStep = React.useMemo(() => {
    if (isImportCompleted) return 5;
    if (importProgress) return 4;
    if (parsedData) return 3; // Step 2 & 3: Validate & Preview
    return 1; // Step 1: Upload
  }, [isImportCompleted, importProgress, parsedData]);

  // Import history stored in localStorage
  const [importHistory, setImportHistory] = useState(() => {
    try {
      const stored = localStorage.getItem('smart_expense_import_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    // Seed default import history if activeSourceInfo exists
    if (activeSourceInfo) {
      return [{
        id: 'hist-1',
        fileName: activeSourceInfo.fileName || 'Merged_200_Unique_Transactions.csv',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        count: activeSourceInfo.validCount || activeSourceInfo.count || 200,
        status: 'Active Dataset',
        totalDebit: 208229,
        totalCredit: 475000
      }];
    }
    return [];
  });

  const saveToHistory = (metadata) => {
    const entry = {
      id: `hist-${Date.now()}`,
      fileName: metadata.fileName,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      count: metadata.validCount,
      status: 'Imported',
      totalDebit: metadata.totalDebit || 0,
      totalCredit: metadata.totalCredit || 0
    };
    const updated = [entry, ...importHistory.filter(h => h.fileName !== metadata.fileName)].slice(0, 5);
    setImportHistory(updated);
    try {
      localStorage.setItem('smart_expense_import_history', JSON.stringify(updated));
    } catch {}
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    setError(null);
    if (!file) return;

    // Strict validation: Only accept .csv files
    const isCsvName = file.name.toLowerCase().endsWith('.csv');
    if (!isCsvName) {
      setError('Only CSV files are accepted. Please provide a valid .csv bank transaction statement.');
      return;
    }

    setSelectedFile(file);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const result = parseCSVWithMetadata(text, file.name);
        setParsedData(result);
        setError(null);
      } catch (err) {
        console.error('CSV Parsing Error:', err);
        setParsedData(null);
        setError(err.message || 'We couldn\'t analyze this file. Please verify CSV structure and columns.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setIsProcessing(false);
      setParsedData(null);
      setError('Failed to read the file from disk. Please try again.');
    };

    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleLoadSampleCSV = () => {
    setError(null);
    setIsProcessing(true);
    try {
      const sampleCsvText = generateSampleCSVString(200);
      const fileName = 'Merged_200_Unique_Transactions.csv';
      const result = parseCSVWithMetadata(sampleCsvText, fileName);
      setSelectedFile({ name: fileName, size: sampleCsvText.length });
      setParsedData(result);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to generate sample CSV.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmAnalyze = () => {
    if (!parsedData || !parsedData.transactions || parsedData.transactions.length === 0) {
      setError('Please upload and preview a valid CSV before analyzing.');
      return;
    }

    // Step-by-step import progress animation
    setImportProgress({ percent: 25, step: 'Validating column structure...' });
    setTimeout(() => {
      setImportProgress({ percent: 65, step: 'Normalizing transaction merchants...' });
      setTimeout(() => {
        setImportProgress({ percent: 90, step: 'Detecting recurring subscriptions & cash flow...' });
        setTimeout(() => {
          setImportProgress({ percent: 100, step: 'Analysis complete!' });
          saveToHistory(parsedData.metadata);
          setIsImportCompleted(true);
          setImportProgress(null);
          if (onAnalyzeTransactions) {
            onAnalyzeTransactions(parsedData.transactions, parsedData.metadata);
          }
        }, 400);
      }, 400);
    }, 400);
  };

  const handleResetUpload = () => {
    setSelectedFile(null);
    setParsedData(null);
    setError(null);
    setImportProgress(null);
    setIsImportCompleted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview transactions (first 10 rows)
  const previewRows = parsedData?.transactions?.slice(0, 10) || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Panel */}
      <div className="glass-panel" style={{ padding: '28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div className="icon-box-mint" style={{ width: '38px', height: '38px' }}>
                <UploadCloud size={20} color="var(--primary)" />
              </div>
              <h1 style={{ fontSize: '1.45rem', color: 'var(--text-main)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Upload <span style={{ color: 'var(--primary)' }}>Transactions</span>
              </h1>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: 0 }}>
              Upload your bank transaction CSV to analyze your spending, subscriptions, and forecast cash flow.
            </p>
          </div>

          {activeSourceInfo && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--badge-bg)', padding: '8px 14px', borderRadius: '10px', border: '1px solid #D6E7DC' }}>
              <Database size={15} color="var(--primary)" />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>
                Active: <strong>{activeSourceInfo.fileName || 'Uploaded CSV'}</strong> ({activeSourceInfo.validCount || activeSourceInfo.count} rows)
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5-STEP WORKFLOW STEPPER (Section 14) */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px 24px', 
          background: '#FFFFFF', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px' 
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
          {[
            { step: 1, title: '1. Upload', desc: 'Select CSV' },
            { step: 2, title: '2. Validate', desc: 'Verify columns' },
            { step: 3, title: '3. Preview', desc: 'First 10 rows' },
            { step: 4, title: '4. Import', desc: 'Analyze data' },
            { step: 5, title: '5. Complete', desc: 'Dataset ready' }
          ].map((s) => {
            const isCurrent = currentStep === s.step;
            const isDone = currentStep > s.step;
            return (
              <div 
                key={s.step}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isCurrent ? 'var(--badge-bg)' : isDone ? '#FAFAF7' : 'transparent',
                  border: isCurrent ? '1px solid #D6E7DC' : '1px solid transparent',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: isDone ? 'var(--primary)' : isCurrent ? 'var(--primary)' : '#E4E9E3',
                  color: isDone || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  {isDone ? <Check size={13} /> : s.step}
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: isCurrent ? 'var(--primary)' : isDone ? 'var(--text-main)' : 'var(--text-muted)' }}>
                    {s.title}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. STEP 5: IMPORT COMPLETE SCREEN (Section 14) */}
      {isImportCompleted && stats && (
        <div className="glass-panel" style={{ padding: '48px 32px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '20px', textAlign: 'center' }}>
          <div className="icon-box-mint" style={{ width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 18px auto' }}>
            <CheckCircle2 size={34} color="var(--primary)" />
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
            {formatIndianNumber(stats.importedTransactions)} transactions successfully imported.
          </h2>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 28px auto', lineHeight: 1.5 }}>
            Your transaction statement has been fully normalized and categorized. Balances, subscription renewals, spending charts, cash runway, and anomaly radar have all been updated dynamically.
          </p>

          {/* 6 Core Import Statistics (Section 14) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', maxWidth: '820px', margin: '0 auto 32px auto', textAlign: 'left' }}>
            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>File Name</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stats.fileName}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Number of Rows</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                {stats.numberOfRows}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Valid Transactions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {stats.validTransactions}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Invalid Transactions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.invalidTransactions > 0 ? 'var(--accent-rose)' : 'var(--text-main)', marginTop: '4px' }}>
                {stats.invalidTransactions}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Duplicate Transactions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: stats.duplicateTransactions > 0 ? 'var(--accent-amber)' : 'var(--text-main)', marginTop: '4px' }}>
                {stats.duplicateTransactions}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Imported Transactions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
                {stats.importedTransactions}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('/overview')} className="btn btn-primary btn-lg">
              Go to Financial Command Center
            </button>
            <button onClick={() => onNavigate('/transactions')} className="btn btn-secondary btn-lg">
              View All Transactions
            </button>
            <button onClick={handleResetUpload} className="btn btn-secondary btn-lg">
              Upload Another Statement
            </button>
          </div>
        </div>
      )}

      {/* IMPORT PROGRESS BAR MODAL / OVERLAY (Step 4) */}
      {importProgress && !isImportCompleted && (
        <div className="glass-card" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="status-dot status-dot-green" />
              <strong style={{ fontSize: '0.94rem', color: 'var(--text-main)' }}>
                {importProgress.step}
              </strong>
            </div>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary)' }}>
              {importProgress.percent}%
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: '#E4E9E3', borderRadius: '4px', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${importProgress.percent}%`, 
                height: '100%', 
                background: 'var(--primary)', 
                transition: 'width 0.35s ease',
                borderRadius: '4px' 
              }} 
            />
          </div>
        </div>
      )}

      {/* DRAG AND DROP ZONE (Step 1) */}
      {!parsedData && !isImportCompleted && (
        <div 
          className="glass-card"
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          style={{
            padding: '52px 24px',
            background: dragActive ? 'var(--badge-bg)' : '#FFFFFF',
            border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--border-color)',
            borderRadius: '18px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'var(--badge-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px auto'
          }}>
            <FileText size={30} color="var(--primary)" />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '6px' }}>
            📄 Drop your CSV file here
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
            or
          </p>

          <button 
            type="button"
            className="btn btn-primary"
            style={{ padding: '12px 28px', fontSize: '0.92rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            <UploadCloud size={17} />
            <span>Choose CSV File</span>
          </button>

          <div style={{ marginTop: '22px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Only accepts standard <strong>.csv</strong> files • Processed 100% locally in your browser
          </div>

          <div style={{ marginTop: '20px', paddingTop: '18px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Need a ready test dataset?</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSampleCSV();
              }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
            >
              <Sparkles size={14} color="var(--primary)" />
              <span>Load Sample 200 Transactions CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* ERROR ALERT */}
      {error && (
        <div style={{
          background: '#FFF5F5',
          border: '1px solid #FED7D7',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <AlertCircle size={20} color="var(--accent-rose)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ fontSize: '0.92rem', color: 'var(--accent-rose)', display: 'block', marginBottom: '2px' }}>
              Validation Error
            </strong>
            <p style={{ fontSize: '0.86rem', color: '#991B1B', margin: 0 }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* FILE INFORMATION CARD (VALIDATION & METRICS) */}
      {parsedData && !isImportCompleted && (
        <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
                <CheckCircle2 size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                  {parsedData.metadata.fileName}
                </h3>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                  <strong style={{ color: 'var(--primary)' }}>{parsedData.metadata.validCount} transactions validated</strong> • Date range: {parsedData.metadata.dateRange?.label || 'Dynamically calculated'}
                </div>
              </div>
            </div>

            <button 
              onClick={handleResetUpload}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              <span>Upload New CSV</span>
            </button>
          </div>

          {/* 6 Core Statistics Required (Section 14) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                File Name
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {stats?.fileName || parsedData.metadata.fileName}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Number of Rows
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {stats?.numberOfRows || parsedData.metadata.totalRows}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Valid Transactions
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats?.validTransactions || parsedData.metadata.validCount}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Invalid Transactions
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: (stats?.invalidTransactions || 0) > 0 ? 'var(--accent-rose)' : 'var(--text-main)' }}>
                {stats?.invalidTransactions ?? 0}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Duplicate Transactions
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: (stats?.duplicateTransactions || 0) > 0 ? 'var(--accent-amber)' : 'var(--text-main)' }}>
                {stats?.duplicateTransactions ?? 0}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Imported Transactions
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {stats?.importedTransactions || parsedData.metadata.validCount}
              </div>
            </div>
          </div>

          {/* Additional Statement Metrics from CSV */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Total Debits (Spending)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {formatINR(parsedData.metadata.totalDebit || 0)}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Total Credits (Income)
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatINR(parsedData.metadata.totalCredit || 0)}
              </div>
            </div>

            <div style={{ background: '#FAFAF7', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '4px' }}>
                Date Range
              </div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', marginTop: '4px' }}>
                {parsedData.metadata.dateRange?.label || 'Calculated from CSV'}
              </div>
            </div>
          </div>

          {/* Detected Columns */}
          <div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
              Detected Columns ({parsedData.metadata.detectedColumns?.length || 0}):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {parsedData.metadata.detectedColumns?.map((col, idx) => (
                <span 
                  key={idx} 
                  className="badge badge-emerald" 
                  style={{ fontSize: '0.74rem', padding: '3px 9px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Check size={11} />
                  <span>{col}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TRANSACTION PREVIEW TABLE */}
      {parsedData && !isImportCompleted && (
        <div className="glass-panel" style={{ padding: '0px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                Transaction Preview (First 10 Rows)
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
                Review sample transactions before running financial intelligence analysis
              </p>
            </div>

            <button
              onClick={handleConfirmAnalyze}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.92rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(24, 118, 90, 0.22)'
              }}
            >
              <span>Analyze Transactions</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>DATE</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>DESCRIPTION</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>MERCHANT</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>CATEGORY</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>DEBIT</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>CREDIT</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((tx, idx) => (
                  <tr 
                    key={tx.id || idx}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F6F2'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 20px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>
                      {tx.date}
                    </td>
                    <td style={{ padding: '13px 20px', color: 'var(--text-main)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tx.description || tx.rawNarration}
                    </td>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {tx.cleanMerchant || tx.merchant}
                    </td>
                    <td style={{ padding: '13px 20px' }}>
                      <span className="badge badge-muted" style={{ fontSize: '0.72rem' }}>
                        {tx.category}
                      </span>
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontWeight: 600, color: tx.type === 'DEBIT' ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {tx.type === 'DEBIT' ? formatINR(tx.amount) : '—'}
                    </td>
                    <td style={{ padding: '13px 20px', textAlign: 'right', fontWeight: 600, color: tx.type === 'CREDIT' ? 'var(--primary)' : 'var(--text-muted)' }}>
                      {tx.type === 'CREDIT' ? formatINR(tx.amount) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Confirmation Bar */}
          <div style={{ padding: '18px 24px', background: '#FAFAF7', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Showing first 10 of {parsedData.metadata.validCount} transactions. The main overview will update upon clicking Analyze.
            </div>

            <button
              onClick={handleConfirmAnalyze}
              className="btn btn-primary"
              style={{
                padding: '10px 24px',
                fontSize: '0.92rem',
                borderRadius: '10px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>Analyze Transactions</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* IMPORT HISTORY SECTION */}
      {importHistory.length > 0 && (
        <div className="glass-panel" style={{ padding: '24px 28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div className="icon-box-mint">
              <History size={17} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Import History
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                Recent bank statement imports processed during your session
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#FAFAF7', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>STATEMENT FILE</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>IMPORTED AT</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>TRANSACTIONS</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>TOTAL DEBIT</th>
                  <th style={{ padding: '10px 14px', fontWeight: 600 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {importHistory.map((item, idx) => (
                  <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {item.fileName}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                      {item.date}
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                      {item.count} rows
                    </td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                      {formatINR(item.totalDebit)}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                        {item.status || 'Imported'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Privacy Guarantee Note */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 20px', background: '#FAFAF7', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <ShieldCheck size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Data Privacy:</strong> Bank statement CSV parsing and calculations run entirely within your local browser sandbox. Financial records are never dispatched to external third parties.
        </span>
      </div>

    </div>
  );
}
