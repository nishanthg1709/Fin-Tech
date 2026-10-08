import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { parseCSVStatement, generateSampleCSVString } from '../services/engine/statementParser';

export function StatementUploadModal({ isOpen, onClose, onStatementParsed }) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState('');
  const [parsedCount, setParsedCount] = useState(0);
  const [parsedTxs, setParsedTxs] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSVString();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_bank_statement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = (file) => {
    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        let txs = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            txs = json;
          } else if (json.transactions && Array.isArray(json.transactions)) {
            txs = json.transactions;
          } else {
            throw new Error('JSON statement must be an array of transactions or contain a "transactions" list.');
          }
        } else {
          // Parse CSV
          txs = parseCSVStatement(text);
        }

        if (txs.length === 0) {
          throw new Error('No valid transactions found in the file.');
        }

        setParsedCount(txs.length);
        setParsedTxs(txs);
      } catch (err) {
        setError(err.message || 'Failed to parse file.');
        setParsedTxs(null);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleDirectly = () => {
    try {
      const sampleCSV = generateSampleCSVString();
      const txs = parseCSVStatement(sampleCSV);
      setFileName('sample_bank_statement.csv');
      setParsedCount(txs.length);
      setParsedTxs(txs);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleConfirmImport = () => {
    if (parsedTxs && parsedTxs.length > 0) {
      onStatementParsed(parsedTxs, fileName);
      onClose();
      // Reset state
      setParsedTxs(null);
      setFileName('');
      setParsedCount(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '620px', padding: '28px', background: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '18px' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="icon-box-mint" style={{ width: '42px', height: '42px', borderRadius: '12px' }}>
              <UploadCloud size={22} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', margin: 0 }}>
                Import Bank <span className="text-forest">Statement</span>
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Fallback CSV or JSON Statement Ingestion
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

        {/* Drag & Drop Zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--border-color)'}`,
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            background: dragOver ? 'var(--badge-bg)' : '#FAFAF7',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '18px'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".csv, .json, text/csv, application/json"
            onChange={e => e.target.files && e.target.files[0] && processFile(e.target.files[0])}
          />

          <div className="icon-box-mint" style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 12px auto'
          }}>
            <FileText size={22} color="var(--primary)" />
          </div>

          <p style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
            Click to browse or drop your bank statement here
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Supports CSV, TSV, or JSON exports from any major bank (Chase, BofA, Wells Fargo, etc.)
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECDD3',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#991B1B',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Preview */}
        {parsedTxs && (
          <div style={{
            background: 'var(--badge-bg)',
            border: '1px solid #D2DDD0',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={20} color="var(--primary)" />
              <div>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.86rem' }}>{fileName}</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Successfully parsed {parsedCount} transactions ready for normalization!
                </div>
              </div>
            </div>
            <button onClick={handleConfirmImport} className="btn btn-primary btn-sm">
              <span>Run Intelligence Engine</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Fast Track Helpers */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              onClick={handleLoadSampleDirectly}
              className="btn btn-secondary btn-sm"
              style={{ color: 'var(--primary)' }}
            >
              <Sparkles size={14} />
              <span>Load Statement CSV</span>
            </button>
            <button 
              onClick={handleDownloadSample}
              className="btn btn-secondary btn-sm"
              title="Download statement template CSV"
            >
              <Download size={14} />
              <span>Download Template CSV</span>
            </button>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
