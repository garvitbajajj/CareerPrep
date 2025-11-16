// src/components/DataManagementPage.jsx
import React from 'react';
import ExportData from './ExportData';

function DataManagementPage({ onClose }) {
  return (
    <div className="data-management-page">
      <div className="data-management-content">
        <div className="page-header">
          <h1>📊 Data Management</h1>
          <button onClick={onClose} className="btn-close-page">
            ✕ Close
          </button>
        </div>
        <ExportData />
      </div>
    </div>
  );
}

export default DataManagementPage;

