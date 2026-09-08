import React, { useState } from 'react';
import { useDatasetStore } from '../../store/datasetStore';
import { parseDatasetFile, validatePrimaryKey } from '../../services/dataset';
import Button from '../ui/Button';
import './DatasetView.css';

export default function DatasetView() {
  const { dataset, primaryKeyField, setDataset, setPrimaryKeyField, clearDataset } = useDatasetStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      const parsedData = await parseDatasetFile(file);
      setDataset(parsedData);
      
      // Auto-select first column as PK initially if none selected
      if (parsedData.headers.length > 0) {
        handlePkChange(parsedData.headers[0], parsedData);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handlePkChange = (pkField: string, dataToValidate = dataset) => {
    setPrimaryKeyField(pkField);
    if (dataToValidate) {
      const issues = validatePrimaryKey(dataToValidate, pkField);
      setValidationIssues(issues);
    }
  };

  if (!dataset) {
    return (
      <div className="empty-state">
        <h3 className="h2">Upload your dataset</h3>
        <p className="body text-secondary" style={{ marginTop: '8px', marginBottom: '24px' }}>
          Select a CSV or Excel file containing your student records.
        </p>
        <label className="btn btn-primary btn-md">
          Browse Files
          <input type="file" accept=".csv, .xlsx, .xls" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        {loading && <p style={{ marginTop: '16px' }}>Parsing file...</p>}
        {error && <p className="error-text" style={{ marginTop: '16px', color: 'var(--danger)' }}>{error}</p>}
      </div>
    );
  }

  return (
    <div className="dataset-view">
      <div className="dataset-header">
        <div>
          <h3 className="h2">Dataset Loaded</h3>
          <p className="text-secondary">{dataset.records.length} records • {dataset.headers.length} columns</p>
        </div>
        <Button variant="secondary" size="sm" onClick={clearDataset}>Remove File</Button>
      </div>

      <div className="pk-selector">
        <label>Primary identifier column:</label>
        <select 
          className="input-field" 
          value={primaryKeyField || ''} 
          onChange={(e) => handlePkChange(e.target.value)}
        >
          {dataset.headers.map(header => (
            <option key={header} value={header}>{header}</option>
          ))}
        </select>

        {validationIssues.length === 0 ? (
          <p className="success-text" style={{ color: 'var(--success)' }}>✓ {dataset.records.length} unique values. No empty records.</p>
        ) : (
          <div className="issues-box">
            <p className="error-text" style={{ color: 'var(--danger)' }}>⚠ {validationIssues.length} issues found with this primary key:</p>
            <ul className="issue-list text-secondary">
              {validationIssues.slice(0, 5).map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
              {validationIssues.length > 5 && <li>...and {validationIssues.length - 5} more issues.</li>}
            </ul>
          </div>
        )}
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {dataset.headers.map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataset.records.slice(0, 10).map((record, idx) => (
              <tr key={idx}>
                {dataset.headers.map(header => (
                  <td key={header}>{String(record[header] || '')}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {dataset.records.length > 10 && (
          <div className="table-footer text-secondary">
            Showing first 10 of {dataset.records.length} records.
          </div>
        )}
      </div>
    </div>
  );
}
