import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import '../styles/FileUpload.css';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, isLoading = false }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv'],
    },
    disabled: isLoading,
  });

  return (
    <div className="file-upload-container">
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}>
        <input {...getInputProps()} />
        <div className="dropzone-content">
          <div className="upload-icon">📤</div>
          {isDragActive ? (
            <p className="dropzone-text">Drop your file here...</p>
          ) : (
            <>
              <p className="dropzone-text">Drag and drop your LinkedIn analytics file here</p>
              <p className="dropzone-subtext">or click to select a file</p>
              <p className="dropzone-formats">Supported: Excel (.xlsx) or CSV (.csv)</p>
            </>
          )}
        </div>
      </div>
      <div className="instructions">
        <h3>How to export your LinkedIn data:</h3>
        <ol>
          <li>Navigate to <a href="https://www.linkedin.com/analytics/creator" target="_blank" rel="noreferrer">LinkedIn Analytics</a></li>
          <li>Click on <b>Impressions</b> to open the dropdown menu</li>
          <li>Select <b>Engagements</b> from the dropdown to switch modes</li>
          <li>Find the date range selector (currently showing <b>Past 7 days</b>)</li>
          <li>Click on it and change the date range to <b>Past 365 days</b></li>
          <li>Click <b>Export</b> in the top right</li>
          <li>Upload the file here!</li>
        </ol>
      </div>
    </div>
  );
};
