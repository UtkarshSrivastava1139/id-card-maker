import React, { useEffect } from 'react';
import { useDatasetStore } from '../../store/datasetStore';
import { usePhotoStore } from '../../store/photoStore';
import { useTemplateStore } from '../../store/templateStore';
import { useValidationStore } from '../../store/validationStore';
import { runFullValidation } from '../../services/validation';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import './ValidationView.css';

export default function ValidationView() {
  const { dataset, primaryKeyField } = useDatasetStore();
  const { matches } = usePhotoStore();
  const { backgroundImage, elements } = useTemplateStore();
  const { report, setReport } = useValidationStore();

  useEffect(() => {
    const newReport = runFullValidation(dataset, primaryKeyField, matches, backgroundImage, elements);
    setReport(newReport);
  }, [dataset, primaryKeyField, matches, backgroundImage, elements, setReport]);

  if (!report) return null;

  const datasetIssues = report.issues.filter(i => i.category === 'dataset');
  const photosIssues = report.issues.filter(i => i.category === 'photos');
  const templateIssues = report.issues.filter(i => i.category === 'template');

  const getStatusIcon = (issues: any[]) => {
    if (issues.length === 0) return <CheckCircle2 size={24} color="var(--success)" />;
    if (issues.some(i => i.severity === 'error')) return <XCircle size={24} color="var(--danger)" />;
    return <AlertTriangle size={24} color="var(--warning)" />;
  };

  const renderIssueList = (issues: any[]) => {
    if (issues.length === 0) return <p className="text-small text-secondary" style={{ marginTop: '8px' }}>All checks passed.</p>;
    
    return (
      <ul className="issue-list" style={{ marginTop: '12px' }}>
        {issues.map(issue => (
          <li key={issue.id} className={`issue-item ${issue.severity}`}>
            <span style={{ fontWeight: 500 }}>{issue.message}</span>
            {issue.details && <span className="issue-details">{issue.details}</span>}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="validation-view">
      <div className="validation-header">
        <h3 className="h2">Project Health Check</h3>
        <p className="text-secondary">Validation runs automatically to ensure cards can be safely generated.</p>
      </div>

      <div className={`status-banner ${report.isValid ? 'success' : 'error'}`}>
        {report.isValid ? (
          <>
            <CheckCircle2 size={24} />
            <div className="banner-text">
              <strong>Ready to Generate</strong>
              <p>All checks passed. You can proceed to batch generation.</p>
            </div>
          </>
        ) : (
          <>
            <XCircle size={24} />
            <div className="banner-text">
              <strong>Generation Blocked</strong>
              <p>Please resolve the errors below before generating cards.</p>
            </div>
          </>
        )}
      </div>

      <div className="validation-grid">
        <div className="validation-card">
          <div className="card-header">
            <h4 className="h3">Dataset Status</h4>
            {getStatusIcon(datasetIssues)}
          </div>
          {renderIssueList(datasetIssues)}
        </div>

        <div className="validation-card">
          <div className="card-header">
            <h4 className="h3">Photos Status</h4>
            {getStatusIcon(photosIssues)}
          </div>
          {renderIssueList(photosIssues)}
        </div>

        <div className="validation-card">
          <div className="card-header">
            <h4 className="h3">Template Mapping</h4>
            {getStatusIcon(templateIssues)}
          </div>
          {renderIssueList(templateIssues)}
        </div>
      </div>
    </div>
  );
}
